'use server';

import {
  completeMedicalResume,
  type CompleteMedicalResumeInput,
  type CompleteMedicalResumeOutput,
} from '@/ai/flows/complete-medical-resume';
import {
  medicalScribe,
  type MedicalScribeInput,
  type MedicalScribeOutput,
} from '@/ai/flows/medical-scribe-flow';
import {
  suggestIcd10,
  type SuggestIcd10Input,
  type SuggestIcd10Output,
} from '@/ai/flows/suggest-icd10-flow';
import {
    suggestDifferentialDiagnosis,
    type SuggestDifferentialDiagnosisInput,
    type SuggestDifferentialDiagnosisOutput
} from '@/ai/flows/suggest-differential-diagnosis';
import {
  teleconsultChatbot,
  type TeleconsultChatbotInput,
  type TeleconsultChatbotOutput,
  type ChatMessage,
} from '@/ai/flows/teleconsult-chatbot-flow';
import {
    verifyBpjs,
    type VerifyBpjsInput,
    type VerifyBpjsOutput,
} from '@/ai/flows/bpjs-verification-flow';
import {
    sendToSatuSehat,
    type SendToSatuSehatInput,
    type SendToSatuSehatOutput,
} from '@/ai/flows/satusehat-integration-flow';
import { 
    analyzeTestimonialSentiment, 
    type AnalyzeTestimonialSentimentInput, 
    type AnalyzeTestimonialSentimentOutput 
} from '@/ai/flows/analyze-testimonial-sentiment';
import { deletePatient as dbDeletePatient, updatePatient as dbUpdatePatient } from '@/lib/data';
import { revalidatePath } from 'next/cache';


export async function getMedicalResume(
  input: CompleteMedicalResumeInput
): Promise<{
  success: boolean;
  data?: CompleteMedicalResumeOutput;
  error?: string;
}> {
  try {
    const resume = await completeMedicalResume(input);
    return { success: true, data: resume };
  } catch (error) {
    console.error('Error fetching medical resume:', error);
    return {
      success: false,
      error:
        'Terjadi kesalahan saat membuat resume medis. Silakan coba lagi.',
    };
  }
}

export async function runMedicalScribe(
  input: MedicalScribeInput
): Promise<{
  success: boolean;
  data?: MedicalScribeOutput;
  error?: string;
}> {
  try {
    const result = await medicalScribe(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error running medical scribe:', error);
    return {
      success: false,
      error:
        'Terjadi kesalahan saat memproses transkrip. Silakan coba lagi.',
    };
  }
}

export async function runSuggestIcd10(
  input: SuggestIcd10Input
): Promise<{
  success: boolean;
  data?: SuggestIcd10Output;
  error?: string;
}> {
  try {
    const result = await suggestIcd10(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error running suggestIcd10:', error);
    return {
      success: false,
      error:
        'Terjadi kesalahan saat mencari kode ICD-10. Silakan coba lagi.',
    };
  }
}

export async function runSuggestDifferentialDiagnosis(input: SuggestDifferentialDiagnosisInput): Promise<{
    success: boolean;
    data?: SuggestDifferentialDiagnosisOutput;
    error?: string;
}> {
    try {
        const result = await suggestDifferentialDiagnosis(input);
        return {success: true, data: result};
    } catch (error) {
        console.error('Error running suggestDifferentialDiagnosis:', error);
        return {
            success: false,
            error: 'Terjadi kesalahan saat mencari diagnosis banding.',
        };
    }
}


export async function deletePatientAction(id: string) {
    try {
        await dbDeletePatient(id);
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting patient:', error);
        return { success: false, error: 'Gagal menghapus pasien.' };
    }
}

export async function runTeleconsultChatbot(
  input: TeleconsultChatbotInput
): Promise<{
  success: boolean;
  data?: TeleconsultChatbotOutput;
  error?: string;
}> {
  try {
    const result = await teleconsultChatbot(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error running teleconsult chatbot:', error);
    return {
      success: false,
      error:
        'Terjadi kesalahan saat menghubungi chatbot. Silakan coba lagi.',
    };
  }
}

export async function runVerifyBpjs(input: VerifyBpjsInput): Promise<{
  success: boolean;
  data?: VerifyBpjsOutput;
  error?: string;
}> {
    try {
        const result = await verifyBpjs(input);
        return {success: true, data: result};
    } catch (error: any) {
        console.error('Error verifying BPJS:', error);
        return { success: false, error: error.message || 'Terjadi kesalahan saat verifikasi BPJS.' };
    }
}


export async function runSendToSatuSehat(input: SendToSatuSehatInput): Promise<{
  success: boolean;
  data?: SendToSatuSehatOutput;
  error?: string;
}> {
    try {
        const result = await sendToSatuSehat(input);
        return {success: true, data: result};
    } catch (error: any) {
        console.error('Error sending to SATU SEHAT:', error);
        return { success: false, error: error.message || 'Gagal mengirim data ke SATU SEHAT.' };
    }
}

export async function runAnalyzeTestimonialSentiment(
  input: AnalyzeTestimonialSentimentInput
): Promise<{
  success: boolean;
  data?: AnalyzeTestimonialSentimentOutput;
  error?: string;
}> {
  try {
    const result = await analyzeTestimonialSentiment(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error running sentiment analysis:', error);
    return { success: false, error: error.message || 'Gagal menganalisis sentimen.' };
  }
}
