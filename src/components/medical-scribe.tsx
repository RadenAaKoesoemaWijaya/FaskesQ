'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Bot, Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from './ui/textarea';
import { runMedicalScribe, type MedicalScribeOutput } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface MedicalScribeProps {
  onScribeComplete: (data: MedicalScribeOutput) => void;
}

export function MedicalScribe({ onScribeComplete }: MedicalScribeProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

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
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        setTranscript(prev => prev + finalTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        toast({
            variant: "destructive",
            title: "Error Pengenalan Suara",
            description: `Terjadi kesalahan: ${event.error}. Pastikan Anda telah memberikan izin mikrofon.`,
        });
        setIsRecording(false);
      };

    } else {
         toast({
            variant: "destructive",
            title: "Browser Tidak Mendukung",
            description: "Maaf, browser Anda tidak mendukung fitur pengenalan suara.",
        });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  const handleToggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleResetTranscript = () => {
    setTranscript('');
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
  }

  const handleProcessTranscript = async () => {
    if (!transcript) {
        toast({
            title: "Transkrip Kosong",
            description: "Tidak ada transkrip untuk diproses.",
            variant: "destructive"
        })
        return;
    };
    
    setIsProcessing(true);
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

  return (
    <Card className="bg-secondary/50 mb-6">
      <CardHeader className='pb-4'>
        <CardTitle className="flex items-center gap-2">
          <Bot className="text-primary" />
          AI Medical Scribe
        </CardTitle>
        <CardDescription>
          Rekam percakapan Anda dengan pasien, dan biarkan AI mengisi kolom yang relevan secara otomatis.
        </CardDescription>
      </CardHeader>
      <CardContent>
         {!recognitionRef.current && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Fitur Tidak Tersedia</AlertTitle>
                <AlertDescription>
                Pengenalan suara tidak didukung di browser ini. Coba gunakan Google Chrome atau browser modern lainnya.
                </AlertDescription>
            </Alert>
         )}
         {recognitionRef.current && (
            <div className='space-y-4'>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button onClick={handleToggleRecording} size="lg" className="w-full sm:w-auto">
                        {isRecording ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
                        {isRecording ? 'Jeda Merekam' : 'Mulai/Lanjutkan Merekam'}
                    </Button>
                     <Button onClick={handleResetTranscript} size="lg" variant="outline" className="w-full sm:w-auto">
                        <RotateCcw className="mr-2" />
                        Reset
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1">
                        {isRecording && <Loader2 className="animate-spin h-4 w-4" />}
                        <span>{isRecording ? 'Sedang mendengarkan...' : 'Klik untuk memulai transkripsi suara.'}</span>
                    </div>
                </div>
                
                <Textarea
                    placeholder="Transkrip percakapan akan muncul di sini..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={5}
                    readOnly={isRecording}
                />
                
                <Button onClick={handleProcessTranscript} disabled={isProcessing || !transcript}>
                    {isProcessing && <Loader2 className="mr-2 animate-spin" />}
                    {isProcessing ? 'Memproses...' : 'Proses Transkrip dengan AI'}
                </Button>
            </div>
         )}
      </CardContent>
    </Card>
  );
}
