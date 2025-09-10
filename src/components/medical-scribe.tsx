'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Bot, Loader2, AlertTriangle, RotateCcw, Pause } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from './ui/textarea';
import { runMedicalScribe, type MedicalScribeOutput } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface MedicalScribeProps {
  onScribeComplete: (data: MedicalScribeOutput) => void;
}

type RecordingState = 'inactive' | 'recording' | 'paused' | 'error';

export function MedicalScribe({ onScribeComplete }: MedicalScribeProps) {
  const { toast } = useToast();
  const [recordingState, setRecordingState] = useState<RecordingState>('inactive');
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef('');

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            accumulatedTranscriptRef.current += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(accumulatedTranscriptRef.current + interimTranscript);
      };

      recognition.onend = () => {
        // Otomatis berhenti jika state bukan 'recording' (misal, karena jeda atau stop manual)
        if (recordingState === 'recording') {
            // Jika terhenti sendiri, coba mulai ulang.
            console.log("Speech recognition stopped unexpectedly. Restarting...");
            recognition.start();
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        let errorMessage = `Terjadi kesalahan: ${event.error}. Pastikan Anda telah memberikan izin mikrofon.`;
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            errorMessage = "Izin mikrofon ditolak. Aktifkan izin mikrofon di pengaturan browser Anda untuk menggunakan fitur ini.";
        } else if (event.error === 'no-speech') {
            errorMessage = "Tidak ada suara terdeteksi. Silakan coba lagi.";
        }
        toast({
            variant: "destructive",
            title: "Error Pengenalan Suara",
            description: errorMessage,
        });
        setRecordingState('error');
      };

    } else {
         toast({
            variant: "destructive",
            title: "Browser Tidak Mendukung",
            description: "Maaf, browser Anda tidak mendukung fitur pengenalan suara. Silakan gunakan Google Chrome.",
        });
        setRecordingState('error');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const handleStartRecording = () => {
    if (recognitionRef.current) {
        accumulatedTranscriptRef.current = transcript; // Simpan transkrip yang ada
        recognitionRef.current.start();
        setRecordingState('recording');
    }
  };

  const handlePauseRecording = () => {
    if (recognitionRef.current) {
        recognitionRef.current.stop(); // Menghentikan sementara, onend akan menangani state
        setRecordingState('paused');
    }
  };

  const handleStopRecording = () => {
     if (recognitionRef.current) {
        recognitionRef.current.stop();
        setRecordingState('inactive');
    }
  }

  const handleReset = () => {
    handleStopRecording();
    setTranscript('');
    accumulatedTranscriptRef.current = '';
  }

  const handleProcessTranscript = async () => {
    if (!transcript.trim()) {
        toast({
            title: "Transkrip Kosong",
            description: "Tidak ada transkrip untuk diproses.",
            variant: "destructive"
        })
        return;
    };
    
    setIsProcessing(true);
    handleStopRecording(); // Hentikan rekaman sebelum memproses
    const result = await runMedicalScribe({ transcript });
    setIsProcessing(false);

    if (result.success && result.data) {
        toast({
            title: "Pemrosesan Berhasil",
            description: "Formulir telah diisi berdasarkan transkrip."
        });
      onScribeComplete(result.data);
    } else {
         toast({
            title: "Pemrosesan Gagal",
            description: result.error || "Terjadi kesalahan yang tidak diketahui.",
            variant: "destructive"
        });
    }
  };
  
  const getStatusMessage = () => {
    switch (recordingState) {
        case 'recording':
            return { text: 'Sedang mendengarkan...', icon: <Loader2 className="animate-spin h-4 w-4" /> };
        case 'paused':
            return { text: 'Rekaman dijeda. Klik Mulai Merekam untuk melanjutkan.', icon: <Pause className="h-4 w-4" /> };
        case 'inactive':
            return { text: 'Klik Mulai Merekam untuk transkripsi suara.', icon: null };
        case 'error':
            return { text: 'Terjadi error. Periksa konsol atau izin browser.', icon: <AlertTriangle className="h-4 w-4 text-destructive" /> };
        default:
            return { text: '', icon: null };
    }
  }

  const { text: statusText, icon: statusIcon } = getStatusMessage();

  return (
    <Card className="bg-secondary/50 mb-6">
      <CardHeader className='pb-4'>
        <CardTitle className="flex items-center gap-2">
          <Bot className="text-primary" />
          AI Medical Scribe
        </CardTitle>
        <CardDescription>
          Rekam percakapan Anda dengan pasien secara langsung. AI akan membuat transkrip dan mengisi kolom yang relevan secara otomatis.
        </CardDescription>
      </CardHeader>
      <CardContent>
         {recordingState === 'error' && !recognitionRef.current && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Fitur Tidak Tersedia</AlertTitle>
                <AlertDescription>
                Pengenalan suara tidak didukung di browser ini. Coba gunakan Google Chrome atau browser modern lainnya.
                </AlertDescription>
            </Alert>
         )}
         {recordingState !== 'error' && (
            <div className='space-y-4'>
                <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap">
                    {recordingState !== 'recording' && (
                        <Button onClick={handleStartRecording} size="lg" disabled={isProcessing} className="w-full sm:w-auto">
                            <Mic className="mr-2" />
                            {recordingState === 'paused' ? 'Lanjutkan Merekam' : 'Mulai Merekam'}
                        </Button>
                    )}
                    {recordingState === 'recording' && (
                        <Button onClick={handlePauseRecording} size="lg" variant="secondary" disabled={isProcessing} className="w-full sm:w-auto">
                            <Pause className="mr-2" />
                            Jeda Merekam
                        </Button>
                    )}
                     <Button onClick={handleStopRecording} size="lg" variant="destructive" disabled={recordingState === 'inactive'} className="w-full sm:w-auto">
                        <MicOff className="mr-2" />
                        Hentikan
                    </Button>
                     <Button onClick={handleReset} size="lg" variant="outline" disabled={isProcessing || transcript.length === 0}>
                        <RotateCcw className="mr-2" />
                        Reset
                    </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground min-h-[20px]">
                    {statusIcon}
                    <span>{statusText}</span>
                </div>
                
                <Textarea
                    placeholder="Transkrip percakapan akan muncul di sini..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={8}
                    readOnly={recordingState === 'recording'}
                />
                
                <Button onClick={handleProcessTranscript} disabled={isProcessing || !transcript.trim() || recordingState === 'recording'}>
                    {isProcessing && <Loader2 className="mr-2 animate-spin" />}
                    {isProcessing ? 'Memproses...' : 'Proses Transkrip dengan AI'}
                </Button>
            </div>
         )}
      </CardContent>
    </Card>
  );
}
