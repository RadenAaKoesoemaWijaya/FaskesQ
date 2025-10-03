'use client';

import { useState, useRef, useEffect } from 'react';
import type { Patient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WhatsAppChatbotAdvanced } from '@/components/whatsapp-chatbot-advanced';
import {
  Mic,
  Square,
  Save,
  ArrowLeft,
  MessageSquare,
  Clock,
  Download,
  Send,
  Bot,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface WhatsAppConsultationProps {
  patient: Patient;
  onBack: () => void;
}

interface TranscriptEntry {
  id: string;
  timestamp: Date;
  speaker: 'doctor' | 'patient';
  message: string;
  originalMessage?: string;
}

export function WhatsAppConsultation({ patient, onBack }: WhatsAppConsultationProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [savedToMedicalRecord, setSavedToMedicalRecord] = useState(false);
  const [useAdvancedChatbot, setUseAdvancedChatbot] = useState(false);
  
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Format nomor WhatsApp
  const formatPhoneNumber = (contact: string) => {
    const digits = contact.replace(/\D/g, '');
    if (digits.startsWith('08')) {
      return '62' + digits.substring(1);
    }
    if (digits.startsWith('62')) {
      return digits;
    }
    return '6281234567890';
  };

  const phoneNumber = formatPhoneNumber(patient.contact);

  // Timer untuk recording
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  // Format waktu recording
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Mulai merekam
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Gagal memulai perekaman. Pastikan mikrofon diizinkan.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  // Transcribe audio (simulasi dengan AI)
  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    
    // Simulasi transkripsi AI
    setTimeout(() => {
      const mockTranscript: TranscriptEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        speaker: 'patient', // Simulasi: pasien yang berbicara
        message: '[Transkrip dari audio] Halo dok, saya merasa tidak enak badan sejak kemarin. Saya mengalami demam dan sakit kepala.',
        originalMessage: 'Halo dok, saya merasa tidak enak badan sejak kemarin. Saya mengalami demam dan sakit kepala.'
      };
      
      setTranscript(prev => [...prev, mockTranscript]);
      setIsTranscribing(false);
    }, 2000);
  };

  // Tambah pesan manual
  const addManualMessage = () => {
    if (currentMessage.trim()) {
      const newEntry: TranscriptEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        speaker: 'doctor',
        message: currentMessage.trim()
      };
      
      setTranscript(prev => [...prev, newEntry]);
      setCurrentMessage('');
    }
  };

  // Simpan ke rekam medis
  const saveToMedicalRecord = async () => {
    if (transcript.length === 0) {
      alert('Tidak ada transkrip untuk disimpan');
      return;
    }

    setIsTranscribing(true);
    
    try {
      // Simulasi menyimpan ke database
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSavedToMedicalRecord(true);
      alert('Transkrip berhasil disimpan ke rekam medis!');
    } catch (error) {
      console.error('Error saving to medical record:', error);
      alert('Gagal menyimpan ke rekam medis');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Export transkrip
  const exportTranscript = () => {
    if (transcript.length === 0) {
      alert('Tidak ada transkrip untuk diekspor');
      return;
    }

    const transcriptText = transcript
      .map(entry => `[${entry.timestamp.toLocaleTimeString()}] ${entry.speaker === 'doctor' ? 'Dokter' : 'Pasien'}: ${entry.message}`)
      .join('\n');

    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transkrip-${patient.name}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Buka WhatsApp
  const openWhatsApp = () => {
    const message = encodeURIComponent(`Halo ${patient.name}, ini adalah pesan dari FaskesQ.`);
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  // Toggle advanced chatbot
  const toggleAdvancedChatbot = () => {
    setUseAdvancedChatbot(!useAdvancedChatbot);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="font-semibold">{patient.name}</h3>
            <p className="text-sm text-muted-foreground">{patient.medicalRecordNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={useAdvancedChatbot ? "default" : "outline"} 
            size="sm" 
            onClick={toggleAdvancedChatbot}
          >
            <Bot className="h-4 w-4 mr-2" />
            {useAdvancedChatbot ? "Chatbot AI Aktif" : "Aktifkan Chatbot AI"}
          </Button>
          <Button variant="outline" size="sm" onClick={openWhatsApp}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Buka WhatsApp
          </Button>
        </div>
      </div>

      {/* Konten utama */}
      {useAdvancedChatbot ? (
        <WhatsAppChatbotAdvanced patient={patient} onBack={onBack} />
      ) : (
        <>
          {/* Kontrol Recording */}
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isRecording ? (
                  <Button 
                    variant="destructive" 
                    onClick={stopRecording}
                    disabled={isTranscribing}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recording
                  </Button>
                ) : (
                  <Button 
                    onClick={startRecording}
                    disabled={isTranscribing}
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                )}
                
                {isRecording && (
                  <div className="flex items-center gap-2 text-destructive">
                    <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                    <Clock className="h-4 w-4" />
                    <span className="font-mono">{formatRecordingTime(recordingTime)}</span>
                  </div>
                )}
                
                {isTranscribing && (
                  <div className="text-sm text-muted-foreground">
                    Menetranskrip audio...
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportTranscript}
                  disabled={transcript.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button 
                  onClick={saveToMedicalRecord}
                  disabled={transcript.length === 0 || isTranscribing || savedToMedicalRecord}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {savedToMedicalRecord ? 'Tersimpan' : 'Simpan ke Rekam Medis'}
                </Button>
              </div>
            </div>
          </div>

          {/* Area Transkrip */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full p-4 overflow-y-auto">
              {transcript.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada transkrip percakapan</p>
                    <p className="text-sm">Mulai recording atau tambahkan pesan manual</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {transcript.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex ${entry.speaker === 'doctor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          entry.speaker === 'doctor'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="text-xs opacity-70 mb-1">
                          {entry.timestamp.toLocaleTimeString()}
                        </div>
                        <div className="text-sm">{entry.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Input Manual */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                placeholder="Tambahkan catatan atau pesan manual..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                className="min-h-[60px]"
                rows={2}
              />
              <Button 
                onClick={addManualMessage}
                disabled={!currentMessage.trim()}
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Alert jika sudah tersimpan */}
          {savedToMedicalRecord && (
            <Alert className="m-4">
              <AlertDescription>
                Transkrip percakapan telah berhasil disimpan ke rekam medis elektronik.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}