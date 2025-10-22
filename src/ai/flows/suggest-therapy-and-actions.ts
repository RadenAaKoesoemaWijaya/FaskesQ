'use server';
/**
 * @fileOverview A Genkit flow for suggesting medications and medical actions based on a diagnosis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SuggestTherapyAndActionsInputSchema = z.object({
  anamnesis: z.string().optional().describe('A summary of the patient\'s complaints and medical history.'),
  physicalExam: z.string().optional().describe('A summary of the findings from the physical examination.'),
  diagnosis: z.string().describe('The final working diagnosis for the patient (e.g., \'Hypertension Stage 2\', \'Type 2 Diabetes Mellitus\').'),
});
export type SuggestTherapyAndActionsInput = z.infer<typeof SuggestTherapyAndActionsInputSchema>;

export const SuggestTherapyAndActionsOutputSchema = z.object({
  medications: z.array(z.object({
    medicationName: z.string().describe('The name of the recommended medication.'),
    dosage: z.string().describe('The recommended dosage and frequency (e.g., \'500 mg, 3 kali sehari\').'),
    reasoning: z.string().describe('A brief clinical reasoning for recommending this medication.'),
  })).describe('A list of recommended medications.'),
  actions: z.array(z.object({
    actionName: z.string().describe('The name of the recommended medical action or procedure.'),
    reasoning: z.string().describe('A brief clinical reasoning for recommending this action.'),
  })).describe('A list of recommended medical actions or lifestyle interventions.'),
});
export type SuggestTherapyAndActionsOutput = z.infer<typeof SuggestTherapyAndActionsOutputSchema>;

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
