'use server';
/**
 * @fileOverview A Genkit flow for suggesting supporting examinations based on clinical data and differential diagnoses.
 */

import {ai} from '@/ai/genkit';
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

export async function suggestSupportingExaminations(input: SuggestSupportingExaminationsInput): Promise<SuggestSupportingExaminationsOutput> {
  return suggestSupportingExaminationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSupportingExaminationsPrompt',
  input: {schema: SuggestSupportingExaminationsInputSchema},
  output: {schema: SuggestSupportingExaminationsOutputSchema},
  prompt: `Anda adalah AI asisten medis yang ahli dalam strategi diagnostik.

  Berdasarkan data klinis pasien dan daftar diagnosis banding yang telah dibuat, tugas Anda adalah merekomendasikan pemeriksaan penunjang yang paling relevan untuk membantu menegakkan diagnosis definitif.

  **Data Klinis Pasien:**
  - Anamnesis: {{{anamnesis}}}
  - Pemeriksaan Fisik: {{{physicalExam}}}

  **Daftar Diagnosis Banding (dari AI sebelumnya):**
  {{#each differentialDiagnoses}}
  - Diagnosis: {{this.diagnosis}} (Keyakinan: {{this.confidence}}%)
    Alasan: {{this.reasoning}}
  {{/each}}

  Tugas Anda adalah menghasilkan daftar rekomendasi pemeriksaan penunjang.

  Untuk setiap pemeriksaan yang Anda rekomendasikan, berikan informasi berikut:
  1.  **Pemeriksaan (\`examination\`)**: Nama pemeriksaan (Contoh: Darah Lengkap, Foto Thorax, EKG).
  2.  **Alasan (\`reasoning\`)**: Jelaskan secara singkat dan jelas bagaimana pemeriksaan ini akan membantu membedakan diagnosis banding. Sebutkan diagnosis mana yang bisa dikonfirmasi atau disingkirkan dengan hasil pemeriksaan tersebut.

  Berikan 2-4 rekomendasi pemeriksaan yang paling krusial dan memiliki dampak diagnostik tertinggi.

  Pastikan output Anda terstruktur sesuai format yang diminta.
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
