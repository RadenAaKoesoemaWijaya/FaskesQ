/**
 * @fileOverview Enhanced type definitions for multi-mode supporting examinations flow.
 * This file contains improved schemas for flexible AI recommendations.
 */

import {z} from 'genkit';

// Enhanced differential diagnosis schema with better structure
export const EnhancedDifferentialDiagnosisSchema = z.object({
  diagnosis: z.string().describe('The differential diagnosis'),
  confidence: z.number().min(0).max(100).describe('Confidence level (0-100%)'),
  priority: z.enum(['High', 'Medium', 'Low']).describe('Clinical priority level'),
  reasoning: z.string().describe('Clinical reasoning for this diagnosis'),
  icd10Code: z.string().optional().describe('Optional ICD-10 code'),
});

// Context information for better recommendations
const ClinicalContextSchema = z.object({
  patientAge: z.number().optional().describe('Patient age in years'),
  patientGender: z.enum(['Male', 'Female', 'Other']).optional().describe('Patient gender'),
  specialization: z.enum(['General', 'Internal', 'Pediatric', 'Surgical', 'Emergency', 'Obstetric']).optional().describe('Medical specialization context'),
  urgency: z.enum(['Routine', 'Urgent', 'Emergency']).default('Routine').describe('Clinical urgency level'),
  previousExaminations: z.array(z.string()).optional().describe('List of previous examinations'),
});

// Input schemas for different recommendation modes
export const QuickRecommendationInputSchema = z.object({
  mainComplaint: z.string().describe('Patient\'s main complaint or symptom'),
  diagnosis: z.string().optional().describe('Primary diagnosis or suspected condition'),
  context: ClinicalContextSchema.optional().describe('Clinical context information'),
});

export const StandardRecommendationInputSchema = z.object({
  anamnesis: z.string().describe('Summary of patient\'s complaints and medical history'),
  physicalExam: z.string().describe('Summary of physical examination findings'),
  differentialDiagnoses: z.array(EnhancedDifferentialDiagnosisSchema).optional().describe('List of differential diagnoses'),
  context: ClinicalContextSchema.optional().describe('Clinical context information'),
});

export const ComprehensiveRecommendationInputSchema = z.object({
  anamnesis: z.string().describe('Complete anamnesis including HPI, past medical history, etc.'),
  physicalExam: z.string().describe('Complete physical examination findings'),
  differentialDiagnoses: z.array(EnhancedDifferentialDiagnosisSchema).describe('Comprehensive differential diagnoses'),
  supportingFindings: z.string().optional().describe('Any existing supporting examination findings'),
  context: ClinicalContextSchema.describe('Complete clinical context'),
});

// Union type for all input modes
export const EnhancedSupportingExaminationsInputSchema = z.union([
  QuickRecommendationInputSchema,
  StandardRecommendationInputSchema,
  ComprehensiveRecommendationInputSchema,
]);

// Enhanced output schema with confidence scoring
export const EnhancedExaminationRecommendationSchema = z.object({
  examination: z.string().describe('Name of the recommended examination'),
  category: z.enum(['Laboratory', 'Radiology', 'Cardiology', 'Pulmonology', 'Neurology', 'Other']).describe('Medical category'),
  priority: z.enum(['High', 'Medium', 'Low']).describe('Recommendation priority'),
  confidence: z.number().min(0).max(100).describe('AI confidence level (0-100%)'),
  reasoning: z.string().describe('Clinical reasoning for this recommendation'),
  differentialDiagnoses: z.array(z.string()).describe('Which differential diagnoses this helps evaluate'),
  alternatives: z.array(z.string()).optional().describe('Alternative examinations if this is unavailable'),
  contraindications: z.array(z.string()).optional().describe('Potential contraindications to consider'),
});

export const EnhancedSupportingExaminationsOutputSchema = z.object({
  recommendations: z.array(EnhancedExaminationRecommendationSchema).describe('List of recommended examinations'),
  dataCompleteness: z.number().min(0).max(100).describe('Percentage of data completeness used for recommendations'),
  recommendationMode: z.enum(['Quick', 'Standard', 'Comprehensive']).describe('Which mode was used'),
  confidenceLevel: z.enum(['High', 'Medium', 'Low']).describe('Overall confidence level'),
  missingData: z.array(z.string()).optional().describe('List of missing data that could improve recommendations'),
  clinicalNotes: z.string().optional().describe('Additional clinical notes or warnings'),
});

// Type exports
export type QuickRecommendationInput = z.infer<typeof QuickRecommendationInputSchema>;
export type StandardRecommendationInput = z.infer<typeof StandardRecommendationInputSchema>;
export type ComprehensiveRecommendationInput = z.infer<typeof ComprehensiveRecommendationInputSchema>;
export type EnhancedSupportingExaminationsInput = z.infer<typeof EnhancedSupportingExaminationsInputSchema>;
export type EnhancedExaminationRecommendation = z.infer<typeof EnhancedExaminationRecommendationSchema>;
export type EnhancedSupportingExaminationsOutput = z.infer<typeof EnhancedSupportingExaminationsOutputSchema>;

// Validation result type for smart validation
export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  missingFields: string[];
  warnings: string[];
  recommendationMode: 'Quick' | 'Standard' | 'Comprehensive';
  confidenceLevel: 'High' | 'Medium' | 'Low';
}