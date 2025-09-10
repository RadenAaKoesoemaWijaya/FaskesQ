import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({
    apiKey: process.env.GOOGLE_API_KEY,
  })],
  // Semua alur kerja (flows) dalam aplikasi ini akan secara default menggunakan
  // model 'gemini-pro'. Anda dapat menggantinya untuk alur kerja tertentu jika diperlukan.
  model: 'googleai/gemini-pro',
});
