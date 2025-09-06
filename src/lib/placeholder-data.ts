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

    // Tuberkulosis
    { id: 'q-tb-1', cluster_id: 'cluster-tb', text: 'Apakah Anda mengalami batuk berdahak selama 2 minggu atau lebih?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-tb-2', cluster_id: 'cluster-tb', text: 'Apakah batuk disertai dahak bercampur darah?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-tb-3', cluster_id: 'cluster-tb', text: 'Apakah Anda mengalami demam, keringat malam, dan penurunan berat badan tanpa sebab yang jelas?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-tb-4', cluster_id: 'cluster-tb', text: 'Apakah ada anggota keluarga atau kontak erat yang menderita TBC?', created_at: '2024-01-01T00:00:00Z' },

    // Anemia & Thalassemia
    { id: 'q-at-1', cluster_id: 'cluster-anemia', text: 'Apakah Anda sering merasa cepat lelah, lemah, atau pusing?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-at-2', cluster_id: 'cluster-anemia', text: 'Apakah Anda terlihat pucat (terutama pada kelopak mata, bibir, dan telapak tangan)?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-at-3', cluster_id: 'cluster-anemia', text: 'Apakah ada riwayat keluarga dengan Thalassemia atau kelainan darah lainnya?', created_at: '2024-01-01T00:00:00Z' },

    // Kesehatan Jiwa (SRQ-20)
    { id: 'q-kj-1', cluster_id: 'cluster-jiwa', text: 'Apakah Anda sering menderita sakit kepala?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-kj-2', cluster_id: 'cluster-jiwa', text: 'Apakah Anda kehilangan nafsu makan?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-kj-3', cluster_id: 'cluster-jiwa', text: 'Apakah tidur Anda tidak nyenyak?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-kj-4', cluster_id: 'cluster-jiwa', text: 'Apakah Anda mudah merasa takut?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-kj-5', cluster_id: 'cluster-jiwa', text: 'Apakah Anda merasa tegang, cemas, atau khawatir?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-kj-6', cluster_id: 'cluster-jiwa', text: 'Apakah tangan Anda gemetar?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-kj-7', cluster_id: 'cluster-jiwa', text: 'Apakah pencernaan Anda terganggu?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-kj-8', cluster_id: 'cluster-jiwa', text: 'Apakah Anda sulit berpikir jernih?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-kj-9', cluster_id: 'cluster-jiwa', text: 'Apakah Anda merasa tidak bahagia?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-kj-10', cluster_id: 'cluster-jiwa', text: 'Apakah Anda lebih sering menangis?', created_at: '2024-01-01T00:00:00Z' },

    // Diabetes Melitus
    { id: 'q-dm-1', cluster_id: 'cluster-dm', text: 'Apakah Anda sering merasa haus dan sering buang air kecil, terutama pada malam hari?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-dm-2', cluster_id: 'cluster-dm', text: 'Apakah Anda sering merasa lapar meskipun sudah makan?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-dm-3', cluster_id: 'cluster-dm', text: 'Apakah Anda mengalami penurunan berat badan tanpa sebab yang jelas?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-dm-4', cluster_id: 'cluster-dm', text: 'Apakah Anda memiliki riwayat keluarga dengan Diabetes Melitus?', created_at: '2024-01-01T00:00:00Z' },

    // Hipertensi
    { id: 'q-ht-1', cluster_id: 'cluster-hipertensi', text: 'Apakah Anda sering mengalami sakit kepala atau pusing di bagian belakang kepala?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-ht-2', cluster_id: 'cluster-hipertensi', text: 'Apakah Anda memiliki riwayat tekanan darah tinggi?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-ht-3', cluster_id: 'cluster-hipertensi', text: 'Apakah Anda mengonsumsi makanan tinggi garam secara berlebihan?', created_at: '2024-01-01T00:00:00Z' },

    // Geriatri
    { id: 'q-g-1', cluster_id: 'cluster-geriatri', text: 'Apakah Anda membutuhkan bantuan orang lain untuk aktivitas seperti makan, mandi, atau berpakaian (Activity of Daily Living)?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-g-2', cluster_id: 'cluster-geriatri', text: 'Dalam 2 minggu terakhir, apakah Anda merasa sedih, murung, atau putus asa (Skrining Depresi - GDS)?', created_at: '2024-01-01T00:00:00Z' },
    { id: 'q-g-3', cluster_id: 'cluster-geriatri', text: 'Dalam 2 minggu terakhir, apakah Anda kehilangan minat atau kegembiraan dalam melakukan sesuatu?', created_at: '2024-01-01T00:00:00Z' },
];

export const screeningClusters: ScreeningCluster[] = [
  {
    id: 'cluster-1',
    name: 'Skrining Pertumbuhan (0-18 tahun)',
    ageRange: { min: 0, max: 18 },
    questions: screeningQuestions.filter(q => q.cluster_id === 'cluster-1' || q.cluster_id === 'cluster-2'),
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cluster-3',
    name: 'Skrining Gaya Hidup (19-64 tahun)',
    ageRange: { min: 19, max: 64 },
    questions: screeningQuestions.filter(q => q.cluster_id === 'cluster-3'),
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cluster-tb',
    name: 'Skrining Tuberkulosis (TBC)',
    ageRange: { min: 0, max: 150 },
    questions: screeningQuestions.filter(q => q.cluster_id === 'cluster-tb'),
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cluster-anemia',
    name: 'Skrining Anemia & Thalassemia',
    ageRange: { min: 0, max: 150 },
    questions: screeningQuestions.filter(q => q.cluster_id === 'cluster-anemia'),
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cluster-jiwa',
    name: 'Skrining Kesehatan Jiwa (SRQ-20)',
    ageRange: { min: 15, max: 150 },
    questions: screeningQuestions.filter(q => q.cluster_id === 'cluster-jiwa'),
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cluster-dm',
    name: 'Skrining Diabetes Melitus',
    ageRange: { min: 18, max: 150 },
    questions: screeningQuestions.filter(q => q.cluster_id === 'cluster-dm'),
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cluster-hipertensi',
    name: 'Skrining Hipertensi',
    ageRange: { min: 18, max: 150 },
    questions: screeningQuestions.filter(q => q.cluster_id === 'cluster-hipertensi'),
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cluster-geriatri',
    name: 'Skrining Geriatri (>60 tahun)',
    ageRange: { min: 60, max: 150 },
    questions: screeningQuestions.filter(q => q.cluster_id === 'cluster-geriatri' || q.cluster_id === 'cluster-4'),
    created_at: '2024-01-01T00:00:00Z',
  },
];
