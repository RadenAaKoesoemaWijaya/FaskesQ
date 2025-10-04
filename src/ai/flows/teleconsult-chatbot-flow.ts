'use server';
/**
 * @fileOverview Genkit flow for Teleconsultation chatbot with video call integration
 * and intelligent response generation for remote medical consultations.
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

// Chat Message Schema
const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.date(),
  messageType: z.enum(['text', 'image', 'video', 'file']).default('text'),
  status: z.enum(['sent', 'delivered', 'read']).optional(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Teleconsultation Context Schema
const TeleconsultContextSchema = z.object({
  symptoms: z.array(z.string()).default([]),
  diagnosis: z.string().default(''),
  treatment: z.string().default(''),
  notes: z.string().default(''),
  videoCallLink: z.string().optional(),
  consultationType: z.enum(['emergency', 'routine', 'followup']).default('routine'),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
});
export type TeleconsultContext = z.infer<typeof TeleconsultContextSchema>;

// Input/Output Schemas
const TeleconsultChatbotInputSchema = z.object({
  patientId: z.string().describe("The unique ID of the patient."),
  patientName: z.string().describe("The name of the patient."),
  patientDob: z.string().describe("The patient's date of birth (YYYY-MM-DD)."),
  patientGender: z.string().describe("The patient's gender."),
  patientContact: z.string().describe("The patient's contact number."),
  patientHistory: z.array(z.any()).describe("The patient's medical history."),
  screeningHistory: z.array(z.any()).describe("The patient's screening history."),
  messages: z.array(ChatMessageSchema).describe("The conversation history."),
  action: z.enum(['initialize', 'chat', 'schedule_video', 'end_consultation']).describe("The action to perform."),
  context: TeleconsultContextSchema.optional().describe("Current consultation context."),
});
export type TeleconsultChatbotInput = z.infer<typeof TeleconsultChatbotInputSchema>;

const TeleconsultChatbotOutputSchema = z.object({
  messages: z.array(ChatMessageSchema).describe('The updated conversation messages.'),
  context: TeleconsultContextSchema.optional().describe('Updated consultation context.'),
  suggestions: z.array(z.string()).optional().describe('Suggested next messages.'),
  videoCallScheduled: z.boolean().optional().describe('Whether video call was scheduled.'),
});
export type TeleconsultChatbotOutput = z.infer<typeof TeleconsultChatbotOutputSchema>;

export async function runTeleconsultChatbot(input: TeleconsultChatbotInput): Promise<TeleconsultChatbotOutput> {
  return teleconsultChatbotFlow(input);
}

const teleconsultChatbotFlow = ai.defineFlow(
  {
    name: 'teleconsultChatbotFlow',
    inputSchema: TeleconsultChatbotInputSchema,
    outputSchema: TeleconsultChatbotOutputSchema,
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
      - Tipe Konsultasi: ${input.context?.consultationType || 'routine'}
      - Tingkat Urgensi: ${input.context?.urgencyLevel || 'low'}
      ${input.context?.videoCallLink ? `- Link Video Call: ${input.context.videoCallLink}` : ''}
    `;

    let prompt = '';
    let systemPrompt = `
      Anda adalah asisten medis AI yang canggih untuk konsultasi telemedicine. 
      Tugas Anda membantu dokter melakukan konsultasi jarak jauh dengan pasien secara efektif.
      
      ${patientContext}
      
      ATURAN PENTING:
      1. Gunakan bahasa Indonesia yang sopan dan mudah dipahami pasien
      2. Jelaskan kondisi medis dengan sederhana namun akurat
      3. Berikan instruksi yang jelas dan dapat dilakukan di rumah
      4. Hindari istilah medis yang terlalu teknis
      5. Tunjukkan empati dan kepedulian
      6. Untuk konsultasi darurat, segera arahkan ke layanan darurat terdekat
      7. Sertakan saran tindak lanjut yang konkret
      8. Jika perlu pemeriksaan fisik, jelaskan dengan jelas
    `;

    let videoCallScheduled = false;

    if (input.action === 'initialize') {
      prompt = `
        ${systemPrompt}
        
        Inisiasi konsultasi telemedicine dengan pasien. Buat pesan pembuka yang:
        1. Menyapa pasien dengan ramah dan profesional
        2. Memperkenalkan diri sebagai asisten dokter untuk konsultasi online
        3. Menanyakan kabar dan kesiapan untuk konsultasi
        4. Menanyakan keluhan utama saat ini
        5. Menjelaskan bahwa ini adalah konsultasi jarak jauh
        
        Buat pesan yang hangat, profesional, dan mengundang pasien untuk berbagi keluhannya.
      `;
    } else if (input.action === 'schedule_video') {
      prompt = `
        ${systemPrompt}
        
        Jadwalkan video call dengan pasien. Buat pesan yang:
        1. Menawarkan video call untuk konsultasi lebih lanjut
        2. Menjelaskan manfaat video call untuk diagnosis yang lebih akurat
        3. Memberikan link atau instruksi untuk bergabung
        4. Menanyakan ketersediaan waktu pasien
        
        Sertakan empati dan kejelasan dalam penawaran video call.
      `;
      videoCallScheduled = true;
    } else if (input.action === 'end_consultation') {
      prompt = `
        ${systemPrompt}
        
        Akhiri konsultasi dengan pasien. Buat pesan penutup yang:
        1. Meringkas hasil konsultasi
        2. Memberikan saran tindak lanjut
        3. Menanyakan apakah ada pertanyaan tambahan
        4. Mengucapkan terima kasih dan semoga lekas sembuh
        
        Pastikan pesan penutup memberikan kelegaan dan kejelasan bagi pasien.
      `;
    } else {
      const lastMessage = input.messages[input.messages.length - 1];
      prompt = `
        ${systemPrompt}
        
        Pesan terakhir dari pasien: "${lastMessage?.content}"
        
        Analisis pesan ini dan:
        1. Berikan respons yang sesuai untuk konsultasi jarak jauh
        2. Ajukan pertanyaan lanjutan jika diperlukan
        3. Berikan edukasi yang relevan untuk perawatan di rumah
        4. Sertakan saran praktis yang bisa dilakukan pasien
        5. Update konteks konsultasi jika ada informasi baru
        6. Tentukan apakah perlu video call atau rujukan
        
        Pastikan respons Anda:
        - Sesuai dengan konteks pasien dan riwayatnya
        - Mudah dipahami oleh pasien
        - Menunjukkan kepedulian dan profesionalisme
        - Termasuk saran tindak lanjut yang jelas
        - Cocok untuk konsultasi jarak jauh
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
    const responseMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      messageType: 'text',
      status: 'sent',
    };

    // Generate suggestions for next messages
    const suggestions = await generateTeleconsultSuggestions(input, responseContent);

    return {
      messages: [...input.messages, responseMessage],
      context: input.context || {
        symptoms: [],
        diagnosis: '',
        treatment: '',
        notes: '',
        consultationType: 'routine',
        urgencyLevel: 'low',
      },
      suggestions: suggestions,
      videoCallScheduled: videoCallScheduled,
    };
  }
);

// Helper function to generate teleconsult suggestions
async function generateTeleconsultSuggestions(
  input: TeleconsultChatbotInput, 
  lastResponse: string
): Promise<string[]> {
  const suggestionsPrompt = `
    Berdasarkan respons ini: "${lastResponse}"
    
    Buat 3 saran pesan lanjutan untuk konsultasi telemedicine yang:
    1. Relevan dengan respons terakhir
    2. Membantu melanjutkan konsultasi secara efektif
    3. Sesuai untuk konsultasi jarak jauh
    
    Format: Array string JSON, contoh: ["saran 1", "saran 2", "saran 3"]
  `;

  try {
    const suggestionsResult = await ai.generate({
      model: 'googleai/gemini-pro',
      prompt: suggestionsPrompt,
      config: {
        temperature: 0.5,
        topK: 20,
        topP: 0.9,
      },
    } as any);

    const suggestionsText = suggestionsResult.text.trim();
    
    // Try to parse as JSON array
    if (suggestionsText.startsWith('[') && suggestionsText.endsWith(']')) {
      try {
        return JSON.parse(suggestionsText);
      } catch {
        // If JSON parsing fails, return as single suggestion
        return [suggestionsText];
      }
    } else {
      // If not JSON format, split by newlines or return as single suggestion
      const lines = suggestionsText.split('\n').filter(line => line.trim());
      return lines.length > 0 ? lines : [suggestionsText];
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
}