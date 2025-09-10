
'use server';
/**
 * @fileOverview A Genkit flow for simulating integration with the SATU SEHAT platform.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SendToSatuSehatInputSchema = z.object({
  patientId: z.string().describe("The patient's internal ID."),
  patientName: z.string().describe("The patient's full name."),
  practitionerName: z.string().describe("The name of the attending practitioner."),
  diagnosis: z.string().describe("The primary diagnosis (working diagnosis), preferably with an ICD-10 code."),
  encounterData: z.object({
      anamnesis: z.string().describe("A summary of the patient's complaints."),
      physicalExam: z.string().describe("A summary of the physical examination findings."),
  }).describe("Data related to the current patient encounter."),
});
export type SendToSatuSehatInput = z.infer<typeof SendToSatuSehatInputSchema>;

const SendToSatuSehatOutputSchema = z.object({
  success: z.boolean().describe('Whether the data submission was successful.'),
  encounterId: z.string().describe('The Encounter ID returned by SATU SEHAT upon successful submission.'),
  message: z.string().describe('A status message describing the result.'),
});
export type SendToSatuSehatOutput = z.infer<typeof SendToSatuSehatOutputSchema>;

// This is a placeholder function to simulate a real API call to SATU SEHAT.
async function postToSatuSehat(data: SendToSatuSehatInput): Promise<Partial<SendToSatuSehatOutput>> {
    console.log('[SIMULASI] Mengirim data Encounter ke SATU SEHAT untuk pasien:', data.patientName);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real application, you would:
    // 1. Authenticate with SATU SEHAT's OAuth2 server to get an access token.
    // 2. Map your internal data model to FHIR (Fast Healthcare Interoperability Resources) format.
    //    - Create a Patient resource (or look up an existing one).
    //    - Create an Encounter resource, linking the patient and practitioner.
    //    - Create Observation resources for vital signs (from physicalExam).
    //    - Create a Condition resource for the diagnosis, linking the encounter.
    // 3. POST these FHIR resources to the appropriate SATU SEHAT API endpoints.
    // 4. Handle the response, checking for success or errors.

    // Simulate a successful response
    const simulatedEncounterId = `enc-${Date.now()}`;
    console.log(`[SIMULASI] Berhasil. SATU SEHAT Encounter ID: ${simulatedEncounterId}`);
    return { success: true, encounterId: simulatedEncounterId, message: 'Data berhasil dikirim (Simulasi).' };
}


const sendToSatuSehatFlow = ai.defineFlow(
  {
    name: 'sendToSatuSehatFlow',
    inputSchema: SendToSatuSehatInputSchema,
    outputSchema: SendToSatuSehatOutputSchema,
  },
  async (input) => {
    console.log('Memulai alur pengiriman data ke SATU SEHAT (Simulasi)...');
    
    const result = await postToSatuSehat(input);

    if (!result.success || !result.encounterId) {
        throw new Error('Gagal mengirim data ke SATU SEHAT (Simulasi).');
    }
    
    return {
        success: true,
        encounterId: result.encounterId,
        message: result.message || 'Proses simulasi selesai.',
    };
  }
);


export async function sendToSatuSehat(input: SendToSatuSehatInput): Promise<SendToSatuSehatOutput> {
  return sendToSatuSehatFlow(input);
}
