
'use server';
/**
 * @fileOverview A Genkit flow for analyzing the sentiment of patient testimonials.
 *
 * - analyzeTestimonialSentiment - A function that analyzes the sentiment of a given text.
 * - AnalyzeTestimonialSentimentInput - The input type for the function.
 * - AnalyzeTestimonialSentimentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTestimonialSentimentInputSchema = z.object({
  testimonialText: z.string().describe('The patient feedback text to be analyzed.'),
});
export type AnalyzeTestimonialSentimentInput = z.infer<typeof AnalyzeTestimonialSentimentInputSchema>;

const AnalyzeTestimonialSentimentOutputSchema = z.object({
  sentiment: z.enum(['Positif', 'Negatif', 'Netral']).describe('The overall sentiment of the feedback.'),
  summary: z.string().describe('A brief one-sentence summary of the key points in the feedback.'),
});
export type AnalyzeTestimonialSentimentOutput = z.infer<typeof AnalyzeTestimonialSentimentOutputSchema>;

export async function analyzeTestimonialSentiment(input: AnalyzeTestimonialSentimentInput): Promise<AnalyzeTestimonialSentimentOutput> {
  return analyzeTestimonialSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTestimonialSentimentPrompt',
  input: {schema: AnalyzeTestimonialSentimentInputSchema},
  output: {schema: AnalyzeTestimonialSentimentOutputSchema},
  prompt: `Anda adalah seorang ahli analisis sentimen yang berspesialisasi dalam umpan balik pasien di layanan kesehatan.
  Analisis teks testimoni berikut dan tentukan sentimen keseluruhannya.

  Teks Testimoni:
  "{{{testimonialText}}}"

  Tugas Anda:
  1.  Klasifikasikan sentimen sebagai 'Positif', 'Negatif', atau 'Netral'.
  2.  Berikan ringkasan satu kalimat yang menangkap poin-poin utama dari umpan balik tersebut.
  
  Contoh:
  - Teks: "Dokternya sangat ramah dan menjelaskan semuanya dengan detail, tapi saya menunggu hampir satu jam."
  - Sentimen: Netral
  - Ringkasan: Pasien menghargai keramahan dokter tetapi mengeluhkan waktu tunggu yang lama.
  `,
});

const analyzeTestimonialSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeTestimonialSentimentFlow',
    inputSchema: AnalyzeTestimonialSentimentInputSchema,
    outputSchema: AnalyzeTestimonialSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
