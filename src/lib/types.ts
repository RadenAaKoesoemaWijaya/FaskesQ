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
  findings: string;
  patientHistory: string;
  treatmentPlan?: TreatmentPlan;
};

export type TreatmentPlan = {
  medications: string;
  followUp: string;
};

export type Testimonial = {
  name: string;
  feedback: string;
  date: string;
};
