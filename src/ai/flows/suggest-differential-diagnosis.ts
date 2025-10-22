'use server';
/**
 * @fileOverview A Genkit flow for suggesting differential diagnoses based on clinical data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
  SuggestDifferentialDiagnosisInputSchema, 
  SuggestDifferentialDiagnosisOutputSchema,
  type SuggestDifferentialDiagnosisInput,
  type SuggestDifferentialDiagnosisOutput
} from './suggest-differential-diagnosis-types';

export async function suggestDifferentialDiagnosis(input: SuggestDifferentialDiagnosisInput): Promise<SuggestDifferentialDiagnosisOutput> {
  return suggestDifferentialDiagnosisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDifferentialDiagnosisPrompt',
  input: {schema: SuggestDifferentialDiagnosisInputSchema},
  output: {schema: SuggestDifferentialDiagnosisOutputSchema},
  prompt: `Anda adalah AI asisten medis canggih yang berspesialisasi dalam diagnosis klinis.

  Berdasarkan data anamnesis dan pemeriksaan fisik yang diberikan, berikan daftar diagnosis banding (differential diagnosis).

  **Data Klinis Pasien:**
  - Anamnesis: {{{anamnesis}}}
  - Pemeriksaan Fisik: {{{physicalExam}}}

  Untuk setiap diagnosis banding yang Anda ajukan, sertakan informasi berikut:
  1.  **Diagnosis**: Nama penyakit atau kondisi.
  2.  **Keyakinan (Confidence)**: Skor persentase (0-100) yang menunjukkan seberapa besar kemungkinan diagnosis ini benar berdasarkan data yang ada.
  3.  **Alasan (Reasoning)**: Penjelasan singkat dan logis mengapa diagnosis ini dipertimbangkan, hubungkan dengan temuan spesifik dari anamnesis dan pemeriksaan fisik.

  Fokus pada 3-5 diagnosis yang paling relevan. Urutkan hasilnya dari yang paling mungkin (keyakinan tertinggi) ke yang kurang mungkin.

  Pastikan output Anda terstruktur dengan benar.
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
    // Sort by confidence descending before returning
    if (output && output.diagnoses) {
      output.diagnoses.sort((a, b) => b.confidence - a.confidence);
    }
    return output!;
  }
);
