import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({
    apiKey: process.env.GOOGLE_API_KEY,
  })],
  // Semua alur kerja (flows) dalam aplikasi ini akan secara default menggunakan
  // model yang lebih baru dan tersedia secara luas. 
  // Ini untuk memperbaiki error 404 Not Found pada gemini-pro.
  model: 'googleai/gemini-1.5-flash-latest',
});
