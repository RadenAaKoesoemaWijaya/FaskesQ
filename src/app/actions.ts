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
