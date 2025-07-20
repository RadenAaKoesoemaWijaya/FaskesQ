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

function VideoCallInterface({ patient }: { patient: Patient }) {
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Akses Kamera Ditolak',
          description:
            'Mohon izinkan akses kamera dan mikrofon di browser Anda.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [toast]);

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-grow bg-black rounded-t-lg flex items-center justify-center">
        {!hasCameraPermission ? (
            <Alert variant="destructive" className="w-auto">
                <AlertTitle>Kamera Tidak Dapat Diakses</AlertTitle>
                <AlertDescription>
                    Periksa kembali izin kamera pada browser Anda.
                </AlertDescription>
            </Alert>
        ) : (
            <video
            ref={videoRef}
            className="w-full h-full object-cover rounded-t-lg"
            autoPlay
            playsInline
            muted
            />
        )}
        <div className="absolute bottom-4 right-4 w-40 h-32 bg-gray-800 rounded-md border-2 border-gray-600">
          {/* Placeholder for doctor's video feed */}
          <div className="flex items-center justify-center h-full text-white text-xs">
            Kamera Anda
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 bg-secondary/50 p-4 rounded-b-lg flex justify-center items-center gap-4">
        <Button
          variant={isMuted ? 'destructive' : 'secondary'}
          size="icon"
          className="rounded-full h-12 w-12"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff /> : <Mic />}
        </Button>
        <Button
          variant={isCameraOff ? 'destructive' : 'secondary'}
          size="icon"
          className="rounded-full h-12 w-12"
          onClick={() => setIsCameraOff(!isCameraOff)}
        >
          {isCameraOff ? <VideoOff /> : <Video />}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="rounded-full h-14 w-14"
        >
          <PhoneOff />
        </Button>
      </div>
    </div>
  );
}

function ChatInterface({ patient }: { patient: Patient }) {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'patient', text: `Halo Dokter, saya ${patient.name}.` },
        { id: 2, sender: 'doctor', text: `Halo ${patient.name}, ada yang bisa saya bantu?` },
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        setMessages([...messages, { id: Date.now(), sender: 'doctor', text: newMessage }]);
        setNewMessage('');
        // Simulate patient response
        setTimeout(() => {
             setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'patient', text: 'Baik dokter, terima kasih atas informasinya.' }]);
        }, 1500)
    }

    return (
        <div className="flex flex-col h-full">
            <ScrollArea className="flex-grow p-4 space-y-4">
                {messages.map(msg => (
                     <div key={msg.id} className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${msg.sender === 'doctor' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                           {msg.text}
                        </div>
                    </div>
                ))}
            </ScrollArea>
            <form onSubmit={handleSendMessage} className="flex-shrink-0 p-4 border-t">
                <div className="relative">
                    <Input
                        placeholder="Ketik pesan..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="pr-12"
                    />
                    <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    )
}

function TeleconsultationContent() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [mode, setMode] = useState<'chat' | 'video' | null>(null);

  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    async function fetchPatients() {
      const fetchedPatients = await getPatients(query);
      setPatients(fetchedPatients);
    }
    fetchPatients();
  }, [query]);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setMode(null); // Reset mode when a new patient is selected
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
              <div className="flex flex-col h-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Sesi dengan {selectedPatient.name}</CardTitle>
                      <CardDescription>
                        Pilih mode konsultasi di bawah ini.
                      </CardDescription>
                    </div>
                    {mode && (
                      <div className="flex gap-2">
                        <Button variant={mode === 'chat' ? 'default' : 'outline'} onClick={() => setMode('chat')}>
                            <MessageSquare className="mr-2 h-4 w-4" /> Chat
                        </Button>
                         <Button variant={mode === 'video' ? 'default' : 'outline'} onClick={() => setMode('video')}>
                            <Video className="mr-2 h-4 w-4" /> Video
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <Separator />
                <div className="flex-grow">
                  {!mode ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                      <Avatar className="h-24 w-24">
                        <AvatarImage
                          src={selectedPatient.avatarUrl}
                          alt={selectedPatient.name}
                        />
                        <AvatarFallback>
                          {selectedPatient.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h2 className="text-2xl font-bold">
                        Mulai Konsultasi dengan {selectedPatient.name}
                      </h2>
                      <p className="text-muted-foreground">
                        Pilih mode konsultasi untuk memulai sesi.
                      </p>
                      <div className="flex gap-4 mt-4">
                        <Button size="lg" onClick={() => setMode('chat')}>
                          <MessageSquare className="mr-2" /> Mulai Chat
                        </Button>
                        <Button size="lg" onClick={() => setMode('video')}>
                          <Video className="mr-2" /> Mulai Video Call
                        </Button>
                      </div>
                    </div>
                  ) : mode === 'chat' ? (
                     <ChatInterface patient={selectedPatient} />
                  ) : (
                     <VideoCallInterface patient={selectedPatient} />
                  )}
                </div>
              </div>
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
