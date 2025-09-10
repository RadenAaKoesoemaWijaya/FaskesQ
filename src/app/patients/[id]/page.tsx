'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPatientById } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import type { Patient, ScreeningResult } from '@/lib/types';
import { FileText, Stethoscope, User, History, ShieldQuestion, Venus, Mars, Clock, Edit, Beaker, Pill, Send, ClipboardPlus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SupportingExamForm } from '@/components/supporting-exam-form';
import { useEffect, useState, useRef } from 'react';
import { MedicalScribe } from '@/components/medical-scribe';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { type MedicalScribeOutput } from '@/app/actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useRouter } from 'next/navigation';

// Definisikan tipe untuk props halaman
interface PageProps {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

const formSchema = z.object({
  // Anamnesis
  mainComplaint: z.string().min(1, 'Keluhan utama tidak boleh kosong.'),
  presentIllness: z.string().min(1, 'Riwayat penyakit sekarang tidak boleh kosong.'),
  pastMedicalHistory: z.string().optional(),
  drugAllergy: z.string().optional(),
  // Physical Exam
  consciousness: z.string().min(1, "Tingkat kesadaran harus diisi"),
  bloodPressure: z.string().min(1, "Tekanan darah harus diisi"),
  heartRate: z.string().min(1, "Nadi harus diisi"),
  respiratoryRate: z.string().min(1, "Laju pernapasan harus diisi"),
  temperature: z.string().min(1, "Suhu harus diisi"),
  oxygenSaturation: z.string().optional(),
  eyes: z.string().optional(),
  nose: z.string().optional(),
  mouth: z.string().optional(),
  lungsInspection: z.string().optional(),
  lungsPalpation: z.string().optional(),
  lungsPercussion: z.string().optional(),
  lungsAuscultation: z.string().optional(),
  heartInspection: z.string().optional(),
  heartPalpation: z.string().optional(),
  heartPercussion: z.string().optional(),
  heartAuscultation: z.string().optional(),
  abdomenInspection: z.string().optional(),
  abdomenPalpation: z.string().optional(),
  abdomenPercussion: z.string().optional(),
  abdomenAuscultation: z.string().optional(),
  extremities: z.string().optional(),
  neurological: z.string().optional(),
   // Supporting Exam - Results
  completeBloodCount: z.string().optional(),
  urinalysis: z.string().optional(),
  bloodChemistry: z.string().optional(),
  microscopic: z.string().optional(),
  immunology: z.string().optional(),
  xray: z.string().optional(),
  ctScan: z.string().optional(),
  mri: z.string().optional(),
  ultrasound: z.string().optional(),
  petScan: z.string().optional(),
  ekg: z.string().optional(),
  eeg: z.string().optional(),
  emg: z.string().optional(),
  // Supporting Exam - Request
  requests: z.object({
    lab: z.object({
      completeBloodCount: z.boolean().default(false),
      urinalysis: z.boolean().default(false),
      bloodChemistry: z.boolean().default(false),
      microscopic: z.boolean().default(false),
      immunology: z.boolean().default(false),
    }).optional(),
    radiology: z.object({
      xray: z.boolean().default(false),
      ctScan: z.boolean().default(false),
      mri: z.boolean().default(false),
      ultrasound: z.boolean().default(false),
      petScan: z.boolean().default(false),
    }).optional(),
    other: z.object({
      ekg: z.boolean().default(false),
      eeg: z.boolean().default(false),
      emg: z.boolean().default(false),
    }).optional(),
    notes: z.string().optional(),
  }).optional(),
  // Assessment
  assessment: z.object({
    workingDiagnosis: z.string().min(1, 'Diagnosis kerja tidak boleh kosong.'),
    differentialDiagnosis: z.array(z.string()).optional(),
    summary: z.string().optional(),
  }).optional(),
  // Plan
  plan: z.object({
      prognosis: z.string().optional(),
      patientEducation: z.string().optional(),
      prescriptions: z.array(z.object({
          drugName: z.string().min(1, 'Nama obat harus diisi'),
          preparation: z.string().min(1, 'Sediaan harus diisi'),
          dose: z.string().min(1, 'Dosis harus diisi'),
          quantity: z.string().min(1, 'Jumlah harus diisi'),
      })).optional(),
      actions: z.string().optional(),
  }).optional(),
});

function ServiceTimer({ patientId }: { patientId: string }) {
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [isServiceActive, setIsServiceActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storageKey = `serviceStartTime-${patientId}`;
    let startTime = localStorage.getItem(storageKey);

    if (startTime === 'completed') {
      setIsServiceActive(false);
      return;
    }

    if (!startTime) {
      startTime = String(Date.now());
      localStorage.setItem(storageKey, startTime);
    }
    
    const start = parseInt(startTime, 10);
    setIsServiceActive(true);

    const updateTimer = () => {
       if (localStorage.getItem(storageKey) === 'completed') {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsServiceActive(false);
        setElapsedTime('Selesai');
        return;
      }
      const now = Date.now();
      const elapsed = Math.floor((now - start) / 1000);
      const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const seconds = String(elapsed % 60).padStart(2, '0');
      setElapsedTime(`${minutes}:${seconds}`);
    };
    
    updateTimer(); // Initial call
    intervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [patientId]);
  
  if (!isServiceActive) {
     return (
       <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
          <Clock className="h-4 w-4 text-green-500" />
          <span>Pelayanan Selesai</span>
        </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
      <Clock className="h-4 w-4 animate-pulse" />
      <span>Waktu Pelayanan: {elapsedTime}</span>
    </div>
  );
}

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
      <CardHeader className="flex flex-row justify-between items-start">
        <CardTitle>Informasi Demografis</CardTitle>
        <Button variant="outline" size="sm" asChild>
            <Link href={`/patients/${patient.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Pasien
            </Link>
        </Button>
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
    const { toast } = useToast();
    const router = useRouter();

    const handleRequestFeedback = (examId: string) => {
        console.log(`Requesting feedback for examination ${examId} for patient ${patient.name}`);
        toast({
            title: 'Permintaan Umpan Balik Disimulasikan',
            description: `Mengarahkan ke formulir testimoni untuk ${patient.name}.`,
        });
        router.push('/testimonials/new');
    }

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
                                <TableHead className="text-right">Tindakan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patient.history.map(record => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">{record.date}</TableCell>
                                    <TableCell>{record.diagnosis}</TableCell>
                                    <TableCell className="hidden md:table-cell truncate max-w-sm">{record.anamnesis}</TableCell>
                                     <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleRequestFeedback(record.id)}>
                                            <Send className="mr-2 h-4 w-4" />
                                            Minta Umpan Balik
                                        </Button>
                                    </TableCell>
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

function ScreeningHistory({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Skrining Kesehatan</CardTitle>
        <CardDescription>Hasil skrining kesehatan yang dilakukan melalui telekonsultasi AI.</CardDescription>
      </CardHeader>
      <CardContent>
        {patient.screeningHistory && patient.screeningHistory.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {patient.screeningHistory.map((result: ScreeningResult) => (
              <AccordionItem key={result.id} value={result.id} className="border rounded-lg px-4">
                <AccordionTrigger>
                  <div className='flex justify-between w-full pr-4'>
                    <span>{result.clusterName}</span>
                    <span className="text-muted-foreground font-normal">
                      {new Date(result.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pertanyaan</TableHead>
                        <TableHead>Jawaban</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.answers.map(answer => (
                        <TableRow key={answer.questionId}>
                          <TableCell>{answer.questionText}</TableCell>
                          <TableCell className="font-medium">{answer.answer}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Belum ada riwayat skrining.</p>
        )}
      </CardContent>
    </Card>
  );
}

function NewExaminationSection({ patient }: { patient: Patient }) {
  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { /* ... default values */ },
  });

  const handleScribeComplete = (data: MedicalScribeOutput) => {
    methods.setValue('mainComplaint', data.anamnesis.mainComplaint);
    methods.setValue('presentIllness', data.anamnesis.presentIllness);
    methods.setValue('pastMedicalHistory', data.anamnesis.pastMedicalHistory);
    methods.setValue('drugAllergy', data.anamnesis.drugAllergy);
    const { physicalExamination: exam } = data;
    methods.setValue('consciousness', exam.consciousness);
    methods.setValue('bloodPressure', exam.bloodPressure);
    methods.setValue('heartRate', exam.heartRate);
    methods.setValue('respiratoryRate', exam.respiratoryRate);
    methods.setValue('temperature', exam.temperature);
    methods.setValue('oxygenSaturation', exam.oxygenSaturation);
    methods.setValue('eyes', exam.eyes);
    methods.setValue('nose', exam.nose);
    methods.setValue('mouth', exam.mouth);
    methods.setValue('lungsInspection', exam.lungsInspection);
    methods.setValue('lungsPalpation', exam.lungsPalpation);
    methods.setValue('lungsPercussion', exam.lungsPercussion);
    methods.setValue('lungsAuscultation', exam.lungsAuscultation);
    methods.setValue('heartInspection', exam.heartInspection);
    methods.setValue('heartPalpation', exam.heartPalpation);
    methods.setValue('heartPercussion', exam.heartPercussion);
    methods.setValue('heartAuscultation', exam.heartAuscultation);
    methods.setValue('abdomenInspection', exam.abdomenInspection);
    methods.setValue('abdomenPalpation', exam.abdomenPalpation);
    methods.setValue('abdomenPercussion', exam.abdomenAuscultation);
    methods.setValue('abdomenAuscultation', exam.abdomenAuscultation);
    methods.setValue('extremities', exam.extremities);
    methods.setValue('neurological', exam.neurological);
    const { supportingExaminations: support } = data;
    methods.setValue('completeBloodCount', support.completeBloodCount);
    methods.setValue('urinalysis', support.urinalysis);
    methods.setValue('bloodChemistry', support.bloodChemistry);
    methods.setValue('microscopic', support.microscopic);
    methods.setValue('immunology', support.immunology);
    methods.setValue('xray', support.xray);
    methods.setValue('ctScan', support.ctScan);
    methods.setValue('mri', support.mri);
    methods.setValue('ultrasound', support.ultrasound);
    methods.setValue('petScan', support.petScan);
    methods.setValue('ekg', support.ekg);
    methods.setValue('eeg', support.eeg);
    methods.setValue('emg', support.emg);
    if (data.requests) {
        methods.setValue('requests.lab', data.requests.lab, { shouldDirty: true });
        methods.setValue('requests.radiology', data.requests.radiology, { shouldDirty: true });
        methods.setValue('requests.other', data.requests.other, { shouldDirty: true });
        methods.setValue('requests.notes', data.requests.notes, { shouldDirty: true });
    }
    const { plan } = data;
    methods.setValue('plan.prognosis', plan.prognosis);
    methods.setValue('plan.patientEducation', plan.patientEducation);
    methods.setValue('plan.actions', plan.actions);
    if (plan.prescriptions && plan.prescriptions.length > 0) {
        methods.reset({ ...methods.getValues(), 'plan.prescriptions': plan.prescriptions });
    } else {
        methods.reset({ ...methods.getValues(), 'plan.prescriptions': [{ drugName: '', preparation: '', dose: '', quantity: '' }] });
    }
    if(data.assessment) {
        methods.setValue('assessment.workingDiagnosis', data.assessment.workingDiagnosis);
        methods.setValue('assessment.differentialDiagnosis', data.assessment.differentialDiagnosis || []);
        methods.setValue('assessment.summary', data.assessment.summary);
    }
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
                      <SupportingExamForm patient={patient}/>
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
      } else {
        notFound();
      }
    }
    loadPatient();
  }, [id]);

  useEffect(() => {
    const handlePopState = () => {
      localStorage.removeItem(`serviceStartTime-${id}`);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
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

  const GenderIcon = patient.gender === 'Pria' ? Mars : patient.gender === 'Wanita' ? Venus : User;

  return (
    <div className="animate-in fade-in-50">
      <PageHeader title={patient.name}>
        <div className="flex items-center gap-4">
          <ServiceTimer patientId={patient.id} />
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary">
              <GenderIcon className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
        </div>
      </PageHeader>
      <Tabs defaultValue="examination" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-[800px]">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" /> Profil Pasien
          </TabsTrigger>
          <TabsTrigger value="examination">
            <Stethoscope className="mr-2 h-4 w-4" /> Pemeriksaan Baru
          </TabsTrigger>
           <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" /> Riwayat Medis
          </TabsTrigger>
           <TabsTrigger value="screening">
            <ShieldQuestion className="mr-2 h-4 w-4" /> Riwayat Skrining
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
         <TabsContent value="screening" className="mt-6">
            <ScreeningHistory patient={patient} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function PatientDetailPage({ params }: PageProps) {
  const { id } = params;
  if (!id) {
    notFound();
  }
  return <PatientDetailPageContent id={id} />;
}
