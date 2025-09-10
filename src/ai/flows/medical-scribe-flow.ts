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
  requests: z.object({
      lab: z.object({
          completeBloodCount: z.boolean().describe("Check if a complete blood count is requested."),
          urinalysis: z.boolean().describe("Check if a urinalysis is requested."),
          bloodChemistry: z.boolean().describe("Check if blood chemistry tests are requested."),
          microscopic: z.boolean().describe("Check if microscopic examinations are requested."),
          immunology: z.boolean().describe("Check if immunology rapid tests are requested."),
      }).describe("Laboratory tests requested."),
      radiology: z.object({
          xray: z.boolean().describe("Check if an X-ray is requested."),
          ctScan: z.boolean().describe("Check if a CT Scan is requested."),
          mri: z.boolean().describe("Check if an MRI is requested."),
          ultrasound: z.boolean().describe("Check if an ultrasound (USG) is requested."),
          petScan: z.boolean().describe("Check if a PET Scan is requested."),
      }).describe("Radiology examinations requested."),
      other: z.object({
          ekg: z.boolean().describe("Check if an electrocardiogram (ECG/EKG) is requested."),
          eeg: z.boolean().describe("Check if an electroencephalogram (EEG) is requested."),
          emg: z.boolean().describe("Check if an electromyogram (EMG) is requested."),
      }).describe("Other examinations requested."),
      notes: z.string().describe("Any clinical notes or indications provided for the requested examinations.").describe("Any clinical notes or indications for the request."),
  }).describe("Supporting examination requests mentioned in the transcript."),
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
  prompt: `Anda adalah AI ahli pencatat medis (medical scribe) yang sangat teliti dan akurat. Tugas Anda adalah mengubah transkrip percakapan dokter-pasien menjadi rekam medis terstruktur dalam format JSON. Gunakan Bahasa Indonesia formal sesuai standar medis.

  PERATURAN PENTING:
  1.  **Fokus pada Fakta**: Ekstrak HANYA informasi yang secara eksplisit disebutkan dalam transkrip.
  2.  **Jangan Berasumsi**: Jika sebuah informasi tidak ada (misal: riwayat penyakit keluarga), biarkan kolomnya sebagai string kosong (""). Untuk permintaan pemeriksaan (kolom boolean), isikan \`false\`.
  3.  **Terminologi Medis**: Gunakan terminologi medis yang tepat jika memungkinkan. Contoh: ubah "gula darah" menjadi "glukosa darah", "sesak napas" menjadi "dispnea".
  4.  **Lengkapi Semua Kolom**: Pastikan untuk mengisi semua bagian dari struktur JSON yang diminta, dari Anamnesis hingga Rencana, meskipun beberapa di antaranya kosong.

  PROSES KERJA:
  Analisis transkrip berikut dengan saksama. Identifikasi dan ekstrak informasi untuk setiap bagian:
  - Anamnesis (keluhan utama, riwayat penyakit, alergi).
  - Pemeriksaan Fisik (tanda vital, pemeriksaan head-to-toe).
  - Hasil Pemeriksaan Penunjang (jika dokter membacakan hasil lab atau rontgen).
  - Permintaan Pemeriksaan Penunjang: Jika dokter meminta pemeriksaan (cth: "Tolong cek darah lengkap", "Minta Rontgen thorax"), set nilai boolean yang sesuai menjadi \`true\`. Catat indikasi atau alasan permintaan di kolom \`notes\`.
  - Rencana (prognosis, edukasi, resep, tindakan).

  Transkrip:
  {{{transcript}}}

  Berdasarkan transkrip di atas, hasilkan rekam medis lengkap dalam format JSON yang valid sesuai skema yang telah ditentukan.
  `,
});

const medicalScribeFlow = ai.defineFlow(
  {
    name: 'medicalScribeFlow',
    inputSchema: MedicalScribeInputSchema,
    outputSchema: MedicalScribeOutputSchema,
    // Optional: Add middleware for retries, logging, etc.
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        // This case handles if the model returns nothing.
        throw new Error('AI model returned no output.');
      }
      // The output is automatically validated against the outputSchema by Genkit.
      // If it's invalid, Genkit will throw an error which will be caught by the catch block.
      return output;
    } catch (error) {
      console.error('Error in medicalScribeFlow:', error);
      // Depending on the desired behavior, you could:
      // 1. Throw the error to let the caller handle it.
      // 2. Return a default/error state object.
      // 3. Implement a retry mechanism.
      // For now, we'll re-throw to make the failure explicit.
      throw new Error(`Failed to process transcript due to an AI generation or validation error: ${error.message}`);
    }
  }
);
