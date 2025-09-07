
'use server';
/**
 * @fileOverview A Genkit flow for simulating BPJS participant verification.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VerifyBpjsInputSchema = z.object({
  bpjsNumber: z.string().describe('The BPJS insurance number of the participant.'),
});
export type VerifyBpjsInput = z.infer<typeof VerifyBpjsInputSchema>;

const VerifyBpjsOutputSchema = z.object({
  success: z.boolean().describe('Whether the verification was successful.'),
  status: z.string().describe('The status of the participant (e.g., Aktif, Tidak Aktif).'),
  patientName: z.string().describe('The name of the participant.'),
});
export type VerifyBpjsOutput = z.infer<typeof VerifyBpjsOutputSchema>;

// This is a placeholder function to simulate a real API call.
async function fetchBpjsStatus(bpjsNumber: string): Promise<VerifyBpjsOutput> {
    console.log(`[SIMULASI] Memverifikasi nomor BPJS: ${bpjsNumber}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate different responses based on the BPJS number for demo purposes
    if (bpjsNumber.endsWith('0')) {
        return { success: true, status: 'Aktif', patientName: 'Ahmad Yusuf' };
    }
    if (bpjsNumber.endsWith('1')) {
        return { success: false, status: 'Tidak Aktif - Tunggakan Iuran', patientName: 'Dewi Anggraini' };
    }
    if (bpjsNumber.length < 13) {
        return { success: false, status: 'Nomor Tidak Valid', patientName: 'N/A' };
    }
    
    // Default simulation for a valid, active user
    return { success: true, status: 'Aktif', patientName: 'Budi Santoso' };
}


const verifyBpjsFlow = ai.defineFlow(
  {
    name: 'verifyBpjsFlow',
    inputSchema: VerifyBpjsInputSchema,
    outputSchema: VerifyBpjsOutputSchema,
  },
  async ({ bpjsNumber }) => {
    // In a real application, you would make a secure, server-to-server API call here.
    // This would involve handling authentication (e.g., OAuth2) and parsing the real API response.
    // The code below is a simulation.

    console.log('Memulai alur verifikasi BPJS (Simulasi)...');
    
    const verificationResult = await fetchBpjsStatus(bpjsNumber);

    console.log('Hasil simulasi verifikasi:', verificationResult);
    
    return verificationResult;
  }
);


export async function verifyBpjs(input: VerifyBpjsInput): Promise<VerifyBpjsOutput> {
  return verifyBpjsFlow(input);
}
