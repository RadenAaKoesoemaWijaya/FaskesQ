'use server';
/**
 * @fileOverview A Genkit flow for generating patient education material based on a diagnosis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
  SuggestPatientEducationInputSchema, 
  SuggestPatientEducationOutputSchema,
  type SuggestPatientEducationInput,
  type SuggestPatientEducationOutput
} from './suggest-patient-education-types';

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

  1.  **Penjelasan Penyakit (\`diseaseExplanation\`):** Jelaskan secara singkat apa itu penyakit ini, apa penyebab umumnya, dan bagaimana gejalanya bisa muncul. Contoh: \"Hipertensi atau tekanan darah tinggi adalah kondisi di mana...\"

  2.  **Rencana Pengobatan (\`treatmentPlan\`):** Jelaskan secara umum rencana pengobatan yang akan dijalani pasien. Contoh: \"Kami akan memulai pengobatan dengan obat X untuk membantu mengontrol tekanan darah Anda. Selain itu, kami juga akan...\"

  3.  **Anjuran Perawatan di Rumah (\`homeCareAdvice\`):** Berikan poin-poin anjuran praktis yang bisa dilakukan pasien di rumah, seperti istirahat, diet, aktivitas fisik, atau cara minum obat.

  4.  **Tanda Bahaya (\`warningSigns\`):** Jelaskan tanda-tanda bahaya spesifik yang mengharuskan pasien untuk segera kembali ke dokter atau fasilitas kesehatan. Contoh: \"Segera kembali ke dokter jika Anda mengalami sakit kepala hebat, pandangan kabur, atau nyeri dada.\"

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
