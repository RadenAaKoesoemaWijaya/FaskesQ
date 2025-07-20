'use server';
/**
 * @fileOverview A Genkit flow that acts as a medical scribe, parsing a conversation transcript
 * into a structured medical record.
 *
 * - medicalScribe - A function that processes a transcript and returns structured medical data.
 * - MedicalScribeInput - The input type for the medicalScribe function.
 * - MedicalScribeOutput - The return type for the medicalScribe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicalScribeInputSchema = z.object({
  transcript: z.string().describe('The full transcript of the conversation between the doctor and the patient.'),
});
export type MedicalScribeInput = z.infer<typeof MedicalScribeInputSchema>;

const MedicalScribeOutputSchema = z.object({
  anamnesis: z.object({
    mainComplaint: z.string().describe('The patient\'s main complaint.'),
    presentIllness: z.string().describe('The history of the present illness.'),
    pastMedicalHistory: z.string().describe('The patient\'s past medical history.'),
    drugAllergy: z.string().describe('Any drug allergies the patient has.'),
  }),
  physicalExamination: z.object({
     consciousness: z.string().describe('The patient\'s level of consciousness (e.g., Compos Mentis).'),
    bloodPressure: z.string().describe('The patient\'s blood pressure in mmHg.'),
    heartRate: z.string().describe('The patient\'s heart rate in beats per minute.'),
    respiratoryRate: z.string().describe('The patient\'s respiratory rate in breaths per minute.'),
    temperature: z.string().describe('The patient\'s temperature in Celsius.'),
  }),
});
export type MedicalScribeOutput = z.infer<typeof MedicalScribeOutputSchema>;


export async function medicalScribe(input: MedicalScribeInput): Promise<MedicalScribeOutput> {
  return medicalScribeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'medicalScribePrompt',
  input: {schema: MedicalScribeInputSchema},
  output: {schema: MedicalScribeOutputSchema},
  prompt: `You are an expert medical scribe AI. Your task is to listen to a conversation between a doctor and a patient and accurately fill out the medical record based on the information provided in the transcript.

  Carefully analyze the following transcript and extract the required information. Pay close attention to details mentioned by both the patient and the doctor.

  If a piece of information is not mentioned in the transcript, leave the corresponding field empty.

  Transcript:
  {{{transcript}}}

  Based on this transcript, please populate the anamnesis and physical examination sections.
  `,
});

const medicalScribeFlow = ai.defineFlow(
  {
    name: 'medicalScribeFlow',
    inputSchema: MedicalScribeInputSchema,
    outputSchema: MedicalScribeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
