'use client';

import React from 'react';
import { notFound, useRouter } from 'next/navigation';
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

// Omitting schema and other components for brevity as they are not the source of the error

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

  // Effect to clear timer on navigation
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
          {/* <ServiceTimer patientId={patient.id} /> */}
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary">
              <GenderIcon className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
        </div>
      </PageHeader>
      <Tabs defaultValue="examination" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-[800px]">
          <TabsTrigger value="profile">Profil Pasien</TabsTrigger>
          <TabsTrigger value="examination">Pemeriksaan Baru</TabsTrigger>
          <TabsTrigger value="history">Riwayat Medis</TabsTrigger>
          <TabsTrigger value="screening">Riwayat Skrining</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          {/* <PatientProfile patient={patient} /> */}
        </TabsContent>
        <TabsContent value="examination" className="mt-6">
            {/* <NewExaminationSection patient={patient} /> */}
        </TabsContent>
         <TabsContent value="history" className="mt-6">
            {/* <MedicalHistory patient={patient} /> */}
        </TabsContent>
         <TabsContent value="screening" className="mt-6">
            {/* <ScreeningHistory patient={patient} /> */}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// NEW SOLUTION: Define the component as a const with an arrow function
const PatientDetailPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  if (!id) {
    notFound();
  }
  return <PatientDetailPageContent id={id} />;
};

export default PatientDetailPage;
