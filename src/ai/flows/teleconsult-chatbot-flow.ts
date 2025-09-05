'use server';
/**
 * @fileOverview A Genkit flow for handling teleconsultation chatbot conversations,
 * with integrated health screening capabilities.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getScreeningClusters, saveScreeningResult } from '@/lib/data';
import type { ScreeningAnswer } from '@/lib/types';

// Helper function to calculate age from date of birth
const getAge = (dateString: string) => {
  if (!dateString) return 0;
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Tool: Get screening questions for the patient's age
const getScreeningQuestions = ai.defineTool(
  {
    name: 'getScreeningQuestions',
    description: 'Ambil daftar pertanyaan skrining kesehatan yang relevan untuk usia pasien.',
    inputSchema: z.object({
      patientAge: z.number().describe('Usia pasien saat ini.'),
    }),
    outputSchema: z.object({
      clusterName: z.string().describe('Nama klaster skrining yang cocok.'),
      questions: z.array(z.object({
          id: z.string(),
          text: z.string(),
      })).describe('Daftar pertanyaan skrining.'),
    }),
  },
  async ({ patientAge }) => {
    console.log(`Tool called: getScreeningQuestions for age ${patientAge}`);
    const clusters = await getScreeningClusters();
    const relevantCluster = clusters.find(
      (c) => patientAge >= c.ageRange.min && patientAge <= c.ageRange.max
    );

    if (!relevantCluster) {
      return { clusterName: '', questions: [] };
    }

    return {
        clusterName: relevantCluster.name,
        questions: relevantCluster.questions,
    };
  }
);


// Tool: Save screening answers to the patient's record
const saveScreeningAnswers = ai.defineTool(
    {
        name: 'saveScreeningAnswers',
        description: "Simpan jawaban dari kuesioner skrining ke rekam medis pasien.",
        inputSchema: z.object({
            patientId: z.string().describe("ID unik pasien."),
            clusterName: z.string().describe("Nama klaster skrining yang digunakan."),
            answers: z.array(z.object({
                questionId: z.string().describe("ID pertanyaan."),
                questionText: z.string().describe("Teks lengkap pertanyaan."),
                answer: z.string().describe("Jawaban pasien."),
            })).describe("Daftar jawaban pasien untuk setiap pertanyaan skrining.")
        }),
        outputSchema: z.object({
            success: z.boolean(),
        }),
    },
    async (input) => {
        console.log(`Tool called: saveScreeningAnswers for patient ${input.patientId}`);
        try {
            await saveScreeningResult(input.patientId, {
                clusterName: input.clusterName,
                answers: input.answers,
            });
            return { success: true };
        } catch (error) {
            console.error("Failed to save screening results:", error);
            return { success: false };
        }
    }
);


const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model', 'tool']),
  content: z.string(),
});

const TeleconsultChatbotInputSchema = z.object({
  patientId: z.string().describe("The unique ID of the patient."),
  patientName: z.string().describe("The name of the patient."),
  patientDob: z.string().describe("The patient's date of birth (YYYY-MM-DD)."),
  history: z.array(ChatMessageSchema).describe("The history of the conversation so far."),
});
export type TeleconsultChatbotInput = z.infer<typeof TeleconsultChatbotInputSchema>;

const TeleconsultChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s response to the user\'s message.'),
});
export type TeleconsultChatbotOutput = z.infer<typeof TeleconsultChatbotOutputSchema>;

export async function teleconsultChatbot(input: TeleconsultChatbotInput): Promise<TeleconsultChatbotOutput> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Kunci API Gemini tidak ditemukan.');
  }
  return teleconsultChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'teleconsultChatbotPrompt',
  input: { schema: TeleconsultChatbotInputSchema },
  output: { schema: TeleconsultChatbotOutputSchema },
  tools: [getScreeningQuestions, saveScreeningAnswers],
  prompt: `Anda adalah AI yang berperan sebagai pasien bernama {{{patientName}}} dalam sebuah simulasi telekonsultasi. Dokter (pengguna) akan bertanya kepada Anda tentang kondisi Anda.
  
Tugas Anda adalah:
1.  Merespons pertanyaan dokter seolah-olah Anda adalah pasien sesungguhnya. Ciptakan skenario penyakit yang masuk akal (misalnya, demam, batuk, atau keluhan umum lainnya) dan konsistenlah dengan skenario tersebut. Jangan mengungkapkan bahwa Anda adalah AI.
2.  Di tengah percakapan, jika relevan, gunakan tool \`getScreeningQuestions\` untuk mengambil pertanyaan skrining sesuai usia pasien. Ajukan pertanyaan-pertanyaan ini kepada dokter secara alami, seolah-olah Anda teringat sesuatu yang ingin ditanyakan.
3.  Setelah semua pertanyaan skrining terjawab oleh dokter (yang berperan sebagai Anda), kumpulkan semua jawaban tersebut dan gunakan tool \`saveScreeningAnswers\` untuk menyimpan hasilnya. Informasikan kepada dokter bahwa jawaban telah Anda catat.
4.  Selalu jawab dengan singkat, jelas, dan natural dalam Bahasa Indonesia.

Informasi Pasien:
- Nama: {{{patientName}}}
- ID Pasien: {{{patientId}}}
- Usia: ${getAge('{{{patientDob}}}')} tahun

Riwayat Percakapan:
  {{#each history}}
    {{#if (eq role 'user')}}Dokter: {{{content}}}{{/if}}
    {{#if (eq role 'model')}}Pasien: {{{content}}}{{/if}}
  {{/each}}

Hasilkan respons Anda selanjutnya sebagai pasien.`,
});

const teleconsultChatbotFlow = ai.defineFlow(
  {
    name: 'teleconsultChatbotFlow',
    inputSchema: TeleconsultChatbotInputSchema,
    outputSchema: TeleconsultChatbotOutputSchema,
  },
  async (input) => {
    const { history, ...rest } = input;
    const patientAge = getAge(input.patientDob);

    const fullHistory = history.map(h => ({...h, content: [{text: h.content}]}));

    const llmResponse = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: { ...rest, history: fullHistory, patientAge },
        tools: [getScreeningQuestions, saveScreeningAnswers],
    });

    const output = llmResponse.output();
    if (output?.content) {
        return { response: output.content.map(p => p.text || '').join('') };
    }
    
    // Handle potential tool calls if no direct text response
    return { response: "Maaf, bisa diulangi lagi pertanyaannya?" };
  }
);
