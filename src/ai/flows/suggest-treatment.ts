'use server';
/**
 * @fileOverview Provides treatment suggestions based on patient examination findings and history.
 *
 * - suggestTreatmentOptions - A function that suggests treatment options based on patient data.
 * - SuggestTreatmentOptionsInput - The input type for the suggestTreatmentOptions function.
 * - SuggestTreatmentOptionsOutput - The return type for the suggestTreatmentOptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTreatmentOptionsInputSchema = z.object({
  examinationFindings: z.string().describe('Temuan terperinci dari pemeriksaan pasien.'),
  patientHistory: z.string().describe('Riwayat medis pasien, termasuk penyakit masa lalu, pengobatan, dan alergi.'),
  patientAge: z.number().describe('Usia pasien.'),
  patientGender: z.string().describe('Jenis kelamin pasien.'),
});
export type SuggestTreatmentOptionsInput = z.infer<typeof SuggestTreatmentOptionsInputSchema>;

const SuggestTreatmentOptionsOutputSchema = z.object({
  treatmentSuggestions: z.array(
    z.object({
      treatmentName: z.string().describe('Nama perawatan yang disarankan.'),
      description: z.string().describe('Deskripsi terperinci tentang perawatan dan manfaatnya.'),
      risks: z.string().describe('Potensi risiko dan efek samping yang terkait dengan perawatan.'),
      evidenceLevel: z.string().describe('Tingkat bukti yang mendukung pengobatan (misalnya, tinggi, sedang, rendah).'),
    })
  ).describe('Daftar opsi perawatan potensial dengan deskripsi, risiko, dan tingkat bukti.'),
  additionalRecommendations: z.string().describe('Rekomendasi atau pertimbangan tambahan untuk penyedia layanan kesehatan.'),
});
export type SuggestTreatmentOptionsOutput = z.infer<typeof SuggestTreatmentOptionsOutputSchema>;

export async function suggestTreatmentOptions(input: SuggestTreatmentOptionsInput): Promise<SuggestTreatmentOptionsOutput> {
  return suggestTreatmentOptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTreatmentOptionsPrompt',
  input: {schema: SuggestTreatmentOptionsInputSchema},
  output: {schema: SuggestTreatmentOptionsOutputSchema},
  prompt: `Anda adalah asisten AI yang dirancang untuk membantu penyedia layanan kesehatan menyarankan opsi perawatan potensial berdasarkan informasi pasien. Jawab dalam Bahasa Indonesia.

  Berdasarkan temuan pemeriksaan pasien dan riwayat medis berikut, sarankan daftar opsi perawatan potensial.
  Sertakan deskripsi setiap perawatan, potensi risiko, dan tingkat bukti yang mendukung penggunaannya.
  Juga, berikan rekomendasi atau pertimbangan tambahan untuk penyedia layanan kesehatan.

  Temuan Pemeriksaan: {{{examinationFindings}}}
  Riwayat Pasien: {{{patientHistory}}}
  Usia Pasien: {{{patientAge}}}
  Jenis Kelamin Pasien: {{{patientGender}}}

  Format output Anda sebagai objek JSON dengan struktur berikut:
  {
    "treatmentSuggestions": [
      {
        "treatmentName": "",
        "description": "",
        "risks": "",
        "evidenceLevel": "" // "tinggi", "sedang", atau "rendah"
      }
    ],
    "additionalRecommendations": ""
  }`,
});

const suggestTreatmentOptionsFlow = ai.defineFlow(
  {
    name: 'suggestTreatmentOptionsFlow',
    inputSchema: SuggestTreatmentOptionsInputSchema,
    outputSchema: SuggestTreatmentOptionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
