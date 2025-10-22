/**
 * @fileOverview Type definitions and schemas for supporting examinations flow.
 * This file contains non-server exports to avoid "use server" conflicts.
 */

import {z} from 'genkit';

const DifferentialDiagnosisSchema = z.object({
  diagnosis: z.string(),
  confidence: z.number(),
  reasoning: z.string(),
});

export const SuggestSupportingExaminationsInputSchema = z.object({
  anamnesis: z.string().describe('Summary of the patient\'s complaints and medical history.'),
  physicalExam: z.string().describe('Summary of physical examination findings.'),
  differentialDiagnoses: z.array(DifferentialDiagnosisSchema).describe('A list of differential diagnoses provided by a previous AI step.'),
});
export type SuggestSupportingExaminationsInput = z.infer<typeof SuggestSupportingExaminationsInputSchema>;

export const SuggestSupportingExaminationsOutputSchema = z.object({
  recommendations: z.array(z.object({
    examination: z.string().describe('Name of the recommended examination (e.g., \'Complete Blood Count\', \'Chest X-Ray\').'),
    reasoning: z.string().describe('A brief clinical reasoning for why this examination is needed to confirm or rule out specific diagnoses from the list.'),
  })).describe('A list of recommended supporting examinations.'),
});
export type SuggestSupportingExaminationsOutput = z.infer<typeof SuggestSupportingExaminationsOutputSchema>;