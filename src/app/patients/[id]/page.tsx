'use client';

// React and Next.js imports
import React, { use, useEffect, useState, useRef } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';

// Data and type imports
import { getPatientById } from '@/lib/data';
import type { Patient, ScreeningResult } from '@/lib/types';
import { type MedicalScribeOutput } from '@/app/actions';

// Component imports
import { PageHeader } from '@/components/page-header';
import { AnamnesisForm } from '@/components/anamnesis-form';
import { PhysicalExamForm } from '@/components/physical-exam-form';
import { DiagnosisForm } from '@/components/diagnosis-form';
import { TherapyForm } from '@/components/therapy-form';
import { SupportingExamForm } from '@/components/supporting-exam-form';
import { MedicalScribe } from '@/components/medical-scribe';
import { PatientRegistrationForm } from '@/components/patient-registration-form';

// UI imports
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Icon imports
import { FileText, Stethoscope, User, History, ShieldQuestion, Venus, Mars, Clock, Edit, Beaker, Pill, Send, ClipboardPlus } from 'lucide-react';

// Hook imports
import { useForm, FormProvider } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';

// Zod for validation
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define the main form schema
const formSchema = z.object({
    mainComplaint: z.string().min(1, 'Keluhan utama tidak boleh kosong.'),
    presentIllness: z.string().min(1, 'Riwayat penyakit sekarang tidak boleh kosong.'),
    pastMedicalHistory: z.string().optional(),
    drugAllergy: z.string().optional(),
    consciousness: z.string().min(1, "Tingkat kesadaran harus diisi"),
    bloodPressure: z.string().min(1, "Tekanan darah harus diisi"),
    heartRate: z.string().min(1, "Nadi harus diisi"),
    respiratoryRate: z.string().min(1, "Laju pernapasan harus diisi"),
    temperature: z.string().min(1, "Suhu harus diisi"),
    oxygenSaturation: z.string().optional(),
    // Add all other form fields here...
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
            {/* Content for patient profile */}
        </CardContent>
      </Card>
    );
  }

// Other child components (MedicalHistory, ScreeningHistory, NewExaminationSection) would be here

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

  // Loading skeleton
  if (!patient) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
            <CardContent><Skeleton className="h-40 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  const GenderIcon = patient.gender === 'Pria' ? Mars : patient.gender === 'Wanita' ? Venus : User;

  // Render the actual page content
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
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4"/>Profil Pasien</TabsTrigger>
          <TabsTrigger value="examination"><Stethoscope className="mr-2 h-4 w-4"/>Pemeriksaan Baru</TabsTrigger>
          <TabsTrigger value="history"><History className="mr-2 h-4 w-4"/>Riwayat Medis</TabsTrigger>
          <TabsTrigger value="screening"><ShieldQuestion className="mr-2 h-4 w-4"/>Riwayat Skrining</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <PatientProfile patient={patient} />
        </TabsContent>
        {/* Other TabsContent would be here */}
      </Tabs>
    </div>
  );
}

// FINAL FIX: Use React.use() to unwrap the params promise
const PatientDetailPage = ({ params }: { params: { id: string } }) => {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  if (!id) {
    notFound();
  }
  
  return <PatientDetailPageContent id={id} />;
};

export default PatientDetailPage;
