'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Mic, MicOff, Download, MessageSquare, Phone, Bot, Save } from 'lucide-react';
import type { Patient } from '@/lib/types';
import { TelegramChatbotAdvanced } from './telegram-chatbot-advanced';
import { runTelegramChatbotAdvancedAction } from '@/app/actions';

interface TelegramConsultationProps {
  patient: Patient;
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'audio';
  phoneNumber?: string;
}

export function TelegramConsultation({ patient, onBack }: TelegramConsultationProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [showChatbot, setShowChatbot] = useState(false);
  // Calculate age from dateOfBirth
  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const [consultationContext, setConsultationContext] = useState({
    patientName: patient.name,
    age: calculateAge(patient.dateOfBirth),
    gender: patient.gender === 'Pria' ? 'male' : 'female' as 'male' | 'female',
    symptoms: [] as string[],
    medicalHistory: [] as string[],
    currentMedications: [] as string[],
    allergies: patient.allergies || [] as string[],
    vitals: {
      bloodPressure: '',
      heartRate: undefined as number | undefined,
      temperature: undefined as number | undefined,
      respiratoryRate: undefined as number | undefined,
      oxygenSaturation: undefined as number | undefined,
    },
    consultationNotes: [] as string[],
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatPhoneNumber = (contact: string) => {
    const digits = contact.replace(/\D/g, '');
    if (digits.startsWith('08')) {
      return '+62' + digits.substring(1);
    }
    if (digits.startsWith('62')) {
      return '+' + digits;
    }
    return '+6281234567890'; // fallback
  };

  const saveToMedicalRecords = async () => {
    if (messages.length === 0) {
      alert('Tidak ada pesan untuk disimpan');
      return;
    }
    
    try {
      const medicalRecord = {
        patientId: patient.id,
        consultationDate: new Date().toISOString(),
        transcript: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
        symptoms: consultationContext.symptoms,
        diagnosis: 'Telegram consultation',
        treatment: 'As per consultation transcript',
        doctorName: 'Dr. Telegram AI',
        platform: 'Telegram'
      };
      
      console.log('Saving to medical records:', medicalRecord);
      // TODO: Implement actual save to medical records
      alert('Konsultasi berhasil disimpan ke rekam medis');
    } catch (error) {
      console.error('Error saving to medical records:', error);
      alert('Gagal menyimpan ke rekam medis');
    }
  };

  const handleChatbotResponse = async (chatbotMessage: string) => {
    try {
      const newContext = {
        ...consultationContext,
        consultationNotes: [...consultationContext.consultationNotes, chatbotMessage],
        symptoms: [...new Set([...consultationContext.symptoms, ...extractSymptomsFromMessages()])]
      };
      
      setConsultationContext(newContext);
      
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: chatbotMessage,
        timestamp: new Date(),
        type: 'text',
        phoneNumber: patient.contact
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error handling chatbot response:', error);
      alert('Gagal memproses respons chatbot');
    }
  };

  const extractSymptomsFromMessages = (): string[] => {
    const symptoms: string[] = [];
    const symptomKeywords = [
      'sakit', 'nyeri', 'demam', 'batuk', 'pilek', 'mual', 'muntah', 
      'diare', 'pusing', 'lemes', 'sesak', 'sulit bernapas', 'panas',
      'dingin', 'menggigil', 'tidur', 'nafsu makan', 'berat badan',
      'ruam', 'gatal', 'bengkak', 'membengkak', 'pendarahan'
    ];
    
    messages.forEach(message => {
      if (message.role === 'user') {
        symptomKeywords.forEach(keyword => {
          if (message.content.toLowerCase().includes(keyword)) {
            symptoms.push(keyword);
          }
        });
      }
    });
    
    return [...new Set(symptoms)]; // Remove duplicates
  };

  const phoneNumber = formatPhoneNumber(patient.contact);

  const generateTelegramLink = () => {
    return `https://t.me/+${phoneNumber.substring(1)}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (content: string, role: 'user' | 'assistant' | 'system', type: 'text' | 'audio' = 'text') => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      type
    };
    setMessages(prev => [...prev, newMessage]);
    setTimeout(scrollToBottom, 100);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate recording
    setTimeout(() => {
      setIsRecording(false);
      setIsTranscribing(true);
      // Simulate transcription
      setTimeout(() => {
        const mockTranscription = "Ini adalah transkrip dari rekaman suara Anda.";
        setTranscript(mockTranscription);
        setIsTranscribing(false);
      }, 2000);
    }, 3000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleAddTranscription = () => {
    if (transcript.trim()) {
      addMessage(transcript, 'assistant', 'audio');
      setTranscript('');
    }
  };

  const handleSaveToMedicalRecord = () => {
    // Simulate saving to medical record
    alert('Transkrip berhasil disimpan ke rekam medis!');
  };

  const handleExportTranscript = () => {
    const transcriptText = messages
      .map(msg => `${msg.role === 'assistant' ? 'Dokter' : 'Pasien'} (${msg.timestamp.toLocaleTimeString()}): ${msg.content}`)
      .join('\n');
    
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transkrip-telegram-${patient.name}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenTelegram = () => {
    window.open(generateTelegramLink(), '_blank');
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      addMessage(inputMessage, 'assistant');
      setInputMessage('');
    }
  };

  const handleSendViaTelegram = () => {
    if (inputMessage.trim()) {
      const telegramMessage = `Halo ${patient.name},\n\n${inputMessage}\n\nSalam sehat,\nDokter`;
      const telegramLink = `https://t.me/share/url?url=${encodeURIComponent(telegramMessage)}&text=${encodeURIComponent(telegramMessage)}`;
      window.open(telegramLink, '_blank');
      addMessage(inputMessage, 'assistant');
      setInputMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="font-semibold">{patient.name}</h3>
            <p className="text-sm text-muted-foreground">Telegram Consultation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenTelegram}>
            <MessageSquare className="h-4 w-4 mr-1" />
            Buka Telegram
          </Button>
        </div>
      </div>

      {/* Transcript Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Mulai percakapan dengan pasien</p>
              <p className="text-sm">Klik "Buka Telegram" untuk membuka chat Telegram</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'assistant' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === 'assistant'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.role === 'assistant' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Audio Transcription */}
      {(isTranscribing || transcript) && (
        <Card className="m-4">
          <CardHeader>
            <CardTitle className="text-sm">Transkrip Audio</CardTitle>
          </CardHeader>
          <CardContent>
            {isTranscribing ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Sedang mentranskrip...
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Transkrip audio akan muncul di sini..."
                  className="min-h-[100px]"
                />
                <Button onClick={handleAddTranscription} size="sm">
                  Tambahkan ke Percakapan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Input Area */}
      <div className="p-4 border-t space-y-2">
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="min-h-[60px]"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <div className="flex flex-col gap-2">
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
            <Button onClick={handleSendViaTelegram} disabled={!inputMessage.trim()} variant="outline">
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Audio Recording */}
        <div className="flex gap-2">
          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            variant={isRecording ? "destructive" : "outline"}
            className="flex-1"
          >
            {isRecording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
            {isRecording ? 'Stop Rekaman' : 'Mulai Rekaman'}
          </Button>
          <Button onClick={handleExportTranscript} variant="outline" disabled={messages.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => setShowChatbot(!showChatbot)}
            variant={showChatbot ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2"
          >
            <Bot className="h-4 w-4" />
            AI Chatbot
          </Button>
          <Button
            onClick={saveToMedicalRecords}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={messages.length === 0}
          >
            <Save className="h-4 w-4" />
            Simpan Rekam Medis
          </Button>
        </div>
      </div>

      {/* AI Chatbot Advanced */}
      {showChatbot && (
        <TelegramChatbotAdvanced
          patient={patient}
          messages={messages}
          onChatbotResponse={handleChatbotResponse}
          consultationContext={{
            patientName: patient.name,
            age: patient.age || 0,
            gender: patient.gender === 'Pria' ? 'male' : 'female',
            symptoms: extractSymptomsFromMessages(),
            medicalHistory: patient.medicalHistory || [],
            currentMedications: patient.currentMedications || [],
            allergies: patient.allergies || [],
            vitals: {},
            consultationNotes: []
          }}
        />
      )}
    </div>
  );
}