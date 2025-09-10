'use server';
/**
 * @fileOverview A Genkit flow for suggesting differential diagnoses based on clinical findings.
 *
 * - suggestDifferentialDiagnosis - A function that suggests possible diagnoses.
 * - SuggestDifferentialDiagnosisInput - The input type for the suggestDifferentialDiagnosis function.
 * - SuggestDifferentialDiagnosisOutput - The return type for the suggestDifferentialDiagnosis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDifferentialDiagnosisInputSchema = z.object({
  anamnesis: z.string().describe('A summary of the patient\'s complaints and medical history (anamnesis).'),
  physicalExam: z.string().describe('A summary of the findings from the physical examination.'),
});
export type SuggestDifferentialDiagnosisInput = z.infer<typeof SuggestDifferentialDiagnosisInputSchema>;

const SuggestDifferentialDiagnosisOutputSchema = z.object({
  diagnoses: z.array(z.string()).describe('A list of 5 most likely differential diagnoses based on the provided clinical data.'),
});
export type SuggestDifferentialDiagnosisOutput = z.infer<typeof SuggestDifferentialDiagnosisOutputSchema>;


export async function suggestDifferentialDiagnosis(input: SuggestDifferentialDiagnosisInput): Promise<SuggestDifferentialDiagnosisOutput> {
  return suggestDifferentialDiagnosisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDifferentialDiagnosisPrompt',
  input: {schema: SuggestDifferentialDiagnosisInputSchema},
  output: {schema: SuggestDifferentialDiagnosisOutputSchema},
  prompt: `Anda adalah AI asisten medis yang berfungsi sebagai sistem pendukung keputusan klinis.
  Berdasarkan data anamnesis dan pemeriksaan fisik yang diberikan, berikan daftar 5 (lima) kemungkinan diagnosis banding yang paling relevan.

  Data Klinis:
  - Anamnesis: {{{anamnesis}}}
  - Pemeriksaan Fisik: {{{physicalExam}}}

  Tugas Anda adalah untuk menganalisis data ini dan menghasilkan daftar diagnosis banding yang logis untuk membantu dokter dalam proses diagnostik.
  Hanya berikan nama diagnosisnya saja.
  `,
});

const suggestDifferentialDiagnosisFlow = ai.defineFlow(
  {
    name: 'suggestDifferentialDiagnosisFlow',
    inputSchema: SuggestDifferentialDiagnosisInputSchema,
    outputSchema: SuggestDifferentialDiagnosisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
