'use server';
/**
 * @fileOverview A Genkit flow for generating patient education material based on a diagnosis.
 */

import {ai} from '@/ai/genkit';
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

export async function suggestPatientEducation(input: SuggestPatientEducationInput): Promise<SuggestPatientEducationOutput> {
  return suggestPatientEducationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPatientEducationPrompt',
  input: {schema: SuggestPatientEducationInputSchema},
  output: {schema: SuggestPatientEducationOutputSchema},
  prompt: `Anda adalah AI asisten medis yang ahli dalam komunikasi dan edukasi pasien.

  Berdasarkan diagnosis utama pasien, tugas Anda adalah membuat draf edukasi pasien yang jelas, ringkas, dan mudah dipahami oleh orang awam. Gunakan bahasa yang empatik dan hindari jargon medis yang rumit.

  **Diagnosis Utama Pasien:**
  {{diagnosis}}

  **Konteks Klinis (jika ada):**
  - Anamnesis: {{{anamnesis}}}
  - Pemeriksaan Fisik: {{{physicalExam}}}

  Hasilkan draf edukasi yang mencakup empat bagian utama berikut:

  1.  **Penjelasan Penyakit (`diseaseExplanation`):** Jelaskan secara singkat apa itu penyakit ini, apa penyebab umumnya, dan bagaimana gejalanya bisa muncul. Contoh: \"Hipertensi atau tekanan darah tinggi adalah kondisi di mana...\"

  2.  **Rencana Pengobatan (`treatmentPlan`):** Jelaskan secara umum rencana pengobatan yang akan dijalani pasien. Contoh: \"Kami akan memulai pengobatan dengan obat X untuk membantu mengontrol tekanan darah Anda. Selain itu, kami juga akan...\"

  3.  **Anjuran Perawatan di Rumah (`homeCareAdvice`):** Berikan poin-poin anjuran praktis yang bisa dilakukan pasien di rumah, seperti istirahat, diet, aktivitas fisik, atau cara minum obat.

  4.  **Tanda Bahaya (`warningSigns`):** Jelaskan tanda-tanda bahaya spesifik yang mengharuskan pasien untuk segera kembali ke dokter atau fasilitas kesehatan. Contoh: \"Segera kembali ke dokter jika Anda mengalami sakit kepala hebat, pandangan kabur, atau nyeri dada.\"

  Pastikan output Anda terstruktur sesuai format yang diminta.
  `,
});

const suggestPatientEducationFlow = ai.defineFlow(
  {
    name: 'suggestPatientEducationFlow',
    inputSchema: SuggestPatientEducationInputSchema,
    outputSchema: SuggestPatientEducationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
