import type { Patient } from './types';

const patients: Patient[] = [
  {
    id: 'P001',
    name: 'Budi Santoso',
    dateOfBirth: '1985-05-20',
    gender: 'Pria',
    contact: 'budi.santoso@example.com',
    address: 'Jl. Sehat 123, Kota Bugar',
    avatarUrl: 'https://placehold.co/100x100.png',
    history: [
      {
        id: 'E001',
        date: '2023-10-15',
        findings: 'Pasien melaporkan batuk terus-menerus dan kelelahan.',
        patientHistory: 'Bukan perokok, tidak ada riwayat penyakit pernapasan.',
        treatmentPlan: {
          medications: 'Diberi resep obat batuk dan disarankan istirahat.',
          followUp: 'Kontrol kembali dalam satu minggu jika gejala berlanjut.',
        },
      },
    ],
  },
  {
    id: 'P002',
    name: 'Siti Aminah',
    dateOfBirth: '1992-11-30',
    gender: 'Wanita',
    contact: 'siti.aminah@example.com',
    address: 'Jl. Waras 456, Kota Sejahtera',
    avatarUrl: 'https://placehold.co/100x100.png',
    history: [],
  },
  {
    id: 'P003',
    name: 'Alex Wijaya',
    dateOfBirth: '1978-02-10',
    gender: 'Lainnya',
    contact: 'alex.w@example.com',
    address: 'Jl. Klinik 789, Kota Sembuh',
    avatarUrl: 'https://placehold.co/100x100.png',
    history: [],
  },
  {
    id: 'P004',
    name: 'Dewi Lestari',
    dateOfBirth: '2001-07-22',
    gender: 'Wanita',
    contact: 'dewi.l@example.com',
    address: 'Jl. Medis 101, Kota Rawat',
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
