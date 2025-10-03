'use server';
/**
 * @fileOverview Advanced Genkit flow for WhatsApp consultation chatbot with enhanced patient context
 * and intelligent response generation for better patient communication.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getPatientById } from '@/lib/data';

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

// WhatsApp Message Schema
const WhatsAppMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.date(),
  status: z.enum(['sent', 'delivered', 'read']).optional(),
});
export type WhatsAppMessage = z.infer<typeof WhatsAppMessageSchema>;

// Consultation Context Schema
const ConsultationContextSchema = z.object({
  symptoms: z.array(z.string()).default([]),
  diagnosis: z.string().default(''),
  treatment: z.string().default(''),
  notes: z.string().default(''),
});
export type ConsultationContext = z.infer<typeof ConsultationContextSchema>;

// Input/Output Schemas
const WhatsAppChatbotAdvancedInputSchema = z.object({
  patientId: z.string().describe("The unique ID of the patient."),
  patientName: z.string().describe("The name of the patient."),
  patientDob: z.string().describe("The patient's date of birth (YYYY-MM-DD)."),
  patientGender: z.string().describe("The patient's gender."),
  patientContact: z.string().describe("The patient's contact number."),
  patientHistory: z.array(z.any()).describe("The patient's medical history."),
  screeningHistory: z.array(z.any()).describe("The patient's screening history."),
  messages: z.array(WhatsAppMessageSchema).describe("The conversation history."),
  action: z.enum(['initialize', 'chat']).describe("The action to perform."),
  context: ConsultationContextSchema.optional().describe("Current consultation context."),
});
export type WhatsAppChatbotAdvancedInput = z.infer<typeof WhatsAppChatbotAdvancedInputSchema>;

const WhatsAppChatbotAdvancedOutputSchema = z.object({
  messages: z.array(WhatsAppMessageSchema).describe('The updated conversation messages.'),
  context: ConsultationContextSchema.optional().describe('Updated consultation context.'),
  suggestions: z.array(z.string()).optional().describe('Suggested next messages.'),
});
export type WhatsAppChatbotAdvancedOutput = z.infer<typeof WhatsAppChatbotAdvancedOutputSchema>;

export async function runWhatsAppChatbotAdvanced(input: WhatsAppChatbotAdvancedInput): Promise<WhatsAppChatbotAdvancedOutput> {
  return whatsAppChatbotAdvancedFlow(input);
}

const whatsAppChatbotAdvancedFlow = ai.defineFlow(
  {
    name: 'whatsAppChatbotAdvancedFlow',
    inputSchema: WhatsAppChatbotAdvancedInputSchema,
    outputSchema: WhatsAppChatbotAdvancedOutputSchema,
  },
  async (input) => {
    const patientAge = getAge(input.patientDob);
    const recentHistory = input.patientHistory.slice(-3); // Get last 3 examinations
    const recentScreening = input.screeningHistory.slice(-3); // Get last 3 screenings

    // Convert messages to Gemini format for history
    const history = input.messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }],
    }));

    // Analyze patient context
    const patientContext = `
      Informasi Pasien:
      - Nama: ${input.patientName}
      - Usia: ${patientAge} tahun
      - Gender: ${input.patientGender}
      - Kontak: ${input.patientContact}
      
      Riwayat Pemeriksaan Terakhir:
      ${recentHistory.map(exam => `- ${exam.date}: ${exam.diagnosis}`).join('\n')}
      
      Riwayat Screening Terakhir:
      ${recentScreening.map(screening => `- ${screening.date}: ${screening.clusterName}`).join('\n')}
      
      Konteks Konsultasi Saat Ini:
      - Gejala: ${input.context?.symptoms?.join(', ') || 'Belum ada'}
      - Diagnosis: ${input.context?.diagnosis || 'Belum ada'}
      - Terapi: ${input.context?.treatment || 'Belum ada'}
      - Catatan: ${input.context?.notes || 'Belum ada'}
    `;

    let prompt = '';
    let systemPrompt = `
      Anda adalah asisten medis AI yang canggih untuk konsultasi WhatsApp. 
      Tugas Anda membantu dokter berkomunikasi dengan pasien secara efektif melalui WhatsApp.
      
      ${patientContext}
      
      ATURAN PENTING:
      1. Gunakan bahasa Indonesia yang sopan dan mudah dipahami pasien
      2. Jelaskan kondisi medis dengan sederhana
      3. Berikan instruksi yang jelas dan dapat dilakukan
      4. Hindari istilah medis yang terlalu teknis
      5. Tunjukkan empati dan kepedulian
      6. Sertakan emoji yang tepat untuk membuat pesan lebih hangat 💊🩺
      7. Untuk pesan darurat, gunakan penekanan yang jelas
      8. Sertakan saran tindak lanjut yang konkret
    `;

    if (input.action === 'initialize') {
      prompt = `
        ${systemPrompt}
        
        Inisiasi percakapan dengan pasien. Buat pesan pembuka yang:
        1. Menyapa pasien dengan ramah
        2. Memperkenalkan diri sebagai asisten dokter
        3. Menanyakan kabar dan kesiapan untuk konsultasi
        4. Menanyakan keluhan utama saat ini
        
        Buat pesan yang hangat, profesional, dan mengundang pasien untuk berbagi keluhannya.
      `;
    } else {
      const lastMessage = input.messages[input.messages.length - 1];
      prompt = `
        ${systemPrompt}
        
        Pesan terakhir dari dokter: "${lastMessage?.content}"
        
        Analisis pesan ini dan:
        1. Berikan respons yang sesuai untuk pasien
        2. Ajukan pertanyaan lanjutan jika diperlukan
        3. Berikan edukasi yang relevan
        4. Sertakan saran praktis
        5. Update konteks konsultasi jika ada informasi baru
        
        Pastikan respons Anda:
        - Sesuai dengan konteks pasien dan riwayatnya
        - Mudah dipahami oleh pasien
        - Menunjukkan kepedulian dan profesionalisme
        - Termasuk saran tindak lanjut yang jelas
      `;
    }

    const result = await ai.generate({
      model: 'googleai/gemini-pro',
      history: history,
      prompt: prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
    } as any);

    const responseContent = result.text;
    const responseMessage: WhatsAppMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      status: 'sent',
    };

    // Generate suggestions for next messages
    const suggestions = await generateMessageSuggestions(input, responseContent);

    return {
      messages: [...input.messages, responseMessage],
      context: input.context || {
        symptoms: [],
        diagnosis: '',
        treatment: '',
        notes: '',
      },
      suggestions: suggestions,
    };
  }
);

// Helper function to generate message suggestions
async function generateMessageSuggestions(
  input: WhatsAppChatbotAdvancedInput, 
  lastResponse: string
): Promise<string[]> {
  const suggestionsPrompt = `
    Berdasarkan respons ini: "${lastResponse}",
    buat 3 saran pesan lanjutan untuk dokter yang:
    1. Menggali informasi medis yang relevan
    2. Memberikan edukasi yang sesuai
    3. Menanyakan kondisi terkait
    
    Format: satu kalimat per baris, maksimal 3 baris.
    Gunakan bahasa Indonesia yang sopan.
  `;

  try {
      const result = await ai.generate({
        model: 'googleai/gemini-pro',
        prompt: suggestionsPrompt,
        config: { temperature: 0.5, maxOutputTokens: 150 },
      } as any);

      return result.text
        .split('\n')
        .filter((line: string) => line.trim().length > 0)
        .slice(0, 3);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
}