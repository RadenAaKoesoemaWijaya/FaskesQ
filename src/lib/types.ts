export type PatientRegistrationData = {
  name: string;
  dateOfBirth: string;
  gender: 'Pria' | 'Wanita' | 'Lainnya';
  contact: string;
  address: string;
  nik: string;
  insuranceNumber?: string;
  paymentMethod: 'Tunai' | 'Asuransi' | 'BPJS';
  medicalRecordNumber: string;
  status: 'Hijau' | 'Kuning' | 'Merah';
}

export type ScreeningQuestion = {
  id: string;
  cluster_id: string;
  text: string;
  created_at: string;
};

export type ScreeningAnswer = {
  questionId: string;
  questionText: string;
  answer: string;
}

export type ScreeningResult = {
  id: string;
  patient_id: string;
  date: string;
  clusterName: string;
  answers: ScreeningAnswer[];
  created_at: string;
}

export type Patient = PatientRegistrationData & {
  id: string;
  history: Examination[];
  screeningHistory?: ScreeningResult[];
  allergies?: string[];
  age?: number;
  medicalHistory?: string[];
  currentMedications?: string[];
  created_at: string;
};

export type Examination = {
  id: string;
  date: string;
  anamnesis: string;
  physicalExamination: string;
  supportingExaminations: string;
  diagnosis: string;
  prescriptionsAndActions: string;
  medicalResume: string;
  patient_id: string;
  created_at: string;
};

export type TestimonialSubmissionData = {
  patientName: string;
  feedback: string;
  rating: number;
}

export type Testimonial = TestimonialSubmissionData & {
  id: string;
  date: string;
  created_at: string;
};

export type ScreeningCluster = {
    id: string;
    name: string;
    ageRange: {
        min: number;
        max: number;
    };
    questions: ScreeningQuestion[];
    created_at: string;
}

export type TopDisease = {
    name: string;
    count: number;
}
