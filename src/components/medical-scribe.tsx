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

/**
 * Komponen sisi klien yang menyediakan antarmuka pengguna untuk merekam audio,
 * mentranskripsikannya menggunakan Web Speech API, dan mengirimkannya ke AI
 * untuk diproses menjadi rekam medis terstruktur.
 */
export function MedicalScribe({ onScribeComplete }: MedicalScribeProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref untuk menampung instance SpeechRecognition
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Periksa dukungan browser untuk Web Speech API
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Pengenalan suara tidak didukung di browser ini. Silakan gunakan Google Chrome.');
      return;
    }

    // Inisialisasi instance SpeechRecognition
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = true; // Tetap mendengarkan bahkan setelah jeda
    recognition.interimResults = true; // Dapatkan hasil saat pengguna berbicara
    recognition.lang = 'id-ID'; // Atur bahasa ke Bahasa Indonesia

    // Event handler ketika ucapan dikenali
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + '. ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // Perbarui transkrip dengan hasil akhir
      setTranscript(prev => prev + finalTranscript);
    };

    // Event handler untuk error pengenalan
    recognition.onerror = (event: any) => {
      console.error("Kesalahan pengenalan suara", event.error);
      toast({
        variant: "destructive",
        title: "Kesalahan Pengenalan Suara",
        description: `Terjadi kesalahan: ${event.error}. Pastikan izin mikrofon telah diberikan.`,
      });
      setIsRecording(false);
    };

    // Fungsi cleanup untuk menghentikan pengenalan saat komponen dilepas
    return () => {
      recognitionRef.current?.stop();
    };
  }, [toast]);

  // Mengubah status perekaman
  const handleToggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  // Mereset transkrip dan menghentikan perekaman
  const handleReset = () => {
    setTranscript('');
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
  };

  // Memproses transkrip dengan AI scribe
  const handleProcessTranscript = async () => {
    if (!transcript.trim()) {
      toast({
        title: "Transkrip Kosong",
        description: "Tidak ada transkrip untuk diproses.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const result = await runMedicalScribe({ transcript });
    setIsProcessing(false);

    if (result.success && result.data) {
      toast({
        title: "Pemrosesan Berhasil",
        description: "Formulir telah diisi berdasarkan transkrip.",
      });
      onScribeComplete(result.data);
    } else {
      toast({
        title: "Pemrosesan Gagal",
        description: result.error || "Terjadi kesalahan yang tidak diketahui.",
        variant: "destructive",
      });
    }
  };

  // Render alert error jika fitur tidak tersedia
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Fitur Tidak Tersedia</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

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
        <div className='space-y-4'>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button onClick={handleToggleRecording} size="lg" className="w-full sm:w-auto">
              {isRecording ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
              {isRecording ? 'Berhenti Merekam' : transcript ? 'Lanjutkan Merekam' : 'Mulai Merekam'}
            </Button>
            <Button onClick={handleReset} size="lg" variant="outline" className="w-full sm:w-auto">
              <RotateCcw className="mr-2" />
              Reset
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1">
              {isRecording && <Loader2 className="animate-spin h-4 w-4" />}
              <span>{isRecording ? 'Mendengarkan...' : 'Klik tombol untuk memulai transkripsi suara.'}</span>
            </div>
          </div>

          <Textarea
            placeholder="Transkrip percakapan akan muncul di sini..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={6}
            readOnly={isRecording} // Jadikan textarea hanya bisa dibaca saat merekam
          />

          <Button onClick={handleProcessTranscript} disabled={isProcessing || !transcript.trim()}>
            {isProcessing ? (
              <><Loader2 className="mr-2 animate-spin" /> Memproses...</>
            ) : (
              'Proses Transkrip dengan AI'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
