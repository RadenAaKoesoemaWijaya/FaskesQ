'use server';
/**
 * @fileOverview A Genkit flow that acts as a medical scribe, parsing a conversation transcript
 * into a structured medical record.
 *
 * - medicalScribe - A function that processes a transcript and returns structured medical data.
 * - MedicalScribeInput - The input type for the medicalScribe function.
 * - MedicalScribeOutput - The return type for the medicalScribe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicalScribeInputSchema = z.object({
  transcript: z.string().describe('The full transcript of the conversation between the doctor and the patient.'),
});
export type MedicalScribeInput = z.infer<typeof MedicalScribeInputSchema>;

const MedicalScribeOutputSchema = z.object({
  anamnesis: z.object({
    mainComplaint: z.string().describe("The patient's main complaint."),
    presentIllness: z.string().describe('The history of the present illness.'),
    pastMedicalHistory: z.string().describe("The patient's past medical history."),
    drugAllergy: z.string().describe('Any drug allergies the patient has.'),
  }),
  physicalExamination: z.object({
    consciousness: z.string().describe("The patient's level of consciousness (e.g., Compos Mentis)."),
    bloodPressure: z.string().describe("The patient's blood pressure in mmHg."),
    heartRate: z.string().describe("The patient's heart rate in beats per minute."),
    respiratoryRate: z.string().describe("The patient's respiratory rate in breaths per minute."),
    temperature: z.string().describe("The patient's temperature in Celsius."),
    oxygenSaturation: z.string().describe("The patient's oxygen saturation in percent."),
    eyes: z.string().describe('Findings from the eye examination.'),
    nose: z.string().describe('Findings from the nose examination.'),
    mouth: z.string().describe('Findings from the mouth examination.'),
    lungsInspection: z.string().describe('Findings from the inspection of the lungs.'),
    lungsPalpation: z.string().describe('Findings from the palpation of the lungs.'),
    lungsPercussion: z.string().describe('Findings from the percussion of the lungs.'),
    lungsAuscultation: z.string().describe('Findings from the auscultation of the lungs.'),
    heartInspection: z.string().describe('Findings from the inspection of the heart.'),
    heartPalpation: z.string().describe('Findings from the palpation of the heart.'),
    heartPercussion: z.string().describe('Findings from the percussion of the heart.'),
    heartAuscultation: z.string().describe('Findings from the auscultation of the heart.'),
    abdomenInspection: z.string().describe('Findings from the inspection of the abdomen.'),
    abdomenPalpation: z.string().describe('Findings from the palpation of the abdomen.'),
    abdomenPercussion: z.string().describe('Findings from the percussion of the abdomen.'),
    abdomenAuscultation: z.string().describe('Findings from the auscultation of the abdomen.'),
    extremities: z.string().describe('Findings from the examination of the extremities.'),
    neurological: z.string().describe('Findings from the neurological examination.'),
  }),
  supportingExaminations: z.object({
      completeBloodCount: z.string().describe("Results of the complete blood count (hemoglobin, leukocytes, platelets, etc.)."),
      urinalysis: z.string().describe("Results of the urinalysis (color, pH, protein, glucose, etc.)."),
      bloodChemistry: z.string().describe("Results of blood chemistry tests (glucose, cholesterol, liver function, kidney function, etc.)."),
      microscopic: z.string().describe("Results of microscopic examinations (e.g., acid-fast bacilli, fungi)."),
      immunology: z.string().describe("Results of immunology rapid tests (Widal, HBsAg, HIV, Dengue, etc.)."),
      xray: z.string().describe("Interpretation results of the X-ray examination."),
      ctScan: z.string().describe("Interpretation results of the CT Scan."),
      mri: z.string().describe("Interpretation results of the MRI examination."),
      ultrasound: z.string().describe("Interpretation results of the ultrasound (USG) examination."),
      petScan: z.string().describe("Interpretation results of the PET Scan."),
      ekg: z.string().describe("Interpretation results of the electrocardiogram (ECG/EKG)."),
      eeg: z.string().describe("Interpretation results of the electroencephalogram (EEG)."),
      emg: z.string().describe("Interpretation results of the electromyogram (EMG)."),
  }).describe("Results from supporting examinations, if mentioned in the transcript."),
  plan: z.object({
    prognosis: z.string().describe("The doctor's prognosis for the patient's condition (e.g., ad bonam, dubia ad malam)."),
    patientEducation: z.string().describe("Any education or advice given to the patient regarding their condition, treatment, or lifestyle."),
    prescriptions: z.array(z.object({
        drugName: z.string().describe("The name of the prescribed drug."),
        preparation: z.string().describe("The preparation or form of the drug (e.g., 500mg tablet, 60ml syrup)."),
        dose: z.string().describe("The dosage instructions (e.g., 3 x 1, 2x1)."),
        quantity: z.string().describe("The total quantity of the drug to be dispensed."),
    })).describe("A list of medications prescribed to the patient."),
    actions: z.string().describe("Any other medical actions or procedures performed or recommended (e.g., wound care, referral instructions, follow-up schedule)."),
  }).describe("The treatment and follow-up plan for the patient.")
});
export type MedicalScribeOutput = z.infer<typeof MedicalScribeOutputSchema>;


export async function medicalScribe(input: MedicalScribeInput): Promise<MedicalScribeOutput> {
  return medicalScribeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'medicalScribePrompt',
  input: {schema: MedicalScribeInputSchema},
  output: {schema: MedicalScribeOutputSchema},
  prompt: `Anda adalah AI ahli pencatat medis (medical scribe). Tugas Anda adalah mendengarkan percakapan antara dokter dan pasien, lalu mengisi rekam medis secara akurat berdasarkan informasi dalam transkrip. Gunakan Bahasa Indonesia yang baik dan benar.

  Analisis transkrip berikut dengan saksama dan ekstrak informasi yang diperlukan. Perhatikan detail yang disebutkan oleh pasien dan dokter. Ini mencakup:
  1. Anamnesis (keluhan utama, riwayat penyakit sekarang, riwayat dahulu, alergi).
  2. Pemeriksaan fisik lengkap (tanda vital, pemeriksaan head-to-toe).
  3. Hasil pemeriksaan penunjang (laboratorium, radiologi, dan tes lain) jika dibicarakan.
  4. Penilaian dan rencana, termasuk prognosis, edukasi pasien, resep obat, dan tindakan lainnya.

  Jika ada informasi yang tidak disebutkan dalam transkrip, biarkan kolom yang bersangkutan kosong. Pastikan semua output dalam Bahasa Indonesia yang formal dan sesuai standar medis.

  Transkrip:
  {{{transcript}}}

  Berdasarkan transkrip ini, harap isi anamnesis, pemeriksaan fisik lengkap, hasil pemeriksaan penunjang yang disebutkan, dan rencana perawatan lengkap.
  `,
});

const medicalScribeFlow = ai.defineFlow(
  {
    name: 'medicalScribeFlow',
    inputSchema: MedicalScribeInputSchema,
    outputSchema: MedicalScribeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
