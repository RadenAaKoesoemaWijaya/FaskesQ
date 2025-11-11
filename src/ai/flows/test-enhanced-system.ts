import { SmartValidation } from './smart-validation';
import { suggestEnhancedSupportingExaminations } from './enhanced-suggest-supporting-examinations';
import { DiagnosisIntegration } from './diagnosis-integration';

async function testEnhancedSystem() {
  console.log('🧪 Testing Enhanced Supporting Examinations System...\n');

  // Test 1: Smart Validation
  console.log('1️⃣ Testing Smart Validation...');
  
  const testCases = [
    {
      name: 'Quick Mode - Minimal Data',
      input: {
        mainComplaint: 'Demam dan sakit kepala',
        diagnosis: 'Demam Tifoid'
      }
    },
    {
      name: 'Standard Mode - Moderate Data', 
      input: {
        mainComplaint: 'Demam tinggi 5 hari',
        diagnosis: 'Demam Tifoid',
        anamnesis: 'Pasien mengeluh demam tinggi selama 5 hari, sakit kepala, dan nyeri abdomen',
        physicalExam: 'T: 39°C, TD: 110/70, N: 90, S: 20'
      }
    },
    {
      name: 'Comprehensive Mode - Complete Data',
      input: {
        mainComplaint: 'Demam tinggi disertai ruam',
        diagnosis: 'Demam Berdarah',
        anamnesis: 'Demam tinggi 3 hari, ruah merah di seluruh tubuh, nyeri otot, mual',
        physicalExam: 'T: 39.5°C, TD: 100/60, N: 95, ruah makulopapuler di thorax dan ekstremitas',
        differentialDiagnoses: [
          { diagnosis: 'Demam Berdarah', confidence: 80, priority: 'high', reasoning: 'Demam tinggi dengan ruah karakteristik' },
          { diagnosis: 'Chikungunya', confidence: 20, priority: 'medium', reasoning: 'Demam dengan nyeri otot' }
        ]
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}:`);
    const result = SmartValidation.validate(testCase.input);
    console.log(`   Mode: ${result.recommendationMode}, Confidence: ${result.confidenceLevel}, Score: ${result.score}`);
    console.log(`   Missing: ${result.missingFields.join(', ') || 'None'}`);
    console.log(`   Warnings: ${result.warnings.join('. ') || 'None'}`);
  }

  // Test 2: Enhanced AI Recommendations
  console.log('\n\n2️⃣ Testing Enhanced AI Recommendations...');
  
  const enhancedTestCase = {
    anamnesis: 'Pasien datang dengan keluhan demam tinggi selama 3 hari, disertai ruah merah di seluruh tubuh, nyeri otot, dan mual. Tidak ada riwayat perjalanan ke daerah endemis.',
    physicalExam: 'T: 39.5°C, TD: 100/60 mmHg, N: 95 x/menit, ruah makulopapuler di thorax dan ekstremitas. Tidak ada ikterik. Tidak ada nyeri tekan abdomen.',
    differentialDiagnoses: [
      { diagnosis: 'Demam Berdarah', confidence: 80, priority: 'High' as const, reasoning: 'Demam tinggi dengan ruah karakteristik' },
      { diagnosis: 'Chikungunya', confidence: 20, priority: 'Medium' as const, reasoning: 'Demam dengan nyeri otot' }
    ],
    context: {
      patientAge: 28,
      patientGender: 'Male' as const,
      specialization: 'Internal' as const,
      urgency: 'Urgent' as const
    }
  };

  try {
    const enhancedResult = await suggestEnhancedSupportingExaminations(enhancedTestCase);
    console.log('\n✅ Enhanced AI Recommendations:');
    console.log(`   Mode: ${enhancedResult.recommendationMode}`);
    console.log(`   Confidence Level: ${enhancedResult.confidenceLevel}`);
    console.log(`   Data Completeness: ${enhancedResult.dataCompleteness}%`);
    console.log(`   Recommendations Count: ${enhancedResult.recommendations.length}`);
    
    enhancedResult.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec.examination} (Priority: ${rec.priority}, Confidence: ${Math.round(rec.confidence)}%)`);
      console.log(`      Reasoning: ${rec.reasoning}`);
      if (rec.alternatives && rec.alternatives.length > 0) {
        console.log(`      Alternatives: ${rec.alternatives.join(', ')}`);
      }
    });
  } catch (error) {
    console.log('❌ Enhanced AI failed:', error instanceof Error ? error.message : String(error));
  }

  // Test 3: Diagnosis Integration
  console.log('\n\n3️⃣ Testing Diagnosis Integration...');
  
  const integrationTestCase = {
    anamnesis: 'Pasien wanita 30 tahun mengeluh demam tinggi selama 3 hari, disertai ruah merah di seluruh tubuh, nyeri otot, dan mual. Tidak ada riwayat perjalanan ke daerah endemis.',
    physicalExam: 'T: 39°C, TD: 110/70, N: 90, ruah makulopapuler di thorax dan ekstremitas. Tidak ada ikterik. Tidak ada nyeri tekan abdomen.'
  };

  try {
    const enhancedDiagnoses = await DiagnosisIntegration.getEnhancedDiagnoses(
      integrationTestCase.anamnesis,
      integrationTestCase.physicalExam
    );
    console.log('\n✅ Diagnosis Integration Results:');
    console.log(`   Diagnoses Count: ${enhancedDiagnoses.length}`);
    
    console.log('\n   Top Diagnoses:');
    enhancedDiagnoses.slice(0, 3).forEach((diag, index) => {
      console.log(`   ${index + 1}. ${diag.diagnosis} (Confidence: ${diag.confidence}%, Priority: ${diag.priority})`);
      console.log(`      Reasoning: ${diag.reasoning}`);
    });
    
    // Test diagnosis quality validation
    const qualityResult = DiagnosisIntegration.validateDiagnosesQuality(enhancedDiagnoses);
    console.log(`\n   Quality Score: ${qualityResult.qualityScore}/100`);
    console.log(`   Valid: ${qualityResult.isValid}`);
    if (qualityResult.issues.length > 0) {
      console.log(`   Issues: ${qualityResult.issues.join(', ')}`);
    }
  } catch (error) {
    console.log('❌ Diagnosis Integration failed:', error instanceof Error ? error.message : String(error));
  }

  console.log('\n\n🎉 Enhanced System Testing Complete!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testEnhancedSystem().catch(console.error);
}

export { testEnhancedSystem };