'use server';

import {
  suggestTreatmentOptions,
  type SuggestTreatmentOptionsInput,
  type SuggestTreatmentOptionsOutput,
} from '@/ai/flows/suggest-treatment';

export async function getTreatmentSuggestions(
  input: SuggestTreatmentOptionsInput
): Promise<{
  success: boolean;
  data?: SuggestTreatmentOptionsOutput;
  error?: string;
}> {
  try {
    const suggestions = await suggestTreatmentOptions(input);
    return { success: true, data: suggestions };
  } catch (error) {
    console.error('Error fetching treatment suggestions:', error);
    // In a real app, you might want to log this error to a monitoring service.
    return {
      success: false,
      error:
        'Terjadi kesalahan saat membuat saran perawatan. Silakan coba lagi.',
    };
  }
}
