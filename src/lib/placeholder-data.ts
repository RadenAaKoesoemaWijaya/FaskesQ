
// src/lib/placeholder-data.ts

import type { Patient, Testimonial, ScreeningCluster, ScreeningQuestion, Examination, ScreeningResult } from './types';

export const examinations: Examination[] = [
  {
    id: 'exam-1',
    patient_id: 'patient-1',
    date: '2023-10-15',
    anamnesis: 'Pasien mengeluh batuk pilek selama 3 hari.',
    physicalExamination: 'TTV dalam batas normal, faring hiperemis ringan.',
    supportingExaminations: 'Tidak dilakukan.',
    diagnosis: 'Common Cold',
    prescriptionsAndActions: 'Simptomatik, istirahat cukup.',
    medicalResume: 'Pasien didiagnosis dengan common cold, diberikan terapi simptomatik.',
    created_at: '2023-10-15T09:00:00Z',
  },
  {
    id: 'exam-2',
    patient_id: 'patient-2',
    date: '2023-11-20',
    anamnesis: 'Kontrol rutin hipertensi.',
    physicalExamination: 'TD: 140/90 mmHg, lainnya dalam batas normal.',
    supportingExaminations: 'Tidak dilakukan.',
    diagnosis: 'Hipertensi esensial',
    prescriptionsAndActions: 'Lanjutkan Amlodipin 1x5mg.',
    medicalResume: 'Kontrol hipertensi, tekanan darah sedikit meningkat. Terapi dilanjutkan.',
    created_at: '2023-11-20T11:00:00Z',
  },
];

export const screeningResults: ScreeningResult[] = [
    {
        id: 'sr-1',
        patient_id: 'patient-2',
        date: '2024-05-10T10:00:00Z',
        created_at: '2024-05-10T10:00:00Z',
        clusterName: 'Skrining Dewasa (19-64 tahun)',
        answers: [
            { questionId: 'q-d-1', questionText: 'Apakah Anda merokok?', answer: 'Tidak' },
            { questionId: 'q-d-2', questionText: 'Apakah Anda mengonsumsi alkohol?', answer: 'Jarang' },
        ]
    }
];

export const patients: Patient[] = [
  {
    id: 'patient-1',
    name: 'Ahmad Yusuf',
    nik: '3273010101900001',
    medicalRecordNumber: 'MR001',
    dateOfBirth: '1990-01-01',
    gender: 'Pria',
    contact: 'ahmad.yusuf@email.com',
    address: 'Jl. Merdeka No. 1, Bandung',
    paymentMethod: 'BPJS',
    insuranceNumber: '0001234567890',
    avatarUrl: 'https://i.pravatar.cc/150?u=patient-1',
    history: examinations.filter(e => e.patient_id === 'patient-1'),
    screeningHistory: screeningResults.filter(s => s.patient_id === 'patient-1'),
    created_at: '2023-01-15T08:00:00Z',
  },
  {
    id: 'patient-2',
    name: 'Budi Santoso',
    nik: '3273020202850002',
    medicalRecordNumber: 'MR002',
    dateOfBirth: '1985-02-02',
    gender: 'Pria',
    contact: 'budi.santoso@email.com',
    address: 'Jl. Asia Afrika No. 2, Bandung',
    paymentMethod: 'Asuransi',
    insuranceNumber: 'ASR-987654',
    avatarUrl: 'https://i.pravatar.cc/150?u=patient-2',
    history: examinations.filter(e => e.patient_id === 'patient-2'),
    screeningHistory: screeningResults.filter(s => s.patient_id === 'patient-2'),
    created_at: '2023-02-20T09:30:00Z',
  },
  {
    id: 'patient-3',
    name: 'Citra Lestari',
    nik: '3273030303950003',
    medicalRecordNumber: 'MR003',
    dateOfBirth: '1995-03-03',
    gender: 'Wanita',
    contact: 'citra.lestari@email.com',
    address: 'Jl. Braga No. 3, Bandung',
    paymentMethod: 'Tunai',
    insuranceNumber: '',
    avatarUrl: 'https://i.pravatar.cc/150?u=patient-3',
    history: examinations.filter(e => e.patient_id === 'patient-3'),
    screeningHistory: screeningResults.filter(s => s.patient_id === 'patient-3'),
    created_at: '2023-03-10T14:00:00Z',
  },
  {
    id: 'patient-4',
    name: 'Dewi Anggraini',
    nik: '3273040404700004',
    medicalRecordNumber: 'MR004',
    dateOfBirth: '1970-04-04',
    gender: 'Wanita',
    contact: 'dewi.anggraini@email.com',
    address: 'Jl. Setiabudi No. 4, Bandung',
    paymentMethod: 'BPJS',
    insuranceNumber: '0002345678901',
    avatarUrl: 'https://i.pravatar.cc/150?u=patient-4',
    history: examinations.filter(e => e.patient_id === 'patient-4'),
    screeningHistory: screeningResults.filter(s => s.patient_id === 'patient-4'),
    created_at: '2023-04-05T10:15:00Z',
  },
    {
    id: 'patient-5',
    name: 'Eko Prasetyo',
    nik: '3273050505880005',
    medicalRecordNumber: 'MR005',
    dateOfBirth: '1988-05-05',
    gender: 'Pria',
    contact: 'eko.prasetyo@email.com',
    address: 'Jl. Cihampelas No. 5, Bandung',
    paymentMethod: 'Tunai',
    insuranceNumber: '',
    avatarUrl: 'https://i.pravatar.cc/150?u=patient-5',
    history: [],
    screeningHistory: [],
    created_at: '2024-05-01T11:00:00Z',
  },
  {
    id: 'patient-6',
    name: 'Fiona Wijaya',
    nik: '3273060606020006',
    medicalRecordNumber: 'MR006',
    dateOfBirth: '2002-06-06',
    gender: 'Wanita',
    contact: 'fiona.wijaya@email.com',
    address: 'Jl. Pasteur No. 6, Bandung',
    paymentMethod: 'Asuransi',
    insuranceNumber: 'ASR-112233',
    avatarUrl: 'https://i.pravatar.cc/150?u=patient-6',
    history: [],
    screeningHistory: [],
    created_at: '2024-05-02T13:45:00Z',
  },
];

export const testimonials: Testimonial[] = [
  {
    id: 'testi-1',
    patientName: 'Ahmad Yusuf',
    feedback: 'Pelayanan sangat baik dan dokter sangat informatif.',
    rating: 5,
    date: '2023-10-16T10:00:00Z',
    created_at: '2023-10-16T10:00:00Z',
  },
  {
    id: 'testi-2',
    patientName: 'Dewi Anggraini',
    feedback: 'Penjelasan dokter mudah dimengerti, namun waktu tunggu agak lama.',
    rating: 4,
    date: '2023-11-21T10:00:00Z',
    created_at: '2023-11-21T10:00:00Z',
  },
];

export const screeningQuestions: ScreeningQuestion[] = [
    // Bayi & Anak
    { id: 'q-a-1', cluster_id: 'cluster-1', text: 'Apakah status imunisasi anak lengkap sesuai jadwal?', created_at: '2023-01-01T00:00:00Z' },
    { id: 'q-a-2', cluster_id: 'cluster-1', text: 'Bagaimana pola makan dan tidur anak?', created_at: '2023-01-01T00:00:00Z' },
    // Remaja
    { id: 'q-r-1', cluster_id: 'cluster-2', text: 'Apakah ada keluhan terkait pubertas?', created_at: '2023-01-01T00:00:00Z' },
    { id: 'q-r-2', cluster_id: 'cluster-2', text: 'Apakah ada riwayat perundungan (bullying) di sekolah?', created_at: '2023-01-01T00:00:00Z' },
    // Dewasa
    { id: 'q-d-1', cluster_id: 'cluster-3', text: 'Apakah Anda merokok?', created_at: '2023-01-01T00:00:00Z' },
    { id: 'q-d-2', cluster_id: 'cluster-3', text: 'Apakah Anda mengonsumsi alkohol secara rutin?', created_at: '2023-01-01T00:00:00Z' },
    { id: 'q-d-3', cluster_id: 'cluster-3', text: 'Seberapa sering Anda berolahraga dalam seminggu?', created_at: '2023-01-01T00:00:00Z' },
    // Lansia
    { id: 'q-l-1', cluster_id: 'cluster-4', text: 'Apakah pernah jatuh dalam 6 bulan terakhir?', created_at: '2023-01-01T00:00:00Z' },
    { id: 'q-l-2', cluster_id: 'cluster-4', text: 'Apakah Anda mengalami kesulitan mengingat sesuatu?', created_at: '2023-01-01T00:00:00Z' },
];

export const screeningClusters: ScreeningCluster[] = [
  {
    id: 'cluster-1',
    name: 'Skrining Bayi & Anak (0-11 tahun)',
    ageRange: { min: 0, max: 11 },
    questions: screeningQuestions.filter(q => q.cluster_id === 'cluster-1'),
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cluster-2',
    name: 'Skrining Remaja (12-18 tahun)',
    ageRange: { min: 12, max: 18 },
    questions: screeningQuestions.filter(q => q.cluster_id === 'cluster-2'),
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cluster-3',
    name: 'Skrining Dewasa (19-64 tahun)',
    ageRange: { min: 19, max: 64 },
    questions: screeningQuestions.filter(q => q.cluster_id === 'cluster-3'),
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cluster-4',
    name: 'Skrining Lansia (>= 65 tahun)',
    ageRange: { min: 65, max: 150 },
    questions: screeningQuestions.filter(q => q.cluster_id === 'cluster-4'),
    created_at: '2023-01-01T00:00:00Z',
  },
];
