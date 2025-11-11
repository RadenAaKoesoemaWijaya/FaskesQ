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
import { suggestDifferentialDiagnosis } from '@/ai/flows/suggest-differential-diagnosis';
import {
    type SuggestDifferentialDiagnosisInput,
    type SuggestDifferentialDiagnosisOutput
} from '@/ai/flows/suggest-differential-diagnosis-types';
import { suggestSupportingExaminations } from '@/ai/flows/suggest-supporting-examinations';
import {
    type SuggestSupportingExaminationsInput,
    type SuggestSupportingExaminationsOutput
} from '@/ai/flows/suggest-supporting-examinations-types';
import { suggestEnhancedSupportingExaminations } from '@/ai/flows/enhanced-suggest-supporting-examinations';
import {
    type EnhancedSupportingExaminationsInput,
    type EnhancedSupportingExaminationsOutput,
    type QuickRecommendationInput,
    type StandardRecommendationInput,
    type ComprehensiveRecommendationInput
} from '@/ai/flows/enhanced-supporting-examinations-types';
import { SmartValidation } from '@/ai/flows/smart-validation';
import { DiagnosisIntegration } from '@/ai/flows/diagnosis-integration';
import { suggestTherapyAndActions } from '@/ai/flows/suggest-therapy-and-actions';
import {
    type SuggestTherapyAndActionsInput,
    type SuggestTherapyAndActionsOutput
} from '@/ai/flows/suggest-therapy-and-actions-types';
import { suggestPatientEducation } from '@/ai/flows/suggest-patient-education';
import {
    type SuggestPatientEducationInput,
    type SuggestPatientEducationOutput
} from '@/ai/flows/suggest-patient-education-types';

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
import {
    analyzeMedicalImage,
    type MedicalImageAnalysisInput,
    type MedicalImageAnalysisOutput
} from '@/ai/flows/medical-image-analysis-flow';
import {
    runWhatsAppChatbotAdvanced,
    type WhatsAppChatbotAdvancedInput,
    type WhatsAppChatbotAdvancedOutput,
    type WhatsAppMessage,
    type ConsultationContext
} from '@/ai/flows/whatsapp-chatbot-advanced-flow';
import {
    runTelegramChatbotAdvanced,
    type TelegramChatbotAdvancedInput,
    type TelegramChatbotAdvancedOutput,
    type TelegramMessage,
    type TelegramConsultationContext
} from '@/ai/flows/telegram-chatbot-advanced-flow';
import {
    runTeleconsultChatbot,
    type TeleconsultChatbotInput,
    type TeleconsultChatbotOutput,
    type ChatMessage
} from '@/ai/flows/teleconsult-chatbot-flow';
import { deletePatient as dbDeletePatient, updatePatient as dbUpdatePatient } from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { sanitizeInput, validatePatientId, validateEmail, validatePhone, validateBpjsNumber, RateLimiter } from '@/lib/security';


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

export async function runSuggestSupportingExaminations(input: SuggestSupportingExaminationsInput): Promise<{
    success: boolean;
    data?: SuggestSupportingExaminationsOutput;
    error?: string;
}> {
    try {
        const result = await suggestSupportingExaminations(input);
        return {success: true, data: result};
    } catch (error) {
        console.error('Error running suggestSupportingExaminations:', error);
        return {
            success: false,
            error: 'Terjadi kesalahan saat meminta rekomendasi pemeriksaan.',
        };
    }
}

export async function runEnhancedSuggestSupportingExaminations(input: EnhancedSupportingExaminationsInput): Promise<{
    success: boolean;
    data?: EnhancedSupportingExaminationsOutput;
    error?: string;
}> {
    try {
        const result = await suggestEnhancedSupportingExaminations(input);
        return {success: true, data: result};
    } catch (error) {
        console.error('Error running enhancedSuggestSupportingExaminations:', error);
        return {
            success: false,
            error: 'Terjadi kesalahan saat meminta rekomendasi pemeriksaan yang ditingkatkan.',
        };
    }
}

export async function validateClinicalData(input: {
    mainComplaint?: string;
    diagnosis?: string;
    anamnesis?: string;
    physicalExam?: string;
    differentialDiagnoses?: Array<{ diagnosis: string; confidence: number; priority: string; reasoning: string }>;
    patientContext?: {
        age?: number;
        gender?: 'male' | 'female';
        specialization?: string;
    };
}): Promise<{
    success: boolean;
    data?: {
        score: number;
        mode: 'quick' | 'standard' | 'comprehensive';
        confidence: 'low' | 'medium' | 'high';
        missingFields: string[];
        warnings: string[];
        suggestions: string[];
    };
    error?: string;
}> {
    try {
        // Transform input to match SmartValidation expected format
        const validationInput = {
            mainComplaint: input.mainComplaint,
            diagnosis: input.diagnosis,
            anamnesis: input.anamnesis,
            physicalExam: input.physicalExam,
            differentialDiagnoses: input.differentialDiagnoses,
            patientAge: input.patientContext?.age,
            patientGender: input.patientContext?.gender,
            specialization: input.patientContext?.specialization
        };
        
        const validation = await SmartValidation.validate(validationInput);
        
        // Transform result to match expected output format
        const result = {
            score: validation.score,
            mode: validation.recommendationMode.toLowerCase() as 'quick' | 'standard' | 'comprehensive',
            confidence: validation.confidenceLevel.toLowerCase() as 'low' | 'medium' | 'high',
            missingFields: validation.missingFields,
            warnings: validation.warnings,
            suggestions: SmartValidation.suggestDataImprovements(validationInput)
        };
        
        return {success: true, data: result};
    } catch (error) {
        console.error('Error validating clinical data:', error);
        return {
            success: false,
            error: 'Terjadi kesalahan saat memvalidasi data klinis.',
        };
    }
}

export async function getEnhancedDiagnosesWithExaminations(input: {
    mainComplaint: string;
    anamnesis?: string;
    physicalExam?: string;
    patientContext?: {
        age?: number;
        gender?: 'male' | 'female';
        specialization?: string;
    };
}): Promise<{
    success: boolean;
    data?: {
        diagnoses: Array<{
            name: string;
            probability: number;
            priority: 'high' | 'medium' | 'low';
            icd10?: string;
            reasoning?: string;
        }>;
        examinations: Array<{
            name: string;
            category: 'laboratory' | 'radiology' | 'other';
            priority: 'high' | 'medium' | 'low';
            reasoning: string;
        }>;
    };
    error?: string;
}> {
    try {
        // Get enhanced diagnoses using static method
        const diagnoses = await DiagnosisIntegration.getEnhancedDiagnoses(
            input.anamnesis || '',
            input.physicalExam || '',
            {
                enableFallback: true,
                confidenceThreshold: 60,
                maxDiagnoses: 5,
                includeReasoning: true
            }
        );

        // Get supporting examinations using enhanced suggestions
        const examinations = await suggestEnhancedSupportingExaminations({
            anamnesis: input.anamnesis || '',
            physicalExam: input.physicalExam || '',
            differentialDiagnoses: diagnoses.map(d => ({
                diagnosis: d.diagnosis,
                confidence: d.confidence,
                priority: d.priority,
                reasoning: d.reasoning
            })),
            context: {
                patientAge: input.patientContext?.age,
                patientGender: input.patientContext?.gender ? input.patientContext.gender.charAt(0).toUpperCase() + input.patientContext.gender.slice(1) as 'Male' | 'Female' : undefined,
                specialization: input.patientContext?.specialization ? input.patientContext.specialization.charAt(0).toUpperCase() + input.patientContext.specialization.slice(1) as 'General' | 'Internal' | 'Pediatric' | 'Surgical' | 'Emergency' | 'Obstetric' : undefined,
                urgency: 'Routine'
            }
        });

        const result = {
            diagnoses: diagnoses.map(d => ({
                name: d.diagnosis,
                probability: d.confidence,
                priority: d.priority.toLowerCase() as 'high' | 'medium' | 'low',
                reasoning: d.reasoning
            })),
            examinations: examinations.recommendations.map(r => ({
                name: r.examination,
                category: r.category.toLowerCase() as 'laboratory' | 'radiology' | 'other',
                priority: r.priority.toLowerCase() as 'high' | 'medium' | 'low',
                reasoning: r.reasoning
            }))
        };
        
        return {success: true, data: result};
    } catch (error) {
        console.error('Error getting enhanced diagnoses with examinations:', error);
        return {
            success: false,
            error: 'Terjadi kesalahan saat mendapatkan diagnosis dan pemeriksaan yang ditingkatkan.',
        };
    }
}

export async function runSuggestTherapyAndActions(input: SuggestTherapyAndActionsInput): Promise<{
    success: boolean;
    data?: SuggestTherapyAndActionsOutput;
    error?: string;
}> {
    try {
        const result = await suggestTherapyAndActions(input);
        return {success: true, data: result};
    } catch (error: any) {
        console.error('Error running suggestTherapyAndActions:', error);
        return {
            success: false,
            error: error.message || 'Terjadi kesalahan saat memberikan rekomendasi terapi.',
        };
    }
}

export async function runSuggestPatientEducation(input: SuggestPatientEducationInput): Promise<{
    success: boolean;
    data?: SuggestPatientEducationOutput;
    error?: string;
}> {
    try {
        const result = await suggestPatientEducation(input);
        return {success: true, data: result};
    } catch (error: any) {
        console.error('Error running suggestPatientEducation:', error);
        return {
            success: false,
            error: error.message || 'Terjadi kesalahan saat membuat rekomendasi edukasi.',
        };
    }
}


export async function deletePatientAction(id: string) {
    try {
        // Validate patient ID
        if (!validatePatientId(id)) {
            return { success: false, error: 'Invalid patient ID format.' };
        }
        
        await dbDeletePatient(id);
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting patient:', error);
        return { success: false, error: 'Gagal menghapus pasien.' };
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

export async function runWhatsAppChatbotAdvancedAction(
  input: WhatsAppChatbotAdvancedInput
): Promise<{
  success: boolean;
  data?: WhatsAppChatbotAdvancedOutput;
  error?: string;
}> {
  try {
    const result = await runWhatsAppChatbotAdvanced(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error running WhatsApp chatbot advanced:', error);
    return { 
      success: false, 
      error: error.message || 'Terjadi kesalahan saat menjalankan WhatsApp chatbot.' 
    };
  }
}

export async function analyzeMedicalImageAction(
  input: MedicalImageAnalysisInput
): Promise<{
  success: boolean;
  data?: MedicalImageAnalysisOutput;
  error?: string;
}> {
  try {
    const result = await analyzeMedicalImage(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error analyzing medical image:', error);
    return { 
      success: false, 
      error: error.message || 'Terjadi kesalahan saat menganalisis gambar medis.' 
    };
  }
}

export async function runTelegramChatbotAdvancedAction(
  input: TelegramChatbotAdvancedInput
): Promise<{
  success: boolean;
  data?: TelegramChatbotAdvancedOutput;
  error?: string;
}> {
  try {
    const result = await runTelegramChatbotAdvanced(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error running Telegram chatbot advanced:', error);
    return { 
      success: false, 
      error: error.message || 'Terjadi kesalahan saat menjalankan Telegram chatbot.' 
    };
  }
}

export async function runTeleconsultChatbotAction(
  input: TeleconsultChatbotInput
): Promise<{
  success: boolean;
  data?: TeleconsultChatbotOutput;
  error?: string;
}> {
  try {
    const result = await runTeleconsultChatbot(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error running teleconsult chatbot:', error);
    return { 
      success: false, 
      error: error.message || 'Terjadi kesalahan saat menjalankan konsultasi chatbot.' 
    };
  }
}
