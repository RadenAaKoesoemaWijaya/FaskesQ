'use client';

import { notFound } from 'next/navigation';
import { getPatientById } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnamnesisForm } from '@/components/anamnesis-form';
import { PhysicalExamForm } from '@/components/physical-exam-form';
import { DiagnosisForm } from '@/components/diagnosis-form';
import { TherapyForm } from '@/components/therapy-form';
import type { Patient } from '@/lib/types';
import { FileText, Stethoscope, User, History, Syringe, ClipboardPlus, Pill, Beaker } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SupportingExamForm } from '@/components/supporting-exam-form';
import { useEffect, useState } from 'react';
import type { MedicalScribeOutput } from '@/ai/flows/medical-scribe-flow';
import { MedicalScribe } from '@/components/medical-scribe';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  // Anamnesis
  mainComplaint: z.string().min(1, 'Keluhan utama tidak boleh kosong.'),
  presentIllness: z.string().min(1, 'Riwayat penyakit sekarang tidak boleh kosong.'),
  pastMedicalHistory: z.string().optional(),
  drugAllergy: z.string().optional(),
  // Physical Exam
  consciousness: z.string().min(1, "Tingkat kesadaran harus dipilih"),
  bloodPressure: z.string().min(1, "Tekanan darah harus diisi"),
  heartRate: z.string().min(1, "Nadi harus diisi"),
  respiratoryRate: z.string().min(1, "Laju pernapasan harus diisi"),
  temperature: z.string().min(1, "Suhu harus diisi"),
  eyes: z.string().optional(),
  nose: z.string().optional(),
  mouth: z.string().optional(),
  chest: z.string().optional(),
  lungs: z.string().optional(),
  heart: z.string().optional(),
  abdomen: z.string().optional(),
  extremities: z.string().optional(),
   // Supporting Exam
  labResults: z.string().optional(),
  radiologyResults: z.string().optional(),
  otherResults: z.string().optional(),
  fileUpload: z.any().optional(),
  // Diagnosis
  primaryDiagnosis: z.string().min(1, 'Diagnosis primer harus diisi.'),
  secondaryDiagnosis: z.string().optional(),
  // Therapy
  prescriptions: z.array(z.object({
    drugName: z.string().min(1, 'Nama obat harus diisi'),
    preparation: z.string().min(1, 'Sediaan harus diisi'),
    dose: z.string().min(1, 'Dosis harus diisi'),
    quantity: z.string().min(1, 'Jumlah harus diisi'),
  })),
  actions: z.string().optional(),
});


function PatientProfile({ patient }: { patient: Patient }) {
  const getAge = (dateString: string) => {
    if (!dateString) return '';
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Demografis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Nama Lengkap</p>
            <p>{patient.name}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">No. Rekam Medis</p>
            <p>{patient.medicalRecordNumber}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Tanggal Lahir</p>
            <p>
              {patient.dateOfBirth} ({getAge(patient.dateOfBirth)} tahun)
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Jenis Kelamin</p>
            <p>
              <Badge variant="secondary">{patient.gender}</Badge>
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Kontak</p>
            <p>{patient.contact}</p>
          </div>
           <div>
            <p className="font-medium text-muted-foreground">Metode Pembayaran</p>
            <p>{patient.paymentMethod} {patient.insuranceNumber && `(${patient.insuranceNumber})`}</p>
          </div>
          <div className="md:col-span-2">
            <p className="font-medium text-muted-foreground">Alamat</p>
            <p>{patient.address}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MedicalHistory({ patient }: { patient: Patient }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Riwayat Pemeriksaan</CardTitle>
                <CardDescription>Daftar semua pemeriksaan yang telah dilakukan untuk pasien ini.</CardDescription>
            </CardHeader>
            <CardContent>
                {patient.history && patient.history.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Diagnosis</TableHead>
                                <TableHead className="hidden md:table-cell">Anamnesis</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patient.history.map(record => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">{record.date}</TableCell>
                                    <TableCell>{record.diagnosis}</TableCell>
                                    <TableCell className="hidden md:table-cell truncate max-w-sm">{record.anamnesis}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Belum ada riwayat pemeriksaan.</p>
                )}
            </CardContent>
        </Card>
    )
}

function NewExaminationSection({ patient }: { patient: Patient }) {
  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
     defaultValues: {
      mainComplaint: '',
      presentIllness: '',
      pastMedicalHistory: '',
      drugAllergy: '',
      consciousness: '',
      bloodPressure: '',
      heartRate: '',
      respiratoryRate: '',
      temperature: '',
      eyes: '',
      nose: '',
      mouth: '',
      chest: '',
      lungs: '',
      heart: '',
      abdomen: '',
      extremities: '',
      labResults: '',
      radiologyResults: '',
      otherResults: '',
      primaryDiagnosis: '',
      secondaryDiagnosis: '',
      prescriptions: [{ drugName: '', preparation: '', dose: '', quantity: '' }],
      actions: '',
    },
  });

  const handleScribeComplete = (data: MedicalScribeOutput) => {
    methods.setValue('mainComplaint', data.anamnesis.mainComplaint);
    methods.setValue('presentIllness', data.anamnesis.presentIllness);
    methods.setValue('pastMedicalHistory', data.anamnesis.pastMedicalHistory);
    methods.setValue('drugAllergy', data.anamnesis.drugAllergy);

    methods.setValue('consciousness', data.physicalExamination.consciousness);
    methods.setValue('bloodPressure', data.physicalExamination.bloodPressure);
    methods.setValue('heartRate', data.physicalExamination.heartRate);
    methods.setValue('respiratoryRate', data.physicalExamination.respiratoryRate);
    methods.setValue('temperature', data.physicalExamination.temperature);
  };
  
  return (
    <FormProvider {...methods}>
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
              <FileText /> Catat Rekam Medis
              </CardTitle>
              <CardDescription>
              Gunakan AI Scribe untuk merekam percakapan, atau isi formulir di bawah ini secara manual.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <MedicalScribe onScribeComplete={handleScribeComplete} />
              <Tabs defaultValue="anamnesis" className="w-full mt-6">
                  <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="anamnesis"><Stethoscope className="mr-2 h-4 w-4" />Anamnesis</TabsTrigger>
                      <TabsTrigger value="physical-exam"><User className="mr-2 h-4 w-4" />Pemeriksaan Fisik</TabsTrigger>
                      <TabsTrigger value="supporting-exam"><Beaker className="mr-2 h-4 w-4" />Penunjang</TabsTrigger>
                      <TabsTrigger value="diagnosis"><ClipboardPlus className="mr-2 h-4 w-4" />Diagnosis</TabsTrigger>
                      <TabsTrigger value="therapy"><Pill className="mr-2 h-4 w-4" />Terapi & Tindakan</TabsTrigger>
                  </TabsList>
                  <TabsContent value="anamnesis" className="mt-6">
                      <AnamnesisForm />
                  </TabsContent>
                  <TabsContent value="physical-exam" className="mt-6">
                      <PhysicalExamForm />
                  </TabsContent>
                  <TabsContent value="supporting-exam" className="mt-6">
                      <SupportingExamForm />
                  </TabsContent>
                  <TabsContent value="diagnosis" className="mt-6">
                      <DiagnosisForm />
                  </TabsContent>
                  <TabsContent value="therapy" className="mt-6">
                      <TherapyForm />
                  </TabsContent>
              </Tabs>
          </CardContent>
      </Card>
    </FormProvider>
  )
}

function PatientDetailPageContent({ id }: { id: string }) {
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    async function loadPatient() {
      const fetchedPatient = await getPatientById(id);
      if (fetchedPatient) {
        setPatient(fetchedPatient);
      }
    }
    loadPatient();
  }, [id]);

  if (!patient) {
    return (
       <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted animate-pulse"></div>
          <div className="h-8 w-48 rounded bg-muted animate-pulse"></div>
        </div>
        <div className="h-10 w-full md:w-[600px] rounded bg-muted animate-pulse mt-8"></div>
        <Card className="mt-6">
          <CardContent className="pt-6">
             <div className="h-64 w-full rounded bg-muted animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-50">
      <PageHeader title={patient.name}>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={patient.avatarUrl} alt={patient.name} data-ai-hint="person face" />
            <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </PageHeader>
      <Tabs defaultValue="examination" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[600px]">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" /> Profil Pasien
          </TabsTrigger>
          <TabsTrigger value="examination">
            <Stethoscope className="mr-2 h-4 w-4" /> Pemeriksaan Baru
          </TabsTrigger>
           <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" /> Riwayat Medis
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <PatientProfile patient={patient} />
        </TabsContent>
        <TabsContent value="examination" className="mt-6">
            <NewExaminationSection patient={patient} />
        </TabsContent>
         <TabsContent value="history" className="mt-6">
            <MedicalHistory patient={patient} />
        </TabsContent>
      </Tabs>
    </div>
  );
}


export default function PatientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!params.id) {
    notFound();
  }
  return <PatientDetailPageContent id={params.id} />;
}
