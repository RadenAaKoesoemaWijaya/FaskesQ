'use server';
/**
 * @fileOverview A Genkit flow for completing a medical resume based on examination data.
 *
 * - completeMedicalResume - A function that generates a medical resume summary.
 * - CompleteMedicalResumeInput - The input type for the completeMedicalResume function.
 * - CompleteMedicalResumeOutput - The return type for the completeMedicalResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CompleteMedicalResumeInputSchema = z.object({
  anamnesis: z.string().describe('Hasil anamnesis atau wawancara dengan pasien.'),
  physicalExamination: z.string().describe('Hasil pemeriksaan fisik pasien.'),
  supportingExaminations: z.string().describe('Hasil pemeriksaan penunjang (lab, radiologi, dll.).'),
  diagnosis: z.string().describe('Diagnosis yang ditegakkan oleh dokter.'),
  prescriptionsAndActions: z.string().describe('Obat yang diresepkan dan tindakan medis yang diberikan.'),
});
export type CompleteMedicalResumeInput = z.infer<typeof CompleteMedicalResumeInputSchema>;

const CompleteMedicalResumeOutputSchema = z.object({
  medicalResume: z.string().describe('Ringkasan naratif dari keseluruhan kondisi pasien, pemeriksaan, dan rencana perawatan untuk dijadikan resume medis.'),
});
export type CompleteMedicalResumeOutput = z.infer<typeof CompleteMedicalResumeOutputSchema>;

export async function completeMedicalResume(input: CompleteMedicalResumeInput): Promise<CompleteMedicalResumeOutput> {
  return completeMedicalResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'completeMedicalResumePrompt',
  input: {schema: CompleteMedicalResumeInputSchema},
  output: {schema: CompleteMedicalResumeOutputSchema},
  prompt: `Anda adalah asisten AI medis yang cerdas. Tugas Anda adalah membuat resume medis yang ringkas dan komprehensif dalam Bahasa Indonesia berdasarkan data pemeriksaan yang diberikan.

  Data Pemeriksaan:
  - Anamnesis: {{{anamnesis}}}
  - Pemeriksaan Fisik: {{{physicalExamination}}}
  - Pemeriksaan Penunjang: {{{supportingExaminations}}}
  - Diagnosis: {{{diagnosis}}}
  - Peresepan dan Tindakan: {{{prescriptionsAndActions}}}

  Buatlah sebuah paragraf resume medis yang merangkum semua informasi di atas secara naratif dan jelas.
  Fokus pada poin-poin paling penting yang harus diketahui untuk kunjungan selanjutnya atau rujukan.
  Gunakan gaya bahasa medis yang profesional.
  `,
});

const completeMedicalResumeFlow = ai.defineFlow(
  {
    name: 'completeMedicalResumeFlow',
    inputSchema: CompleteMedicalResumeInputSchema,
    outputSchema: CompleteMedicalResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
