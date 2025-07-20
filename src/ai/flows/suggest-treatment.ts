'use server';
/**
 * @fileOverview Provides treatment suggestions based on patient examination findings and history.
 *
 * - suggestTreatmentOptions - A function that suggests treatment options based on patient data.
 * - SuggestTreatmentOptionsInput - The input type for the suggestTreatmentOptions function.
 * - SuggestTreatmentOptionsOutput - The return type for the suggestTreatmentOptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTreatmentOptionsInputSchema = z.object({
  examinationFindings: z.string().describe('Detailed findings from the patient examination.'),
  patientHistory: z.string().describe('The patient medical history, including past illnesses, treatments, and allergies.'),
  patientAge: z.number().describe('The age of the patient.'),
  patientGender: z.string().describe('The gender of the patient.'),
});
export type SuggestTreatmentOptionsInput = z.infer<typeof SuggestTreatmentOptionsInputSchema>;

const SuggestTreatmentOptionsOutputSchema = z.object({
  treatmentSuggestions: z.array(
    z.object({
      treatmentName: z.string().describe('The name of the suggested treatment.'),
      description: z.string().describe('A detailed description of the treatment and its benefits.'),
      risks: z.string().describe('Potential risks and side effects associated with the treatment.'),
      evidenceLevel: z.string().describe('The level of evidence supporting the treatment (e.g., high, moderate, low).'),
    })
  ).describe('A list of potential treatment options with descriptions, risks, and evidence levels.'),
  additionalRecommendations: z.string().describe('Any additional recommendations or considerations for the healthcare provider.'),
});
export type SuggestTreatmentOptionsOutput = z.infer<typeof SuggestTreatmentOptionsOutputSchema>;

export async function suggestTreatmentOptions(input: SuggestTreatmentOptionsInput): Promise<SuggestTreatmentOptionsOutput> {
  return suggestTreatmentOptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTreatmentOptionsPrompt',
  input: {schema: SuggestTreatmentOptionsInputSchema},
  output: {schema: SuggestTreatmentOptionsOutputSchema},
  prompt: `You are an AI assistant designed to help healthcare providers suggest potential treatment options based on patient information.

  Given the following patient examination findings and medical history, suggest a list of potential treatment options.
  Include a description of each treatment, potential risks, and the level of evidence supporting its use.
  Also, provide any additional recommendations or considerations for the healthcare provider.

  Examination Findings: {{{examinationFindings}}}
  Patient History: {{{patientHistory}}}
  Patient Age: {{{patientAge}}}
  Patient Gender: {{{patientGender}}}

  Format your output as a JSON object with the following structure:
  {
    "treatmentSuggestions": [
      {
        "treatmentName": "",
        "description": "",
        "risks": "",
        "evidenceLevel": ""
      }
    ],
    "additionalRecommendations": ""
  }`,
});

const suggestTreatmentOptionsFlow = ai.defineFlow(
  {
    name: 'suggestTreatmentOptionsFlow',
    inputSchema: SuggestTreatmentOptionsInputSchema,
    outputSchema: SuggestTreatmentOptionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
