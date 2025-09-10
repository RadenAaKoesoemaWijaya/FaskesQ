
import { defineFlow, runFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { geminiPro } from 'genkitx-googleai';
import { completeMedicalResume } from './complete-medical-resume';

// Definisikan skema output yang ketat menggunakan Zod
const MedicalRecordSchema = z.object({
  anamnesis: z.object({
    mainComplaint: z.string().describe('Keluhan utama pasien'),
    historyOfPresentIllness: z.string().describe('Riwayat penyakit sekarang'),
    pastMedicalHistory: z.string().describe('Riwayat penyakit dahulu'),
    allergies: z.string().describe('Daftar alergi yang diketahui'),
  }).describe('Anamnesis lengkap pasien'),
  physicalExam: z.string().describe('Hasil pemeriksaan fisik dari head-to-toe'),
  supportingExams: z.object({
    requests: z.array(z.object({
      examName: z.string().describe('Nama pemeriksaan penunjang, cth: Darah Lengkap, Rontgen Thorax'),
      notes: z.string().describe('Alasan atau indikasi permintaan pemeriksaan'),
    })).describe('Daftar permintaan pemeriksaan penunjang'),
    results: z.string().describe('Hasil pemeriksaan penunjang yang didiskusikan'),
  }).describe('Pemeriksaan Penunjang'),
  assessmentAndPlan: z.string().describe('Penilaian, diagnosis kerja/banding, dan rencana tatalaksana'),
});

// Prompt yang lebih bersih dan terpisah dari kode
const scribePrompt = `
Analisis transkrip percakapan dokter dan pasien berikut dengan saksama. Ekstrak informasi sesuai dengan skema JSON yang diminta.
Fokus pada detail medis yang relevan untuk setiap bagian:
1.  **Anamnesis**: Keluhan utama, riwayat penyakit sekarang, riwayat penyakit dahulu, alergi.
2.  **Pemeriksaan Fisik**: Tanda vital dan pemeriksaan head-to-toe.
3.  **Pemeriksaan Penunjang**:
    -   Jika dokter meminta pemeriksaan (cth: "Tolong cek darah lengkap", "Minta Rontgen thorax"), catat nama pemeriksaan dan alasannya di 'requests'.
    -   Jika hasil tes didiskusikan, rangkum dalam 'results'.
4.  **Penilaian dan Rencana**: Diagnosis, prognosis, edukasi, resep, dan tindakan.

Transkrip:
{transcript}
`;

export const medicalScribeFlow = defineFlow(
  {
    name: 'medicalScribeFlow',
    // Definisikan input schema untuk menerima transcript dan patientId
    inputSchema: z.object({
      transcript: z.string(),
      patientId: z.string(), // ID Pasien untuk integrasi EHR
    }),
    // Definisikan output schema untuk menjamin struktur data
    outputSchema: MedicalRecordSchema,
  },
  async (input) => {
    const { transcript, patientId } = input;

    // Generate JSON yang terstruktur dan andal
    const structuredResult = await ai.generate({
      model: geminiPro,
      prompt: scribePrompt.replace('{transcript}', transcript),
      output: {
        schema: MedicalRecordSchema,
      },
      config: {
        temperature: 0.2, // Turunkan temperature untuk output yang lebih faktual
      }
    });

    const medicalRecord = structuredResult.output();

    if (medicalRecord) {
      // (Langkah Opsional Namun Direkomendasikan)
      // Panggil alur lain untuk melengkapi resume medis atau menyimpan ke DB
      // Contoh:
      // await runFlow(completeMedicalResume, {
      //   patientId: patientId,
      //   extractedData: medicalRecord,
      // });
    }

    return medicalRecord;
  }
);
