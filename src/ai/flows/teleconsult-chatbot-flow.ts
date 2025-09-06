'use server';
/**
 * @fileOverview A Genkit flow for handling teleconsultation chatbot conversations,
 * with integrated health screening capabilities.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getScreeningClusters, saveScreeningResult } from '@/lib/data';

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

// Tool: Get screening questions for the patient's age and a chosen screening category
const getScreeningQuestions = ai.defineTool(
  {
    name: 'getScreeningQuestions',
    description: 'Ambil daftar pertanyaan skrining kesehatan yang relevan untuk pasien berdasarkan kategori yang dipilih dokter.',
    inputSchema: z.object({
      patientAge: z.number().describe('Usia pasien saat ini.'),
      chosenScreeningName: z.string().describe('Nama skrining yang dipilih oleh dokter untuk dilakukan.')
    }),
    outputSchema: z.object({
      screeningName: z.string().describe('Nama skrining yang cocok.'),
      questions: z.array(z.object({
          id: z.string(),
          text: z.string(),
      })).describe('Daftar pertanyaan skrining.'),
    }),
  },
  async ({ patientAge, chosenScreeningName }) => {
    console.log(`Tool called: getScreeningQuestions for age ${patientAge} and screening "${chosenScreeningName}"`);
    const clusters = await getScreeningClusters();
    // Find the cluster that matches the name chosen by the doctor.
    const relevantCluster = clusters.find(c => c.name.toLowerCase() === chosenScreeningName.toLowerCase());

    if (!relevantCluster) {
      return { screeningName: '', questions: [] };
    }

    return {
        screeningName: relevantCluster.name,
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
            screeningName: z.string().describe("Nama skrining yang digunakan."),
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
            // Note: The data schema uses 'clusterName', so we adapt to it here.
            await saveScreeningResult(input.patientId, {
                clusterName: input.screeningName,
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
  return teleconsultChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'teleconsultChatbotPrompt',
  input: { schema: TeleconsultChatbotInputSchema },
  output: { schema: TeleconsultChatbotOutputSchema },
  tools: [getScreeningQuestions, saveScreeningAnswers],
  prompt: `Anda adalah AI asisten medis yang cerdas dan proaktif. Anda membantu dokter (pengguna) selama sesi telekonsultasi dengan pasien bernama {{{patientName}}}.

Tugas Anda adalah:
1.  **Mulai Percakapan**: Awali dengan menyapa dokter dan tanyakan apa yang bisa Anda bantu terkait pasien {{{patientName}}} yang berusia ${getAge('{{{patientDob}}}')} tahun.
2.  **Tawarkan Bantuan Skrining**: Secara proaktif, tawarkan bantuan untuk melakukan skrining kesehatan. Contoh: "Dok, pasien berusia ${getAge('{{{patientDob}}}')} tahun. Apakah ada skrining kesehatan yang ingin kita lakukan hari ini? Seperti skrining hipertensi, diabetes, atau lainnya?"
3.  **Lakukan Skrining**: Jika dokter setuju dan menyebutkan nama skrining, gunakan tool \`getScreeningQuestions\` untuk mendapatkan daftar pertanyaannya. Ajukan pertanyaan satu per satu kepada dokter (yang akan meneruskannya ke pasien).
4.  **Simpan Hasil**: Setelah semua pertanyaan terjawab, konfirmasi jawaban dengan dokter, lalu gunakan tool \`saveScreeningAnswers\` untuk menyimpan hasilnya ke rekam medis pasien. Beri tahu dokter bahwa hasilnya telah disimpan.
5.  **Responsif**: Jawab pertanyaan atau perintah lain dari dokter secara singkat, jelas, dan profesional dalam Bahasa Indonesia.

Riwayat Percakapan:
{{#each history}}
  {{#if (eq role 'user')}}Dokter: {{{content}}}{{/if}}
  {{#if (eq role 'model')}}Asisten AI: {{{content}}}{{/if}}
{{/each}}

Hasilkan respons Anda selanjutnya sebagai Asisten AI.`,
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

    const llmHistory = history.map(h => {
        // Adapt role for the LLM prompt. 'user' is the doctor, 'model' is the AI assistant.
        const role = h.role === 'user' ? 'user' : 'model';
        return { role, content: [{ text: h.content }] };
    });

    const llmResponse = await ai.generate({
        model: 'googleai/gemini-pro',
        prompt: { ...rest, history: llmHistory },
        tools: [getScreeningQuestions, saveScreeningAnswers],
        config: {
            temperature: 0.3, // Lower temperature for more predictable, professional responses
        },
    });

    const output = llmResponse.output();
    if (output?.content) {
        return { response: output.content.map(p => p.text || '').join('') };
    }
    
    // Handle potential tool calls if no direct text response
    return { response: "Maaf, bisa diulangi lagi?" };
  }
);
