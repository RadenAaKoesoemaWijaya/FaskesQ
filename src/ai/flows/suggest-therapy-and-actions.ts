'use server';
/**
 * @fileOverview A Genkit flow for suggesting medications and medical actions based on a diagnosis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
  SuggestTherapyAndActionsInputSchema, 
  SuggestTherapyAndActionsOutputSchema,
  type SuggestTherapyAndActionsInput,
  type SuggestTherapyAndActionsOutput
} from './suggest-therapy-and-actions-types';

export async function suggestTherapyAndActions(input: SuggestTherapyAndActionsInput): Promise<SuggestTherapyAndActionsOutput> {
  return suggestTherapyAndActionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTherapyAndActionsPrompt',
  input: {schema: SuggestTherapyAndActionsInputSchema},
  output: {schema: SuggestTherapyAndActionsOutputSchema},
  prompt: `Anda adalah AI asisten medis canggih dengan spesialisasi farmakologi klinis dan manajemen terapi.

  Berdasarkan diagnosis utama pasien, serta data klinis pendukung (jika tersedia), berikan rekomendasi rencana terapi dan tindakan yang komprehensif dan berbasis bukti.

  **Diagnosis Utama Pasien:**
  {{diagnosis}}

  **Konteks Klinis Tambahan:**
  - Anamnesis: {{{anamnesis}}}
  - Pemeriksaan Fisik: {{{physicalExam}}}

  Tugas Anda adalah menghasilkan:
  1.  **Rekomendasi Obat (Medications):**
      - Untuk setiap obat, berikan: \`medicationName\`, \`dosage\` (dosis dan aturan pakai), dan \`reasoning\` (alasan klinis singkat).
      - Fokus pada obat-obat lini pertama atau yang paling umum digunakan untuk diagnosis tersebut.

  2.  **Rekomendasi Tindakan (Actions):**
      - Untuk setiap tindakan, berikan: \`actionName\` (nama tindakan/prosedur/edukasi) dan \`reasoning\` (alasan klinis).
      - Ini bisa mencakup anjuran perubahan gaya hidup, edukasi spesifik, atau prosedur medis non-obat lainnya.

  Hasilkan output dalam format yang terstruktur dan siap digunakan oleh dokter untuk mengisi resep dan rencana tindakan.
  `,
});

const suggestTherapyAndActionsFlow = ai.defineFlow(
  {
    name: 'suggestTherapyAndActionsFlow',
    inputSchema: SuggestTherapyAndActionsInputSchema,
    outputSchema: SuggestTherapyAndActionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
