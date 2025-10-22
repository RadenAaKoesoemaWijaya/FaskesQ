/**
 * @fileOverview Type definitions and schemas for differential diagnosis flow.
 * This file contains non-server exports to avoid "use server" conflicts.
 */

import {z} from 'genkit';

export const SuggestDifferentialDiagnosisInputSchema = z.object({
  anamnesis: z.string().describe('A summary of the patient\'s complaints and medical history.'),
  physicalExam: z.string().optional().describe('A summary of the findings from the physical examination.'),
});
export type SuggestDifferentialDiagnosisInput = z.infer<typeof SuggestDifferentialDiagnosisInputSchema>;

export const SuggestDifferentialDiagnosisOutputSchema = z.object({
  diagnoses: z.array(z.object({
    diagnosis: z.string().describe('The name of the potential diagnosis.'),
    confidence: z.number().min(0).max(100).describe('A confidence score (0-100) for this diagnosis.'),
    reasoning: z.string().describe('A brief clinical reasoning for this diagnosis based on the provided data.'),
  })).describe('A list of potential differential diagnoses.'),
});
export type SuggestDifferentialDiagnosisOutput = z.infer<typeof SuggestDifferentialDiagnosisOutputSchema>;