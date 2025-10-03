'use client';

import { useState, useEffect, Suspense } from 'react';
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
  MessageSquare,
  Phone,
  ArrowLeft,
  User,
  Venus,
  Mars
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSearchParams, useRouter } from 'next/navigation';
import { TelegramConsultation } from '@/components/telegram-consultation';
import { WhatsAppConsultation } from '@/components/whatsapp-consultation';

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
            defaultValue={searchParams.get('q') || ''}
          />
        </form>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent>
          <div className="space-y-2">
            {patients.map((patient) => {
              const GenderIcon = patient.gender === 'Pria' ? Mars : patient.gender === 'Wanita' ? Venus : User;
              return (
                <Button
                  key={patient.id}
                  variant={
                    selectedPatientId === patient.id ? 'secondary' : 'ghost'
                  }
                  className="w-full h-auto justify-start p-2"
                  onClick={() => onSelectPatient(patient)}
                >
                  <Avatar className="h-10 w-10">
                     <AvatarFallback className="bg-primary/10 text-primary">
                        <GenderIcon className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 text-left">
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.medicalRecordNumber}
                    </p>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

function ConsultationModeSelector({
  patient,
  onModeSelect,
}: {
  patient: Patient;
  onModeSelect: (mode: 'telegram' | 'whatsapp') => void;
}) {
   const formatPhoneNumber = (contact: string) => {
    // Basic attempt to extract a valid phone number.
    // In a real app, this should be a robust library.
    const digits = contact.replace(/\D/g, '');
    if (digits.startsWith('08')) {
        return '62' + digits.substring(1);
    }
    if (digits.startsWith('62')) {
        return digits;
    }
    // Fallback for demo purposes
    return '6281234567890';
  }

  const phoneNumber = formatPhoneNumber(patient.contact);

  const handleWhatsAppChat = () => {
    onModeSelect('whatsapp');
  };
  
  const GenderIcon = patient.gender === 'Pria' ? Mars : patient.gender === 'Wanita' ? Venus : User;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      <Avatar className="h-24 w-24">
        <AvatarFallback className="bg-primary/10 text-primary text-4xl">
            <GenderIcon className="h-12 w-12" />
        </AvatarFallback>
      </Avatar>
      <h2 className="text-2xl font-bold">
        Mulai Konsultasi dengan {patient.name}
      </h2>
      <p className="text-muted-foreground max-w-sm">
        Pilih metode telekonsultasi yang ingin Anda gunakan.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full max-w-md">
        <Card className="flex-1 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className='flex items-center gap-2'><MessageSquare /> Via Telegram</CardTitle>
            <CardDescription>
              Konsultasi melalui aplikasi Telegram dengan fitur rekaman suara.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => onModeSelect('telegram')}>
              Mulai Chat Telegram
            </Button>
          </CardContent>
        </Card>
        <Card className="flex-1 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className='flex items-center gap-2'><Phone /> Via WhatsApp</CardTitle>
            <CardDescription>
              Terhubung langsung dengan pasien melalui WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" onClick={handleWhatsAppChat}>
              <MessageSquare className="mr-2" /> Mulai Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TeleconsultationContent() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [consultationMode, setConsultationMode] = useState<'telegram' | 'whatsapp' | null>(null);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    async function fetchPatients() {
      setLoading(true);
      const fetchedPatients = await getPatients(query);
      setPatients(fetchedPatients);
      if (fetchedPatients.length > 0 && !selectedPatient) {
        // Find if a patient was pre-selected from query params
        const preSelectedId = searchParams.get('patientId');
        const preSelected = fetchedPatients.find(p => p.id === preSelectedId);
        setSelectedPatient(preSelected || fetchedPatients[0]);
      }
      setLoading(false);
    }
    fetchPatients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    const patientId = searchParams.get('patientId');
    const mode = searchParams.get('mode');
    
    if (patientId && patients.length > 0) {
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        setSelectedPatient(patient);
      }
    }
    
    if (mode === 'telegram' || mode === 'whatsapp') {
      setConsultationMode(mode);
    }
  }, [searchParams, patients]);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setConsultationMode(null); // Reset mode when patient changes
    // Update URL parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('patientId', patient.id);
    router.push(`?${params.toString()}`);
  };

  const handleModeSelect = (mode: 'telegram' | 'whatsapp') => {
    setConsultationMode(mode);
    // Update URL parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', mode);
    router.push(`?${params.toString()}`);
  };
  
  const handleBackToSelection = () => {
     setConsultationMode(null);
     // Update URL parameter
     const params = new URLSearchParams(searchParams.toString());
     params.delete('mode');
     router.push(`?${params.toString()}`);
   };

  const renderContent = () => {
    if (loading) {
        return <div className="flex items-center justify-center h-full">Memuat data pasien...</div>;
    }
    if (!selectedPatient) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <p>Pilih pasien dari daftar di sebelah kiri</p>
            <p>untuk memulai sesi telekonsultasi.</p>
          </div>
        </div>
      );
    }
    
    if (consultationMode === 'telegram') {
        return <TelegramConsultation patient={selectedPatient} onBack={handleBackToSelection} />;
    }
    
    if (consultationMode === 'whatsapp') {
        return <WhatsAppConsultation patient={selectedPatient} onBack={handleBackToSelection} />;
    }

    return (
      <ConsultationModeSelector
        patient={selectedPatient}
        onModeSelect={handleModeSelect}
      />
    );
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
          <Card className="h-full flex flex-col">
            {renderContent()}
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
  );
}
