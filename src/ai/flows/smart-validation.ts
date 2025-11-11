/**
 * @fileOverview Smart validation utility for enhanced supporting examinations.
 * Provides intelligent validation with scoring and progressive recommendations.
 */

import { ValidationResult } from './enhanced-supporting-examinations-types';

interface ValidationInput {
  anamnesis?: string;
  physicalExam?: string;
  mainComplaint?: string;
  diagnosis?: string;
  differentialDiagnoses?: Array<{
    diagnosis: string;
    confidence: number;
    priority: string;
    reasoning: string;
  }>;
  patientAge?: number;
  patientGender?: string;
  specialization?: string;
}

export class SmartValidation {
  private static readonly FIELD_WEIGHTS = {
    mainComplaint: 30,
    diagnosis: 25,
    anamnesis: 20,
    physicalExam: 15,
    differentialDiagnoses: 10,
  };

  private static readonly MIN_SCORES = {
    Quick: 30,
    Standard: 60,
    Comprehensive: 80,
  };

  static validate(input: ValidationInput): ValidationResult {
    const scores = this.calculateScores(input);
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const missingFields = this.getMissingFields(input);
    const warnings = this.generateWarnings(input, totalScore);
    const recommendationMode = this.determineRecommendationMode(totalScore, missingFields);
    const confidenceLevel = this.determineConfidenceLevel(totalScore, recommendationMode);

    return {
      isValid: totalScore >= this.MIN_SCORES[recommendationMode],
      score: Math.round(totalScore),
      missingFields,
      warnings,
      recommendationMode,
      confidenceLevel,
    };
  }

  private static calculateScores(input: ValidationInput): Record<string, number> {
    const scores: Record<string, number> = {};

    // Main complaint scoring
    if (input.mainComplaint && input.mainComplaint.trim().length > 10) {
      scores.mainComplaint = this.FIELD_WEIGHTS.mainComplaint;
    } else if (input.mainComplaint && input.mainComplaint.trim().length > 0) {
      scores.mainComplaint = this.FIELD_WEIGHTS.mainComplaint * 0.5;
    } else {
      scores.mainComplaint = 0;
    }

    // Diagnosis scoring
    if (input.diagnosis && input.diagnosis.trim().length > 3) {
      scores.diagnosis = this.FIELD_WEIGHTS.diagnosis;
    } else {
      scores.diagnosis = 0;
    }

    // Anamnesis scoring
    if (input.anamnesis && input.anamnesis.trim().length > 50) {
      scores.anamnesis = this.FIELD_WEIGHTS.anamnesis;
    } else if (input.anamnesis && input.anamnesis.trim().length > 20) {
      scores.anamnesis = this.FIELD_WEIGHTS.anamnesis * 0.7;
    } else if (input.anamnesis && input.anamnesis.trim().length > 0) {
      scores.anamnesis = this.FIELD_WEIGHTS.anamnesis * 0.3;
    } else {
      scores.anamnesis = 0;
    }

    // Physical exam scoring
    if (input.physicalExam && input.physicalExam.trim().length > 50) {
      scores.physicalExam = this.FIELD_WEIGHTS.physicalExam;
    } else if (input.physicalExam && input.physicalExam.trim().length > 20) {
      scores.physicalExam = this.FIELD_WEIGHTS.physicalExam * 0.7;
    } else if (input.physicalExam && input.physicalExam.trim().length > 0) {
      scores.physicalExam = this.FIELD_WEIGHTS.physicalExam * 0.3;
    } else {
      scores.physicalExam = 0;
    }

    // Differential diagnoses scoring
    if (input.differentialDiagnoses && input.differentialDiagnoses.length > 0) {
      const validDiagnoses = input.differentialDiagnoses.filter(d => 
        d.diagnosis.trim().length > 2 && d.confidence > 0 && d.reasoning.trim().length > 10
      );
      scores.differentialDiagnoses = Math.min(
        this.FIELD_WEIGHTS.differentialDiagnoses,
        validDiagnoses.length * (this.FIELD_WEIGHTS.differentialDiagnoses / 3)
      );
    } else {
      scores.differentialDiagnoses = 0;
    }

    return scores;
  }

  private static getMissingFields(input: ValidationInput): string[] {
    const missing: string[] = [];

    if (!input.mainComplaint || input.mainComplaint.trim().length < 5) {
      missing.push('mainComplaint');
    }
    if (!input.diagnosis || input.diagnosis.trim().length < 3) {
      missing.push('diagnosis');
    }
    if (!input.anamnesis || input.anamnesis.trim().length < 10) {
      missing.push('anamnesis');
    }
    if (!input.physicalExam || input.physicalExam.trim().length < 10) {
      missing.push('physicalExam');
    }
    if (!input.differentialDiagnoses || input.differentialDiagnoses.length === 0) {
      missing.push('differentialDiagnoses');
    }

    return missing;
  }

  private static generateWarnings(input: ValidationInput, totalScore: number): string[] {
    const warnings: string[] = [];

    if (totalScore < 30) {
      warnings.push('Data yang tersedia sangat terbatas. Rekomendasi mungkin tidak akurat.');
    } else if (totalScore < 60) {
      warnings.push('Beberapa data penting masih kurang. Rekomendasi bersifat preliminary.');
    }

    if (input.anamnesis && input.anamnesis.length < 20) {
      warnings.push('Anamnesis terlalu singkat untuk analisis menyeluruh.');
    }

    if (input.physicalExam && input.physicalExam.length < 20) {
      warnings.push('Pemeriksaan fisik terlalu singkat untuk evaluasi lengkap.');
    }

    if (input.differentialDiagnoses && input.differentialDiagnoses.length === 0) {
      warnings.push('Tidak ada diagnosis banding yang tersedia untuk diferensiasi.');
    }

    return warnings;
  }

  private static determineRecommendationMode(score: number, missingFields: string[]): 'Quick' | 'Standard' | 'Comprehensive' {
    if (score >= this.MIN_SCORES.Comprehensive && missingFields.length <= 1) {
      return 'Comprehensive';
    } else if (score >= this.MIN_SCORES.Standard) {
      return 'Standard';
    } else {
      return 'Quick';
    }
  }

  private static determineConfidenceLevel(score: number, mode: 'Quick' | 'Standard' | 'Comprehensive'): 'High' | 'Medium' | 'Low' {
    const threshold = this.MIN_SCORES[mode];
    const normalizedScore = score / threshold;

    if (normalizedScore >= 0.9) return 'High';
    if (normalizedScore >= 0.7) return 'Medium';
    return 'Low';
  }

  static suggestDataImprovements(input: ValidationInput): string[] {
    const suggestions: string[] = [];

    if (!input.mainComplaint || input.mainComplaint.trim().length < 10) {
      suggestions.push('Tambahkan keluhan utama pasien dengan lebih detail');
    }

    if (!input.diagnosis || input.diagnosis.trim().length < 5) {
      suggestions.push('Sertakan diagnosis atau kondisi yang dicurigai');
    }

    if (!input.anamnesis || input.anamnesis.trim().length < 30) {
      suggestions.push('Lengkapi anamnesis dengan riwayat penyakit, faktor risiko, dan review of systems');
    }

    if (!input.physicalExam || input.physicalExam.trim().length < 30) {
      suggestions.push('Sertakan temuan pemeriksaan fisik lengkap');
    }

    if (!input.differentialDiagnoses || input.differentialDiagnoses.length === 0) {
      suggestions.push('Pertimbangkan diagnosis banding untuk diferensiasi yang lebih baik');
    }

    return suggestions;
  }
}