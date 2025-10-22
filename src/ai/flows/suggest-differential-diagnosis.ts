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
  diagnoses: z.array(z.object({
    diagnosis: z.string().describe('The name of the possible diagnosis.'),
    confidence: z.number().describe('The confidence score of the AI in this diagnosis, as a percentage (0-100).'),
    priority: z.enum(['High', 'Medium', 'Low']).describe('The priority of the diagnosis based on urgency and likelihood.'),
    reasoning: z.string().describe('The reasoning behind the suggested diagnosis, confidence, and priority.')
  })).describe('A list of 5 most likely differential diagnoses with confidence scores and priority levels.')
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

  Untuk setiap diagnosis, sertakan:
  1.  Nama diagnosis.
  2.  Tingkat keyakinan (confidence score) dalam persentase (0-100) yang menunjukkan seberapa yakin Anda dengan diagnosis tersebut.
  3.  Tingkat prioritas ('High', 'Medium', atau 'Low') berdasarkan urgensi, keparahan, dan kecocokan gejala.
  4.  Alasan singkat (reasoning) mengapa Anda menyarankan diagnosis ini, termasuk gejala atau temuan yang paling mendukung.

  Data Klinis:
  - Anamnesis: {{{anamnesis}}}
  - Pemeriksaan Fisik: {{{physicalExam}}}

  Tugas Anda adalah untuk menganalisis data ini dan menghasilkan daftar diagnosis banding yang terstruktur untuk membantu dokter dalam proses diagnostik.
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
