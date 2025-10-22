'use server';
/**
 * @fileOverview A Genkit flow for suggesting supporting examinations based on clinical data and differential diagnoses.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {SuggestDifferentialDiagnosisOutputSchema} from './suggest-differential-diagnosis';

export const SuggestSupportingExaminationsInputSchema = z.object({
  anamnesis: z.string().describe('A summary of the patient\'s complaints and medical history (anamnesis).'),
  physicalExam: z.string().describe('A summary of the findings from the physical examination.'),
  differentialDiagnoses: SuggestDifferentialDiagnosisOutputSchema.shape.diagnoses.describe('A list of potential differential diagnoses with their confidence and priority.'),
});
export type SuggestSupportingExaminationsInput = z.infer<typeof SuggestSupportingExaminationsInputSchema>;

export const SuggestSupportingExaminationsOutputSchema = z.object({
  examinations: z.array(z.object({
    examinationName: z.string().describe('The name of the recommended examination.'),
    importance: z.enum(['Wajib', 'Disarankan', 'Opsional']).describe('The level of importance for the examination (Required, Recommended, Optional).'),
    reasoning: z.string().describe('A brief clinical reasoning for recommending this examination.'),
  })).describe('A list of relevant supporting examinations.'),
});
export type SuggestSupportingExaminationsOutput = z.infer<typeof SuggestSupportingExaminationsOutputSchema>;


export async function suggestSupportingExaminations(input: SuggestSupportingExaminationsInput): Promise<SuggestSupportingExaminationsOutput> {
  return suggestSupportingExaminationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSupportingExaminationsPrompt',
  input: {schema: SuggestSupportingExaminationsInputSchema},
  output: {schema: SuggestSupportingExaminationsOutputSchema},
  prompt: `Anda adalah AI asisten medis canggih yang berfungsi sebagai sistem pendukung keputusan klinis.

  Berdasarkan data anamnesis, pemeriksaan fisik, dan daftar diagnosis banding yang diberikan, berikan rekomendasi pemeriksaan penunjang yang paling relevan.

  Untuk setiap rekomendasi pemeriksaan, sertakan:
  1.  **Nama Pemeriksaan**: Nama tes atau prosedur yang spesifik.
  2.  **Tingkat Kepentingan**: Klasifikasikan sebagai 'Wajib', 'Disarankan', atau 'Opsional'.
  3.  **Alasan Klinis (Reasoning)**: Penjelasan medis singkat mengapa pemeriksaan ini direkomendasikan.

  **Data Klinis Pasien:**
  - Anamnesis: {{{anamnesis}}}
  - Pemeriksaan Fisik: {{{physicalExam}}}

  **Kemungkinan Diagnosis Banding:**
  {{#each differentialDiagnoses}}
  - Diagnosis: {{this.diagnosis}} (Prioritas: {{this.priority}})
  {{/each}}

  Tugas Anda adalah menghasilkan daftar pemeriksaan penunjang yang terstruktur dan terprioritaskan.

  PENTING: Untuk 'Nama Pemeriksaan', jika memungkinkan, gunakan nama-nama standar dari daftar berikut:
  - Laboratorium: Darah Lengkap, Urinalisa, Kimia Darah, Mikroskopis, Imunologi (Rapid Test)
  - Radiologi: Rontgen (X-Ray), CT Scan, MRI, USG (Ultrasonografi), PET Scan
  - Lainnya: EKG (Elektrokardiogram), EEG (Elektroensefalogram), EMG (Elektromiogram)
  Jika pemeriksaan yang Anda rekomendasikan tidak ada dalam daftar, gunakan nama medis yang umum.
  `,
});

const suggestSupportingExaminationsFlow = ai.defineFlow(
  {
    name: 'suggestSupportingExaminationsFlow',
    inputSchema: SuggestSupportingExaminationsInputSchema,
    outputSchema: SuggestSupportingExaminationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
