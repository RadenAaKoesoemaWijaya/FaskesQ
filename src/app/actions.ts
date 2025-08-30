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
} from '@/ai/flows/suggest-treatment';

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

export type { MedicalScribeOutput };

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

export type { SuggestIcd10Output };

export async function runSuggestIcd10(
  input: SuggestIcd10Input
): Promise<{
  success: boolean;
  data?: SuggestIcd10Output;
  error?: string;
}> {
    if (!process.env.GEMINI_API_KEY) {
    return {
      success: false,
      error: 'Kunci API Gemini tidak dikonfigurasi. Mohon atur di file .env Anda.',
    };
  }
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
