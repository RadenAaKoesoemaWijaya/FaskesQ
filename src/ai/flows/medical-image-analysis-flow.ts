'use server';
/**
 * @fileOverview AI flow untuk analisis gambar medis kondisi klinis pasien
 * Mendukung analisis kelainan kulit, luka, dan kondisi klinis lainnya
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schema untuk input analisis gambar
const MedicalImageAnalysisInputSchema = z.object({
  patientId: z.string().describe("ID unik pasien"),
  patientName: z.string().describe("Nama pasien"),
  patientAge: z.number().describe("Usia pasien"),
  patientGender: z.string().describe("Jenis kelamin pasien"),
  imageBase64: z.string().describe("Gambar dalam format base64"),
  imageType: z.string().describe("Tipe gambar (jpeg, png, dll)"),
  clinicalContext: z.string().optional().describe("Konteks klinis tambahan dari dokter"),
});
export type MedicalImageAnalysisInput = z.infer<typeof MedicalImageAnalysisInputSchema>;

// Schema untuk output hasil analisis
const MedicalImageAnalysisOutputSchema = z.object({
  analysis: z.object({
    findings: z.string().describe("Temuan utama dari gambar"),
    severity: z.enum(['mild', 'moderate', 'severe', 'critical']).describe("Tingkat keparahan"),
    confidence: z.number().min(0).max(100).describe("Tingkat kepercayaan analisis dalam persen"),
    differentialDiagnosis: z.array(z.string()).describe("Diagnosis banding yang mungkin"),
    recommendedActions: z.array(z.string()).describe("Tindakan yang direkomendasikan"),
  }).describe("Hasil analisis gambar"),
  treatment: z.object({
    immediate: z.array(z.string()).describe("Tindakan segera yang diperlukan"),
    medications: z.array(z.string()).describe("Obat-obatan yang direkomendasikan"),
    followUp: z.array(z.string()).describe("Tindak lanjut yang diperlukan"),
    precautions: z.array(z.string()).describe("Peringatan dan kehati-hatian"),
  }).describe("Rencana tatalaksana"),
  patientEducation: z.array(z.string()).describe("Edukasi untuk pasien"),
  redFlags: z.array(z.string()).describe("Tanda bahaya yang perlu diwaspadai"),
  referralIndications: z.array(z.string()).describe("Indikasi untuk rujukan"),
}).describe("Rekomendasi tatalaksana lengkap");
export type MedicalImageAnalysisOutput = z.infer<typeof MedicalImageAnalysisOutputSchema>;

export async function analyzeMedicalImage(input: MedicalImageAnalysisInput): Promise<MedicalImageAnalysisOutput> {
  return medicalImageAnalysisFlow(input);
}

const medicalImageAnalysisFlow = ai.defineFlow(
  {
    name: 'medicalImageAnalysisFlow',
    inputSchema: MedicalImageAnalysisInputSchema,
    outputSchema: MedicalImageAnalysisOutputSchema,
  },
  async (input) => {
    const prompt = `
      Anda adalah dokter spesialis kulit dan ahli bedah plastik yang berpengalaman dalam menganalisis kondisi klinis melalui gambar.
      
      Tugas Anda:
      1. Analisis gambar medis yang diberikan dengan sangat hati-hati dan detail
      2. Identifikasi kelainan atau patologi yang terlihat
      3. Berikan diagnosis banding yang paling mungkin
      4. Rekomendasikan tatalaksana yang tepat
      5. Sertakan edukasi untuk pasien
      
      Informasi Pasien:
      - Nama: ${input.patientName}
      - Usia: ${input.patientAge} tahun
      - Jenis Kelamin: ${input.patientGender}
      - ID: ${input.patientId}
      
      ${input.clinicalContext ? `Konteks Klinis: ${input.clinicalContext}` : ''}
      
      GAMBAR: ${input.imageBase64}
      
      FORMAT JAWABAN:
      {
        "analysis": {
          "findings": "[Deskripsikan temuan utama dengan detail]",
          "severity": "[mild/moderate/severe/critical]",
          "confidence": [0-100],
          "differentialDiagnosis": ["diagnosis1", "diagnosis2", "diagnosis3"],
          "recommendedActions": ["tindakan1", "tindakan2"]
        },
        "treatment": {
          "immediate": ["tindakan segera 1", "tindakan segera 2"],
          "medications": ["obat1", "obat2"],
          "followUp": ["tindak lanjut 1", "tindak lanjut 2"],
          "precautions": ["peringatan1", "peringatan2"]
        },
        "patientEducation": ["edukasi1", "edukasi2"],
        "redFlags": ["tanda bahaya1", "tanda bahaya2"],
        "referralIndications": ["indikasi rujukan1", "indikasi rujukan2"]
      }
      
      ATURAN PENTING:
      1. Gunakan bahasa Indonesia yang jelas dan mudah dipahami
      2. Jelaskan istilah medis dengan sederhana
      3. Sertakan tingkat keparahan (mild/moderate/severe/critical)
      4. Berikan tingkat kepercayaan analisis (0-100%)
      5. Sertakan minimal 3 diagnosis banding
      6. Rekomendasi tatalaksana harus praktis dan dapat dilakukan
      7. Sertakan tanda bahaya yang perlu diwaspadai
      8. Indikasikan kapan perlu rujukan ke spesialis
      9. Hindari diagnosis pasti jika tidak yakin - gunakan diagnosis banding
      10. Untuk kondisi serius, selalu anjurkan pemeriksaan langsung
    `;

    const result = await ai.generate({
      model: 'googleai/gemini-pro-vision',
      prompt: prompt,
      config: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
      },
    } as any);

    try {
      // Parse JSON response
      const responseText = result.text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        return parsedResult;
      } else {
        throw new Error('Format respons tidak valid');
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      
      // Fallback response if JSON parsing fails
      return {
        analysis: {
          findings: 'Tidak dapat menganalisis gambar dengan detail. Disarankan pemeriksaan langsung oleh dokter.',
          severity: 'moderate' as const,
          confidence: 30,
          differentialDiagnosis: ['Perlu pemeriksaan lanjutan'],
          recommendedActions: ['Konsultasi dengan dokter spesialis'],
        },
        treatment: {
          immediate: ['Hindari iritasi area yang terlihat'],
          medications: ['Topikal sesuai indikasi'],
          followUp: ['Pemeriksaan ulang dalam 1 minggu'],
          precautions: ['Jangan menggaruk atau memencet area yang terlihat'],
        },
        patientEducation: ['Jaga kebersihan area yang terlihat', 'Hindari paparan sinar matahari langsung'],
        redFlags: ['Nyeri hebat', 'Perubahan warna', 'Pendarahan'],
        referralIndications: ['Kondisi memburuk', 'Tidak ada perbaikan dalam 1 minggu'],
      };
    }
  }
);