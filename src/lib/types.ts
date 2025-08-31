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

export type Patient = PatientRegistrationData & {
  id: string;
  avatarUrl: string;
  history: Examination[];
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
