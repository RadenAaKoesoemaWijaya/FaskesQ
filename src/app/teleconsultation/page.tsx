'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { PageHeader } from '@/components/page-header';
import { getPatients } from '@/lib/data';
import type { Patient } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  Video,
  Send,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
  MessageSquare,
  Phone,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSearchParams, useRouter } from 'next/navigation';

function PatientList({
  patients,
  onSelectPatient,
  selectedPatientId,
}: {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  selectedPatientId: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get('q') as string;
    router.push(`/teleconsultation?q=${searchQuery}`);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Pilih Pasien</CardTitle>
        <form onSubmit={handleSearch} className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            placeholder="Cari pasien..."
            className="w-full bg-background pl-8"
            defaultValue={query}
          />
        </form>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent>
          <div className="space-y-2">
            {patients.map((patient) => (
              <Button
                key={patient.id}
                variant={
                  selectedPatientId === patient.id ? 'secondary' : 'ghost'
                }
                className="w-full h-auto justify-start p-2"
                onClick={() => onSelectPatient(patient)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={patient.avatarUrl} alt={patient.name} />
                  <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 text-left">
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {patient.medicalRecordNumber}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

function WhatsAppIntegration({ patient }: { patient: Patient }) {

  const formatPhoneNumber = (email: string) => {
    // This is a placeholder function. In a real app, you'd have a dedicated phone field.
    // We'll try to extract a number from the email or use a default.
    // E.g. budi.santoso.6281234567890@example.com -> 6281234567890
    const match = email.match(/(\d{10,})/);
    if (match) return match[0];
    // return a valid test number if no number is found in email
    return '6281234567890';
  }

  const phoneNumber = formatPhoneNumber(patient.contact);

  const handleWhatsAppChat = () => {
    const url = `https://wa.me/${phoneNumber}`;
    window.open(url, '_blank');
  };

  const handleWhatsAppVideo = () => {
    const message = encodeURIComponent('Halo, saya siap untuk memulai sesi video call telekonsultasi kita.');
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <Avatar className="h-24 w-24">
            <AvatarImage
            src={patient.avatarUrl}
            alt={patient.name}
            />
            <AvatarFallback>
            {patient.name.charAt(0)}
            </AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-bold">
            Mulai Konsultasi dengan {patient.name}
        </h2>
        <p className="text-muted-foreground max-w-sm">
            Gunakan tombol di bawah untuk memulai sesi chat atau video call dengan pasien melalui WhatsApp.
        </p>
        <Alert>
          <Phone className="h-4 w-4" />
          <AlertTitle>Nomor WhatsApp Pasien</AlertTitle>
          <AlertDescription>
            Akan terhubung ke nomor: <strong>+{phoneNumber}</strong>
          </AlertDescription>
        </Alert>
        <div className="flex gap-4 mt-4">
            <Button size="lg" onClick={handleWhatsAppChat}>
            <MessageSquare className="mr-2" /> Mulai Chat WhatsApp
            </Button>
            <Button size="lg" onClick={handleWhatsAppVideo} variant="outline">
            <Video className="mr-2" /> Video Call via WhatsApp
            </Button>
        </div>
    </div>
  );
}


function TeleconsultationContent() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    async function fetchPatients() {
      const fetchedPatients = await getPatients(query);
      setPatients(fetchedPatients);
       if (fetchedPatients.length > 0) {
        setSelectedPatient(fetchedPatients[0]);
      }
    }
    fetchPatients();
  }, [query]);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  return (
    <div className="animate-in fade-in-50">
      <PageHeader title="Telekonsultasi" />
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        style={{ height: 'calc(100vh - 12rem)' }}
      >
        <div className="lg:col-span-1 h-full">
          <PatientList
            patients={patients}
            onSelectPatient={handleSelectPatient}
            selectedPatientId={selectedPatient?.id || null}
          />
        </div>
        <div className="lg:col-span-2 h-full">
          <Card className="h-full">
            {selectedPatient ? (
              <WhatsAppIntegration patient={selectedPatient} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <p>Pilih pasien dari daftar di sebelah kiri</p>
                  <p>untuk memulai sesi telekonsultasi.</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function TeleconsultationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TeleconsultationContent />
        </Suspense>
    )
}
