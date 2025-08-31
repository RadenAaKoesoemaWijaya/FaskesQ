import type { Patient, PatientRegistrationData, Testimonial, TestimonialSubmissionData } from './types';

let patients: Patient[] = [
  {
    id: 'P001',
    name: 'Budi Santoso',
    dateOfBirth: '1985-05-20',
    gender: 'Pria',
    contact: 'budi.santoso@example.com',
    address: 'Jl. Sehat 123, Kota Bugar',
    avatarUrl: 'https://placehold.co/100x100.png',
    nik: '3171234567890001',
    medicalRecordNumber: 'MR001',
    paymentMethod: 'BPJS',
    insuranceNumber: '0001234567890',
    history: [
      {
        id: 'E001',
        date: '2023-10-15',
        anamnesis: 'Pasien datang dengan keluhan batuk kering selama 3 hari disertai demam ringan dan sakit kepala. Tidak ada sesak napas.',
        physicalExamination: 'Keadaan umum baik, kesadaran compos mentis. Tanda vital: TD 120/80 mmHg, N 88x/menit, RR 20x/menit, S 37.8°C. Pemeriksaan tenggorokan hiperemis.',
        supportingExaminations: 'Tidak dilakukan.',
        diagnosis: 'Common Cold (ISPA Virus)',
        prescriptionsAndActions: 'Diberikan resep Paracetamol 3x500mg jika demam, dan obat batuk sirup 3x1 sendok takar. Disarankan istirahat cukup dan minum banyak air.',
        medicalResume: 'Pasien laki-laki 38 tahun datang dengan gejala batuk dan demam, didiagnosis sebagai common cold. Diberikan terapi simtomatik dan edukasi untuk istirahat. Kontrol jika gejala memberat.'
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
    nik: '3171234567890002',
    medicalRecordNumber: 'MR002',
    paymentMethod: 'Asuransi',
    insuranceNumber: 'INS-98765',
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
    nik: '3171234567890003',
    medicalRecordNumber: 'MR003',
    paymentMethod: 'Tunai',
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
    nik: '3171234567890004',
    medicalRecordNumber: 'MR004',
    paymentMethod: 'BPJS',
    insuranceNumber: '0002345678901',
    history: [],
  },
];

let testimonials: Testimonial[] = [
    {
        id: 'T001',
        patientName: 'Budi Santoso',
        feedback: 'Penjelasan dokter sangat jelas dan mudah dimengerti. Fasilitas bersih dan pelayanannya cepat. Sangat direkomendasikan!',
        rating: 5,
        date: '2023-10-18',
    },
    {
        id: 'T002',
        patientName: 'Alex Wijaya',
        feedback: 'Proses pendaftaran sedikit membingungkan, tetapi staf sangat membantu. Waktu tunggu tidak terlalu lama.',
        rating: 4,
        date: '2023-11-05',
    },
    {
        id: 'T003',
        patientName: 'Siti Aminah',
        feedback: 'Dokter sangat ramah dan sabar menjawab semua pertanyaan saya. Saya merasa jauh lebih baik setelah konsultasi.',
        rating: 4.5,
        date: '2023-11-20',
    }
];

export async function getPatients(query?: string): Promise<Patient[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  if (!query) {
    return patients;
  }
  const lowercasedQuery = query.toLowerCase();
  return patients.filter(p => 
    p.name.toLowerCase().includes(lowercasedQuery) ||
    p.id.toLowerCase().includes(lowercasedQuery) ||
    p.medicalRecordNumber.toLowerCase().includes(lowercasedQuery)
  );
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return patients.find(p => p.id === id);
}

export async function addPatient(data: PatientRegistrationData): Promise<string> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newPatientId = `P${String(patients.length + 1).padStart(3, '0')}`;
  
  const newPatient: Patient = {
    ...data,
    id: newPatientId,
    avatarUrl: 'https://placehold.co/100x100.png',
    history: [],
  };

  patients.unshift(newPatient); // Add to the beginning of the array
  
  return newPatientId;
}

export async function updatePatient(id: string, data: Partial<PatientRegistrationData>): Promise<Patient> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const patientIndex = patients.findIndex(p => p.id === id);
    if (patientIndex === -1) {
        throw new Error("Patient not found");
    }
    patients[patientIndex] = { ...patients[patientIndex], ...data };
    return patients[patientIndex];
}

export async function deletePatient(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const initialLength = patients.length;
    patients = patients.filter(p => p.id !== id);
    if (patients.length === initialLength) {
        throw new Error("Patient not found");
    }
}


export async function getTestimonials(): Promise<Testimonial[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return testimonials.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addTestimonial(data: TestimonialSubmissionData): Promise<Testimonial> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newTestimonial: Testimonial = {
        id: `T${String(testimonials.length + 1).padStart(3, '0')}`,
        ...data,
        date: new Date().toISOString(),
    };

    testimonials.unshift(newTestimonial);
    return newTestimonial;
}
