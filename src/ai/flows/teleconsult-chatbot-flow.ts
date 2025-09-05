'use server';
/**
 * @fileOverview A Genkit flow for handling teleconsultation chatbot conversations.
 *
 * - teleconsultChatbot - A function that handles the chatbot logic.
 * - TeleconsultChatbotInput - The input type for the teleconsultChatbot function.
 * - TeleconsultChatbotOutput - The return type for the teleconsultChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const TeleconsultChatbotInputSchema = z.object({
  patientName: z.string().describe("The name of the patient."),
  history: z.array(ChatMessageSchema).describe("The history of the conversation so far."),
  message: z.string().describe('The latest message from the user (doctor).'),
});
export type TeleconsultChatbotInput = z.infer<typeof TeleconsultChatbotInputSchema>;

const TeleconsultChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s response to the user\'s message.'),
});
export type TeleconsultChatbotOutput = z.infer<typeof TeleconsultChatbotOutputSchema>;

export async function teleconsultChatbot(input: TeleconsultChatbotInput): Promise<TeleconsultChatbotOutput> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'Kunci API Gemini tidak ditemukan. Mohon atur GEMINI_API_KEY di file .env Anda.'
    );
  }
  return teleconsultChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'teleconsultChatbotPrompt',
  input: {schema: TeleconsultChatbotInputSchema},
  output: {schema: TeleconsultChatbotOutputSchema},
  prompt: `Anda adalah AI yang berperan sebagai pasien bernama {{{patientName}}} dalam sebuah simulasi telekonsultasi. Dokter (pengguna) akan bertanya kepada Anda tentang kondisi Anda. 
  
  Tugas Anda adalah merespons pertanyaan dokter seolah-olah Anda adalah pasien sesungguhnya. Ciptakan skenario penyakit yang masuk akal (misalnya, demam, batuk, sakit kepala, atau keluhan umum lainnya) dan konsistenlah dengan skenario tersebut selama percakapan. Jangan mengungkapkan bahwa Anda adalah AI. Jawablah dengan singkat dan jelas dalam Bahasa Indonesia.

  Berikut adalah riwayat percakapan sejauh ini:
  {{#each history}}
    {{#if (eq role 'user')}}
        Dokter: {{{content}}}
    {{else}}
        Pasien: {{{content}}}
    {{/if}}
  {{/each}}

  Pesan terakhir dari Dokter:
  {{{message}}}

  Hasilkan respons Anda sebagai pasien.`,
});

const teleconsultChatbotFlow = ai.defineFlow(
  {
    name: 'teleconsultChatbotFlow',
    inputSchema: TeleconsultChatbotInputSchema,
    outputSchema: TeleconsultChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
