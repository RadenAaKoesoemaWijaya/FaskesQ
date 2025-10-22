/**
 * @fileOverview Type definitions and schemas for therapy and actions flow.
 * This file contains non-server exports to avoid "use server" conflicts.
 */

import {z} from 'genkit';

export const SuggestTherapyAndActionsInputSchema = z.object({
  anamnesis: z.string().optional().describe('A summary of the patient\'s complaints and medical history.'),
  physicalExam: z.string().optional().describe('A summary of the findings from the physical examination.'),
  diagnosis: z.string().describe('The final working diagnosis for the patient (e.g., \'Hypertension Stage 2\', \'Type 2 Diabetes Mellitus\').'),
});
export type SuggestTherapyAndActionsInput = z.infer<typeof SuggestTherapyAndActionsInputSchema>;

export const SuggestTherapyAndActionsOutputSchema = z.object({
  medications: z.array(z.object({
    medicationName: z.string().describe('The name of the recommended medication.'),
    dosage: z.string().describe('The recommended dosage and frequency (e.g., \'500 mg, 3 kali sehari\').'),
    reasoning: z.string().describe('A brief clinical reasoning for recommending this medication.'),
  })).describe('A list of recommended medications.'),
  actions: z.array(z.object({
    actionName: z.string().describe('The name of the recommended medical action or procedure.'),
    reasoning: z.string().describe('A brief clinical reasoning for recommending this action.'),
  })).describe('A list of recommended medical actions or lifestyle interventions.'),
});
export type SuggestTherapyAndActionsOutput = z.infer<typeof SuggestTherapyAndActionsOutputSchema>;