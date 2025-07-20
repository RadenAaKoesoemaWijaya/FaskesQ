export type Patient = {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  address: string;
  avatarUrl: string;
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
