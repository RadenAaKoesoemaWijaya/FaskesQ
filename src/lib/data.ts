import type { Patient } from './types';

const patients: Patient[] = [
  {
    id: 'P001',
    name: 'John Doe',
    dateOfBirth: '1985-05-20',
    gender: 'Male',
    contact: 'john.doe@example.com',
    address: '123 Health St, Wellness City',
    avatarUrl: 'https://placehold.co/100x100.png',
    history: [
      {
        id: 'E001',
        date: '2023-10-15',
        findings: 'Patient reports persistent cough and fatigue.',
        patientHistory: 'Non-smoker, no history of respiratory illness.',
        treatmentPlan: {
          medications: 'Prescribed cough syrup and advised rest.',
          followUp: 'Follow-up in one week if symptoms persist.',
        },
      },
    ],
  },
  {
    id: 'P002',
    name: 'Jane Smith',
    dateOfBirth: '1992-11-30',
    gender: 'Female',
    contact: 'jane.smith@example.com',
    address: '456 Cure Ave, Remedy Town',
    avatarUrl: 'https://placehold.co/100x100.png',
    history: [],
  },
  {
    id: 'P003',
    name: 'Alex Johnson',
    dateOfBirth: '1978-02-10',
    gender: 'Other',
    contact: 'alex.j@example.com',
    address: '789 Clinic Rd, Healsburg',
    avatarUrl: 'https://placehold.co/100x100.png',
    history: [],
  },
  {
    id: 'P004',
    name: 'Emily White',
    dateOfBirth: '2001-07-22',
    gender: 'Female',
    contact: 'emily.w@example.com',
    address: '101 Medical Blvd, Careville',
    avatarUrl: 'https://placehold.co/100x100.png',
    history: [],
  },
];

export async function getPatients(): Promise<Patient[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return patients;
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return patients.find(p => p.id === id);
}
