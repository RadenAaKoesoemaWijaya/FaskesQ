export type Patient = {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: 'Pria' | 'Wanita' | 'Lainnya';
  contact: string;
  address: string;
  avatarUrl: string;
  nik: string;
  insuranceNumber?: string;
  paymentMethod: 'Tunai' | 'Asuransi' | 'BPJS';
  medicalRecordNumber: string;
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

export type Testimonial = {
  id: string;
  patientName: string;
  feedback: string;
  rating: number;
  date: string;
};
