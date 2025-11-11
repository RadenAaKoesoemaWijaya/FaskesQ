/**
 * @fileOverview Integration utility for connecting with differential diagnosis flow.
 * Provides seamless integration between diagnosis and examination recommendation flows.
 */

import { suggestDifferentialDiagnosis } from './suggest-differential-diagnosis';
import { EnhancedDifferentialDiagnosisSchema } from './enhanced-supporting-examinations-types';
import { z } from 'genkit';

export interface DiagnosisIntegrationConfig {
  enableFallback: boolean;
  confidenceThreshold: number;
  maxDiagnoses: number;
  includeReasoning: boolean;
}

export class DiagnosisIntegration {
  private static readonly DEFAULT_CONFIG: DiagnosisIntegrationConfig = {
    enableFallback: true,
    confidenceThreshold: 60,
    maxDiagnoses: 5,
    includeReasoning: true,
  };

  /**
   * Get enhanced differential diagnoses from the differential diagnosis flow
   */
  static async getEnhancedDiagnoses(
    anamnesis: string,
    physicalExam: string,
    config: Partial<DiagnosisIntegrationConfig> = {}
  ): Promise<Array<z.infer<typeof EnhancedDifferentialDiagnosisSchema>>> {
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    try {
      // Call the existing differential diagnosis flow
      const diagnosisResult = await suggestDifferentialDiagnosis({
        anamnesis,
        physicalExam,
      });

      if (!diagnosisResult.diagnoses || diagnosisResult.diagnoses.length === 0) {
        if (fullConfig.enableFallback) {
          return this.generateFallbackDiagnoses(anamnesis, physicalExam);
        }
        return [];
      }

      // Transform to enhanced format
      const enhancedDiagnoses = diagnosisResult.diagnoses
        .filter(diagnosis => diagnosis.confidence >= fullConfig.confidenceThreshold)
        .slice(0, fullConfig.maxDiagnoses)
        .map(diagnosis => ({
          diagnosis: diagnosis.diagnosis,
          confidence: diagnosis.confidence,
          priority: this.mapConfidenceToPriority(diagnosis.confidence),
          reasoning: fullConfig.includeReasoning ? diagnosis.reasoning : '',
        }));

      return enhancedDiagnoses;
    } catch (error) {
      console.error('Error getting differential diagnoses:', error);
      if (fullConfig.enableFallback) {
        return this.generateFallbackDiagnoses(anamnesis, physicalExam);
      }
      throw new Error(`Failed to get differential diagnoses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate fallback diagnoses when AI flow fails or returns insufficient results
   */
  private static generateFallbackDiagnoses(
    anamnesis: string,
    physicalExam: string
  ): Array<z.infer<typeof EnhancedDifferentialDiagnosisSchema>> {
    // Simple keyword-based fallback for common conditions
    const keywords = [
      { word: 'nyeri dada', diagnosis: 'Chest Pain - Acute Coronary Syndrome', confidence: 70 },
      { word: 'demam', diagnosis: 'Fever - Infection', confidence: 65 },
      { word: 'sesak', diagnosis: 'Dyspnea - Respiratory Disorder', confidence: 75 },
      { word: 'sakit kepala', diagnosis: 'Headache - Primary vs Secondary', confidence: 60 },
      { word: 'diare', diagnosis: 'Diarrhea - Infectious vs Non-infectious', confidence: 65 },
      { word: 'muntah', diagnosis: 'Vomiting - GI vs Systemic', confidence: 60 },
      { word: 'nyeri perut', diagnosis: 'Abdominal Pain - Surgical vs Medical', confidence: 70 },
      { word: 'pusing', diagnosis: 'Dizziness - Vestibular vs Cardiovascular', confidence: 65 },
    ];

    const combinedText = `${anamnesis} ${physicalExam}`.toLowerCase();
    const matchedKeywords = keywords.filter(kw => combinedText.includes(kw.word));

    if (matchedKeywords.length === 0) {
      return [{
        diagnosis: 'General Medical Condition - Requires Further Evaluation',
        confidence: 50,
        priority: 'Medium' as const,
        reasoning: 'Based on general symptoms - further evaluation needed',
      }];
    }

    return matchedKeywords.map(kw => ({
      diagnosis: kw.diagnosis,
      confidence: kw.confidence,
      priority: this.mapConfidenceToPriority(kw.confidence),
      reasoning: `Identified keyword: "${kw.word}" in clinical presentation`,
    }));
  }

  /**
   * Map confidence score to priority level
   */
  private static mapConfidenceToPriority(confidence: number): 'High' | 'Medium' | 'Low' {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  }

  /**
   * Validate the quality of differential diagnoses
   */
  static validateDiagnosesQuality(diagnoses: Array<z.infer<typeof EnhancedDifferentialDiagnosisSchema>>): {
    isValid: boolean;
    qualityScore: number;
    issues: string[];
  } {
    if (!diagnoses || diagnoses.length === 0) {
      return {
        isValid: false,
        qualityScore: 0,
        issues: ['No differential diagnoses provided'],
      };
    }

    let qualityScore = 0;
    const issues: string[] = [];

    diagnoses.forEach((diagnosis, index) => {
      // Check confidence
      if (diagnosis.confidence < 50) {
        issues.push(`Diagnosis ${index + 1} has low confidence (${diagnosis.confidence}%)`);
      } else if (diagnosis.confidence >= 80) {
        qualityScore += 20;
      } else {
        qualityScore += 10;
      }

      // Check reasoning
      if (!diagnosis.reasoning || diagnosis.reasoning.trim().length < 10) {
        issues.push(`Diagnosis ${index + 1} lacks sufficient reasoning`);
      } else {
        qualityScore += 15;
      }

      // Check diagnosis description
      if (!diagnosis.diagnosis || diagnosis.diagnosis.trim().length < 3) {
        issues.push(`Diagnosis ${index + 1} has invalid description`);
      } else {
        qualityScore += 15;
      }
    });

    // Bonus for variety and number
    if (diagnoses.length >= 3) qualityScore += 10;
    if (diagnoses.length >= 5) qualityScore += 10;

    const maxPossibleScore = diagnoses.length * 50 + 20;
    const normalizedScore = Math.round((qualityScore / maxPossibleScore) * 100);

    return {
      isValid: normalizedScore >= 60,
      qualityScore: normalizedScore,
      issues,
    };
  }

  /**
   * Enhance diagnoses with additional clinical context
   */
  static enhanceWithClinicalContext(
    diagnoses: Array<z.infer<typeof EnhancedDifferentialDiagnosisSchema>>,
    patientAge?: number,
    patientGender?: string,
    specialization?: string
  ): Array<z.infer<typeof EnhancedDifferentialDiagnosisSchema>> {
    return diagnoses.map(diagnosis => {
      let enhancedReasoning = diagnosis.reasoning;

      // Add age-specific considerations
      if (patientAge !== undefined) {
        if (patientAge < 18) {
          enhancedReasoning += ' [Consider pediatric-specific manifestations]';
        } else if (patientAge > 65) {
          enhancedReasoning += ' [Consider geriatric considerations and comorbidities]';
        }
      }

      // Add gender-specific considerations
      if (patientGender) {
        if (patientGender.toLowerCase() === 'female') {
          enhancedReasoning += ' [Consider gender-specific risk factors and presentations]';
        }
      }

      // Add specialization context
      if (specialization) {
        enhancedReasoning += ` [${specialization} perspective]`;
      }

      return {
        ...diagnosis,
        reasoning: enhancedReasoning,
      };
    });
  }
}