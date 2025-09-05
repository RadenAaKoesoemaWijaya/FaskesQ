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
}

export type ScreeningQuestion = {
  id: string;
  text: string;
};

export type ScreeningAnswer = {
  questionId: string;
  questionText: string;
  answer: string;
}

export type ScreeningResult = {
  id: string;
  date: string;
  clusterName: string;
  answers: ScreeningAnswer[];
}

export type Patient = PatientRegistrationData & {
  id: string;
  avatarUrl: string;
  history: Examination[];
  screeningHistory?: ScreeningResult[];
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
};

export type TestimonialSubmissionData = {
  patientName: string;
  feedback: string;
  rating: number;
}

export type Testimonial = TestimonialSubmissionData & {
  id: string;
  date: string;
};


export type ScreeningCluster = {
    id: string;
    name: string;
    ageRange: {
        min: number;
        max: number;
    };
    questions: ScreeningQuestion[];
}
