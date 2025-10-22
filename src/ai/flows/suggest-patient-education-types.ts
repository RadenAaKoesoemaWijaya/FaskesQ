/**
 * @fileOverview Type definitions and schemas for patient education flow.
 * This file contains non-server exports to avoid "use server" conflicts.
 */

import {z} from 'genkit';

export const SuggestPatientEducationInputSchema = z.object({
  diagnosis: z.string().describe('The final working diagnosis for the patient.'),
  anamnesis: z.string().optional().describe('A summary of the patient\'s complaints and medical history for context.'),
  physicalExam: z.string().optional().describe('A summary of physical examination findings for context.'),
});
export type SuggestPatientEducationInput = z.infer<typeof SuggestPatientEducationInputSchema>;

export const SuggestPatientEducationOutputSchema = z.object({
  diseaseExplanation: z.string().describe('A simple, easy-to-understand explanation of the disease.'),
  treatmentPlan: z.string().describe('An overview of the planned treatment, including medications and actions.'),
  homeCareAdvice: z.string().describe('Lifestyle advice, dietary recommendations, and other care instructions for the patient to follow at home.'),
  warningSigns: z.string().describe('A list of specific warning signs that should prompt the patient to seek immediate medical attention.'),
});
export type SuggestPatientEducationOutput = z.infer<typeof SuggestPatientEducationOutputSchema>;