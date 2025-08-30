'use server';
/**
 * @fileOverview A Genkit flow for suggesting ICD-10 codes based on a diagnosis.
 *
 * - suggestIcd10 - A function that suggests ICD-10 codes.
 * - SuggestIcd10Input - The input type for the suggestIcd10 function.
 * - SuggestIcd10Output - The return type for the suggestIcd10 function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestIcd10InputSchema = z.object({
  diagnosisQuery: z.string().describe('The diagnosis description to search for.'),
});
export type SuggestIcd10Input = z.infer<typeof SuggestIcd10InputSchema>;

const Icd10SuggestionSchema = z.object({
    code: z.string().describe('The ICD-10 code.'),
    description: z.string().describe('The description of the ICD-10 code.'),
});

const SuggestIcd10OutputSchema = z.object({
  suggestions: z.array(Icd10SuggestionSchema).describe('A list of suggested ICD-10 codes.'),
});
export type SuggestIcd10Output = z.infer<typeof SuggestIcd10OutputSchema>;


export async function suggestIcd10(input: SuggestIcd10Input): Promise<SuggestIcd10Output> {
  return suggestIcd10Flow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestIcd10Prompt',
  input: {schema: SuggestIcd10InputSchema},
  output: {schema: SuggestIcd10OutputSchema},
  prompt: `Anda adalah seorang ahli koding medis yang sangat terlatih dengan standar ICD-10.
  Tugas Anda adalah untuk memberikan daftar 5 (lima) saran kode ICD-10 yang paling relevan berdasarkan deskripsi diagnosis yang diberikan oleh pengguna.

  Deskripsi Diagnosis Pengguna:
  {{{diagnosisQuery}}}

  Berikan jawaban Anda dalam format JSON yang telah ditentukan. Pastikan deskripsi kode akurat dan sesuai dengan standar ICD-10.
  `,
});

const suggestIcd10Flow = ai.defineFlow(
  {
    name: 'suggestIcd10Flow',
    inputSchema: SuggestIcd10InputSchema,
    outputSchema: SuggestIcd10OutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
