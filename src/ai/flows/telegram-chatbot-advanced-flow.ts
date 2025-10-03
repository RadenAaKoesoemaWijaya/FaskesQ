import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Types for Telegram consultation
export interface TelegramMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  phoneNumber?: string;
}

export interface TelegramConsultationContext {
  patientName: string;
  age: number;
  gender: 'male' | 'female';
  symptoms: string[];
  medicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  vitals: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  consultationNotes: string[];
}

export interface TelegramChatbotAdvancedInput {
  messages: TelegramMessage[];
  context: TelegramConsultationContext;
  consultationMode: 'general' | 'emergency' | 'follow-up' | 'medication';
  patientPhoneNumber: string;
}

export interface TelegramChatbotAdvancedOutput {
  response: string;
  suggestedActions: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedNextSteps: string[];
  icd10Codes?: string[];
  medicationSuggestions?: string[];
  followUpRequired: boolean;
  emergencyReferralNeeded: boolean;
  messages?: TelegramMessage[];
  context?: Partial<TelegramConsultationContext>;
  suggestions?: string[];
}

// Zod schemas for validation
const TelegramMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.date(),
  phoneNumber: z.string().optional(),
});

const TelegramConsultationContextSchema = z.object({
  patientName: z.string(),
  age: z.number().min(0).max(150),
  gender: z.enum(['male', 'female']),
  symptoms: z.array(z.string()),
  medicalHistory: z.array(z.string()),
  currentMedications: z.array(z.string()),
  allergies: z.array(z.string()),
  vitals: z.object({
    bloodPressure: z.string().optional(),
    heartRate: z.number().optional(),
    temperature: z.number().optional(),
    respiratoryRate: z.number().optional(),
    oxygenSaturation: z.number().optional(),
  }),
  consultationNotes: z.array(z.string()),
});

const TelegramChatbotAdvancedInputSchema = z.object({
  messages: z.array(TelegramMessageSchema),
  context: TelegramConsultationContextSchema,
  consultationMode: z.enum(['general', 'emergency', 'follow-up', 'medication']),
  patientPhoneNumber: z.string(),
});

const TelegramChatbotAdvancedOutputSchema = z.object({
  response: z.string(),
  suggestedActions: z.array(z.string()),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  recommendedNextSteps: z.array(z.string()),
  icd10Codes: z.array(z.string()).optional(),
  medicationSuggestions: z.array(z.string()).optional(),
  followUpRequired: z.boolean(),
  emergencyReferralNeeded: z.boolean(),
  messages: z.array(TelegramMessageSchema).optional(),
  context: TelegramConsultationContextSchema.partial().optional(),
  suggestions: z.array(z.string()).optional(),
});

export async function runTelegramChatbotAdvanced(
  input: TelegramChatbotAdvancedInput
): Promise<TelegramChatbotAdvancedOutput> {
  return telegramChatbotAdvancedFlow(input);
}

const telegramChatbotAdvancedFlow = ai.defineFlow(
  {
    name: 'telegramChatbotAdvancedFlow',
    inputSchema: TelegramChatbotAdvancedInputSchema,
    outputSchema: TelegramChatbotAdvancedOutputSchema,
  },
  async (input) => {
    const { messages, context, consultationMode, patientPhoneNumber } = input;
    
    // Create system prompt based on consultation mode
    const systemPrompt = createSystemPrompt(context, consultationMode, patientPhoneNumber);
    
    // Convert messages to Gemini format for history
    const history = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }],
    }));

    // Generate response using AI
    const result = await ai.generate({
      model: 'googleai/gemini-pro',
      history: history,
      prompt: systemPrompt,
      config: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
      },
    } as any);

    const responseText = result.text;

    // Parse the response to extract structured data
    const parsedResponse = parseTelegramConsultationResponse(responseText, consultationMode);

    const responseMessage: TelegramMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: responseText,
      timestamp: new Date(),
      phoneNumber: input.patientPhoneNumber,
    };

    return {
      response: responseText,
      suggestedActions: parsedResponse.suggestedActions || ['Konsultasi lanjutan', 'Pantau gejala'],
      riskLevel: parsedResponse.riskLevel || 'medium',
      recommendedNextSteps: parsedResponse.recommendedNextSteps || ['Konsultasi dengan dokter', 'Tindak lanjut dalam 24 jam'],
      icd10Codes: parsedResponse.icd10Codes,
      medicationSuggestions: parsedResponse.medicationSuggestions,
      followUpRequired: parsedResponse.followUpRequired ?? true,
      emergencyReferralNeeded: parsedResponse.emergencyReferralNeeded ?? false,
      messages: [...input.messages, responseMessage],
      context: {
        ...input.context,
        symptoms: input.context.symptoms || [],
        diagnosis: '',
        treatment: '',
        consultationNotes: input.context.consultationNotes,
      },
      suggestions: parsedResponse.suggestions || [],
    };
  }
);

function createSystemPrompt(
  context: TelegramConsultationContext,
  consultationMode: string,
  phoneNumber: string
): string {
  const modeInstructions = {
    general: 'Anda adalah asisten medis AI untuk konsultasi umum melalui Telegram.',
    emergency: 'Anda adalah asisten medis AI untuk penanganan darurat melalui Telegram.',
    'follow-up': 'Anda adalah asisten medis AI untuk tindak lanjut pasien melalui Telegram.',
    medication: 'Anda adalah asisten medis AI untuk konsultasi terkait obat melalui Telegram.',
  };

  const basePrompt = `
${modeInstructions[consultationMode as keyof typeof modeInstructions] || modeInstructions.general}

Konteks Pasien:
- Nama: ${context.patientName}
- Usia: ${context.age} tahun
- Jenis Kelamin: ${context.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
- Nomor Telepon: ${phoneNumber}
- Gejala: ${context.symptoms.join(', ') || 'Belum ada'}
- Riwayat Medis: ${context.medicalHistory.join(', ') || 'Tidak ada'}
- Obat Saat Ini: ${context.currentMedications.join(', ') || 'Tidak ada'}
- Alergi: ${context.allergies.join(', ') || 'Tidak ada'}
- Catatan: ${context.consultationNotes.join(', ') || 'Belum ada'}

Vital Signs:
${context.vitals.bloodPressure ? `- Tekanan Darah: ${context.vitals.bloodPressure}` : ''}
${context.vitals.heartRate ? `- Denyut Jantung: ${context.vitals.heartRate} bpm` : ''}
${context.vitals.temperature ? `- Suhu: ${context.vitals.temperature}°C` : ''}
${context.vitals.respiratoryRate ? `- Pernapasan: ${context.vitals.respiratoryRate}/menit` : ''}
${context.vitals.oxygenSaturation ? `- Saturasi Oksigen: ${context.vitals.oxygenSaturation}%` : ''}

ATURAN:
1. Gunakan bahasa Indonesia yang sopan
2. Berikan respons yang sesuai dengan mode konsultasi
3. Sertakan emoji yang tepat untuk Telegram 📱
4. Untuk mode darurat, berikan instruksi yang jelas dan cepat
5. Untuk mode obat, fokus pada informasi pengobatan
6. Untuk mode tindak lanjut, tanyakan perkembangan pasien

Tugas Anda: Analisis pesan terakhir dan berikan respons yang tepat sesuai mode konsultasi.
Format respons: Gunakan bahasa yang hangat, profesional, dan sesuai dengan mode konsultasi saat ini.
  `.trim();

  switch (consultationMode) {
    case 'emergency':
      return basePrompt + `

MODE DARURAT: Prioritaskan identifikasi tanda bahaya dan rujukan segera.`;
    case 'medication':
      return basePrompt + `

MODE OBAT: Fokus pada informasi obat, interaksi, dan efek samping.`;
    case 'follow-up':
      return basePrompt + `

MODE TINDAK LANJUT: Evaluasi kemajuan dan penyesuaian rencana pengobatan.`;
    default:
      return basePrompt + `

MODE UMUM: Lakukan anamnesa lengkap dan berikan saran yang komprehensif.`;
  }
}

function parseTelegramConsultationResponse(
  responseText: string,
  consultationMode: string
): Partial<TelegramChatbotAdvancedOutput> {
  const symptoms: string[] = [];
  const suggestions: string[] = [];
  let diagnosis = '';
  let treatment = '';
  let notes = '';

  // Parse symptoms (look for patterns like "Gejala: ..." or "Keluhan: ...")
  const symptomMatches = responseText.match(/(?:Gejala|Keluhan|Symptoms?):\s*([^\n]+)/i);
  if (symptomMatches) {
    symptoms.push(...symptomMatches[1].split(',').map(s => s.trim()));
  }

  // Parse diagnosis (look for patterns like "Diagnosis: ..." or "Kemungkinan: ...")
  const diagnosisMatches = responseText.match(/(?:Diagnosis|Kemungkinan|Diagnosa):\s*([^\n]+)/i);
  if (diagnosisMatches) {
    diagnosis = diagnosisMatches[1].trim();
  }

  // Parse treatment (look for patterns like "Pengobatan: ..." or "Terapi: ...")
  const treatmentMatches = responseText.match(/(?:Pengobatan|Terapi|Treatment):\s*([^\n]+)/i);
  if (treatmentMatches) {
    treatment = treatmentMatches[1].trim();
  }

  // Parse notes (look for patterns like "Catatan: ..." or "Notes: ...")
  const notesMatches = responseText.match(/(?:Catatan|Notes):\s*([^\n]+)/i);
  if (notesMatches) {
    notes = notesMatches[1].trim();
  }

  // Parse suggestions (look for numbered lists or bullet points)
  const suggestionMatches = responseText.match(/\d+\.\s*([^\n]+)/g);
  if (suggestionMatches) {
    suggestions.push(...suggestionMatches.map(s => s.replace(/^\d+\.\s*/, '').trim()));
  }

  return {
    suggestedActions: suggestions.length > 0 ? suggestions : ['Konsultasi lanjutan', 'Pantau gejala'],
    riskLevel: 'medium' as const,
    recommendedNextSteps: ['Konsultasi dengan dokter', 'Tindak lanjut dalam 24 jam'],
    followUpRequired: true,
    emergencyReferralNeeded: false,
    icd10Codes: [],
    medicationSuggestions: [],
  };
}