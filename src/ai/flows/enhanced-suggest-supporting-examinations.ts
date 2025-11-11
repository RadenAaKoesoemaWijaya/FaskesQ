/**
 * @fileOverview Enhanced Genkit flow for multi-mode supporting examinations recommendations.
 * Supports Quick, Standard, and Comprehensive recommendation modes.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { SmartValidation } from './smart-validation';
import {
  EnhancedSupportingExaminationsInputSchema,
  EnhancedSupportingExaminationsOutputSchema,
  type EnhancedSupportingExaminationsInput,
  type EnhancedSupportingExaminationsOutput,
  type QuickRecommendationInput,
  type StandardRecommendationInput,
  type ComprehensiveRecommendationInput,
} from './enhanced-supporting-examinations-types';

export async function suggestEnhancedSupportingExaminations(
  input: EnhancedSupportingExaminationsInput
): Promise<EnhancedSupportingExaminationsOutput> {
  return suggestEnhancedSupportingExaminationsFlow(input);
}

// Quick mode prompt for basic recommendations
const quickModePrompt = ai.definePrompt({
  name: 'quickSupportingExaminationsPrompt',
  input: {schema: z.object({
    mainComplaint: z.string(),
    diagnosis: z.string().optional(),
    context: z.object({
      patientAge: z.number().optional(),
      patientGender: z.enum(['Male', 'Female', 'Other']).optional(),
      specialization: z.enum(['General', 'Internal', 'Pediatric', 'Surgical', 'Emergency', 'Obstetric']).optional(),
      urgency: z.enum(['Routine', 'Urgent', 'Emergency']).optional(),
    }).optional(),
  })},
  output: {schema: EnhancedSupportingExaminationsOutputSchema},
  prompt: `Anda adalah AI asisten medis yang ahli dalam strategi diagnostik cepat.

  Berdasarkan keluhan utama pasien dan diagnosis awal (jika tersedia), berikan rekomendasi pemeriksaan penunjang yang paling relevan dan umum digunakan.

  **Data Pasien:**
  - Keluhan Utama: {{{mainComplaint}}}
  {{#if diagnosis}}- Diagnosis yang Mencurigakan: {{{diagnosis}}}{{/if}}
  {{#if context.patientAge}}- Usia: {{{context.patientAge}}} tahun{{/if}}
  {{#if context.patientGender}}- Jenis Kelamin: {{{context.patientGender}}}{{/if}}
  {{#if context.specialization}}- Spesialisasi: {{{context.specialization}}}{{/if}}
  {{#if context.urgency}}- Urgensi: {{{context.urgency}}}{{/if}}

  Tugas Anda adalah memberikan 2-3 rekomendasi pemeriksaan penunjang yang:
  1. Umum dan tersedia di fasilitas kesehatan dasar
  2. Memiliki nilai diagnostik tinggi untuk keluhan tersebut
  3. Relatif cepat dan tidak mahal
  4. Sesuai dengan urgensi yang dinyatakan

  Untuk setiap pemeriksaan, sertakan:
  - Nama pemeriksaan yang jelas
  - Alasan klinis singkat
  - Prioritas (High/Medium/Low)
  - Kategori pemeriksaan

  Mode: Quick - Rekomendasi dasar untuk kasus umum.
  `,
});

// Standard mode prompt for balanced recommendations
const standardModePrompt = ai.definePrompt({
  name: 'standardSupportingExaminationsPrompt',
  input: {schema: z.object({
    anamnesis: z.string(),
    physicalExam: z.string(),
    differentialDiagnoses: z.array(z.object({
      diagnosis: z.string(),
      confidence: z.number(),
      priority: z.enum(['High', 'Medium', 'Low']),
      reasoning: z.string(),
    })).optional(),
    context: z.object({
      patientAge: z.number().optional(),
      patientGender: z.enum(['Male', 'Female', 'Other']).optional(),
      specialization: z.enum(['General', 'Internal', 'Pediatric', 'Surgical', 'Emergency', 'Obstetric']).optional(),
      urgency: z.enum(['Routine', 'Urgent', 'Emergency']).optional(),
    }).optional(),
  })},
  output: {schema: EnhancedSupportingExaminationsOutputSchema},
  prompt: `Anda adalah AI asisten medis yang ahli dalam strategi diagnostik berbasis bukti.

  Berdasarkan anamnesis dan pemeriksaan fisik, berikan rekomendasi pemeriksaan penunjang yang terfokus dan efisien untuk membantu diagnosis.

  **Data Klinis:**
  - Anamnesis: {{{anamnesis}}}
  - Pemeriksaan Fisik: {{{physicalExam}}}
  {{#if differentialDiagnoses}}
  **Diagnosis Banding:**
  {{#each differentialDiagnoses}}
  - {{this.diagnosis}} (Keyakinan: {{this.confidence}}%, Prioritas: {{this.priority}})
    Alasan: {{this.reasoning}}
  {{/each}}
  {{/if}}
  {{#if context}}
  **Konteks Klinis:**
  {{#if context.patientAge}}- Usia: {{{context.patientAge}}} tahun{{/if}}
  {{#if context.patientGender}}- Jenis Kelamin: {{{context.patientGender}}}{{/if}}
  {{#if context.specialization}}- Spesialisasi: {{{context.specialization}}}{{/if}}
  {{#if context.urgency}}- Urgensi: {{{context.urgency}}}{{/if}}
  {{/if}}

  Strategi Anda harus:
  1. Fokus pada pemeriksaan yang membedakan diagnosis banding
  2. Pertimbangkan efisiensi biaya dan waktu
  3. Sesuaikan dengan spesialisasi dan urgensi
  4. Prioritaskan pemeriksaan dengan nilai prediktif tertinggi

  Berikan 3-5 rekomendasi dengan penjelasan klinis yang jelas.

  Mode: Standard - Rekomendasi berimbang untuk kasus klinis umum.
  `,
});

// Comprehensive mode prompt for detailed recommendations
const comprehensiveModePrompt = ai.definePrompt({
  name: 'comprehensiveSupportingExaminationsPrompt',
  input: {schema: z.object({
    anamnesis: z.string(),
    physicalExam: z.string(),
    differentialDiagnoses: z.array(z.object({
      diagnosis: z.string(),
      confidence: z.number(),
      priority: z.enum(['High', 'Medium', 'Low']),
      reasoning: z.string(),
      icd10Code: z.string().optional(),
    })),
    supportingFindings: z.string().optional(),
    context: z.object({
      patientAge: z.number().optional(),
      patientGender: z.enum(['Male', 'Female', 'Other']).optional(),
      specialization: z.enum(['General', 'Internal', 'Pediatric', 'Surgical', 'Emergency', 'Obstetric']).optional(),
      urgency: z.enum(['Routine', 'Urgent', 'Emergency']).optional(),
      previousExaminations: z.array(z.string()).optional(),
    }).optional(),
  })},
  output: {schema: EnhancedSupportingExaminationsOutputSchema},
  prompt: `Anda adalah AI asisten medis senior yang ahli dalam strategi diagnostik komprehensif dan evidence-based medicine.

  Lakukan analisis mendalam terhadap kasus kompleks ini dan berikan rekomendasi pemeriksaan penunjang yang terperinci dan terstruktur.

  **Data Klinis Lengkap:**
  - Anamnesis: {{{anamnesis}}}
  - Pemeriksaan Fisik: {{{physicalExam}}}
  {{#if supportingFindings}}- Hasil Penunjang Saat Ini: {{{supportingFindings}}}{{/if}}

  **Analisis Diagnosis Banding:**
  {{#each differentialDiagnoses}}
  - {{this.diagnosis}} (Keyakinan: {{this.confidence}}%, Prioritas: {{this.priority}})
    {{#if this.icd10Code}}Kode ICD-10: {{this.icd10Code}}{{/if}}
    Alasan: {{this.reasoning}}
  {{/each}}

  **Konteks Klinis:**
  {{#if context.patientAge}}- Usia: {{{context.patientAge}}} tahun{{/if}}
  {{#if context.patientGender}}- Jenis Kelamin: {{{context.patientGender}}}{{/if}}
  {{#if context.specialization}}- Spesialisasi: {{{context.specialization}}}{{/if}}
  {{#if context.urgency}}- Urgensi: {{{context.urgency}}}{{/if}}
  {{#if context.previousExaminations}}- Pemeriksaan Sebelumnya: {{#each context.previousExaminations}}{{this}}, {{/each}}{{/if}}

  Strategi komprehensif Anda harus mencakup:
  1. **Analisis diagnostic reasoning** untuk setiap diagnosis banding
  2. **Pemeriksaan screening** vs **konfirmatori**
  3. **Pertimbangan biaya-manfaat** dan **risiko-benefit**
  4. **Algoritma diagnosis** yang terstruktur
  5. **Alternatif dan plan B** jika pemeriksaan utama tidak tersedia
  6. **Contraindications** dan **patient safety considerations**

  Berikan 4-8 rekomendasi terperinci dengan:
  - Prioritas klinis yang jelas
  - Alasan evidence-based
  - Alternatif jika tidak tersedia
  - Contraindications yang perlu diwaspadai

  Mode: Comprehensive - Analisis mendalam untuk kasus kompleks.
  `,
});

const suggestEnhancedSupportingExaminationsFlow = ai.defineFlow(
  {
    name: 'suggestEnhancedSupportingExaminationsFlow',
    inputSchema: EnhancedSupportingExaminationsInputSchema,
    outputSchema: EnhancedSupportingExaminationsOutputSchema,
  },
  async (input) => {
    // Validate input and determine mode
    const validationInput = {
      anamnesis: 'anamnesis' in input ? input.anamnesis : undefined,
      physicalExam: 'physicalExam' in input ? input.physicalExam : undefined,
      mainComplaint: 'mainComplaint' in input ? input.mainComplaint : undefined,
      diagnosis: 'diagnosis' in input ? input.diagnosis : undefined,
      differentialDiagnoses: 'differentialDiagnoses' in input ? input.differentialDiagnoses : undefined,
    };

    const validation = SmartValidation.validate(validationInput);
    
    if (!validation.isValid && validation.score < 30) {
      throw new Error(`Data tidak cukup untuk memberikan rekomendasi. Skor: ${validation.score}/100. ${validation.warnings.join('. ')}`);
    }

    let result: EnhancedSupportingExaminationsOutput;

    try {
      // Route to appropriate mode based on input structure and validation
      let baseResult: any;
      
      if ('mainComplaint' in input && (!('anamnesis' in input) || validation.recommendationMode === 'Quick')) {
        // Quick mode
        baseResult = await quickModePrompt(input as QuickRecommendationInput);
      } else if ('anamnesis' in input && 'physicalExam' in input && validation.recommendationMode === 'Standard') {
        // Standard mode
        baseResult = await standardModePrompt(input as StandardRecommendationInput);
      } else {
        // Comprehensive mode (default for complex cases)
        baseResult = await comprehensiveModePrompt(input as ComprehensiveRecommendationInput);
      }

      // Ensure we have the proper structure
      result = {
        recommendations: baseResult.recommendations || [],
        dataCompleteness: validation.score,
        recommendationMode: validation.recommendationMode,
        confidenceLevel: validation.confidenceLevel,
        missingData: validation.missingFields,
        clinicalNotes: validation.warnings.length > 0 ? validation.warnings.join('. ') : undefined,
      };
      
      return result;
    } catch (error) {
      console.error('Error in enhanced supporting examinations flow:', error);
      throw new Error(`Gagal menghasilkan rekomendasi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);