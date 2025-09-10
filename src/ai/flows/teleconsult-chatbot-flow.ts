
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { geminiPro } from 'genkitx-googleai';

// Gunakan skema yang sama dari medical-scribe-flow untuk konsistensi
// (Dalam proyek nyata, ini akan diimpor dari file bersama)
const MedicalRecordSchema = z.object({
  anamnesis: z.object({
    mainComplaint: z.string(),
    historyOfPresentIllness: z.string(),
    pastMedicalHistory: z.string(),
    allergies: z.string(),
  }),
  physicalExam: z.string(),
  supportingExams: z.object({
    requests: z.array(z.object({ examName: z.string(), notes: z.string() })),
    results: z.string(),
  }),
  assessmentAndPlan: z.string(),
});

const teleconsultPrompt = `
Anda adalah AI asisten dokter. Mulai percakapan dengan ramah, tanyakan keluhan utama pasien, dan gali informasi untuk melengkapi anamnesis (riwayat penyakit sekarang, riwayat penyakit dahulu, alergi). 

Riwayat Percakapan Sejauh Ini:
{history}

Pesan Terakhir Pengguna: 
{query}

Berikan respons yang empatik dan ajukan pertanyaan lanjutan yang relevan untuk melengkapi data medis. Jaga agar percakapan tetap mengalir secara alami.
`;

export const teleconsultChatbotFlow = defineFlow(
  {
    name: 'teleconsultChatbotFlow',
    inputSchema: z.object({
      patientId: z.string(),
      query: z.string(),
      history: z.array(z.object({ role: z.enum(['user', 'model']), content: z.string() })).optional(),
    }),
    outputSchema: z.object({
        response: z.string(),
        // Pertimbangkan untuk mengembalikan data terstruktur di setiap giliran
        // structuredData: MedicalRecordSchema.partial().optional(), 
    }),
  },
  async (input) => {
    const { query, history = [], patientId } = input;

    // Gabungkan riwayat untuk konteks
    const historyText = history.map(h => `${h.role}: ${h.content}`).join('\n');

    const response = await ai.generate({
      model: geminiPro,
      prompt: teleconsultPrompt
        .replace('{history}', historyText)
        .replace('{query}', query),
      config: {
        temperature: 0.5, // Sedikit lebih kreatif untuk percakapan
      },
    });

    const responseText = response.text();

    // Setelah setiap giliran atau di akhir, Anda bisa memanggil medicalScribeFlow
    // untuk mengekstrak data dari keseluruhan percakapan.
    // const fullTranscript = historyText + `\nuser: ${query}\nmodel: ${responseText}`;
    // await runFlow(medicalScribeFlow, { transcript: fullTranscript, patientId });

    return {
      response: responseText,
    };
  }
);
