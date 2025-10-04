'use client';

import { useState, useRef, useEffect } from 'react';
import type { Patient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  Bot,
  User,
  Loader2,
  ArrowLeft,
  Venus,
  Mars,
  MessageSquare,
  Clock,
  Stethoscope,
  FileText,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  Copy,
  Download,
  Calendar,
  Heart,
  Video
} from 'lucide-react';
import { runTeleconsultChatbotAction } from '@/app/actions';
import type { ChatMessage } from '@/ai/flows/teleconsult-chatbot-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TeleconsultChatbotProps {
  patient: Patient;
  onBack: () => void;
}

interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
}

interface ConsultationContext {
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  notes: string;
  videoCallLink?: string;
  consultationType: 'emergency' | 'routine' | 'followup';
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export function TeleconsultChatbot({ patient, onBack }: TeleconsultChatbotProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [consultationContext, setConsultationContext] = useState<ConsultationContext>({
    symptoms: [],
    diagnosis: '',
    treatment: '',
    notes: '',
    consultationType: 'routine',
    urgencyLevel: 'low'
  });
  const [showTemplates, setShowTemplates] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Message templates for quick responses
  const messageTemplates: MessageTemplate[] = [
    {
      id: 'greeting',
      name: 'Sapaan',
      category: 'Umum',
      content: 'Halo {patientName}, saya asisten dokter dari FaskesQ. Apakah Anda sudah siap untuk konsultasi telemedicine hari ini?'
    },
    {
      id: 'symptoms',
      name: 'Tanya Gejala',
      category: 'Anamnesis',
      content: 'Bisa tolong jelaskan gejala yang Anda rasakan? Kapan pertama kali muncul dan bagaimana perkembangannya?'
    },
    {
      id: 'video_call',
      name: 'Jadwalkan Video',
      category: 'Konsultasi',
      content: 'Untuk diagnosis yang lebih akurat, saya sarankan kita lakukan video call. Apakah Anda memiliki waktu untuk video call sekarang?'
    },
    {
      id: 'medication',
      name: 'Info Obat',
      category: 'Terapi',
      content: 'Saya akan merekomendasikan {medication}. Obat ini diminum {dosage}. Apakah Anda punya alergi obat tertentu?'
    },
    {
      id: 'followup',
      name: 'Kontrol Ulang',
      category: 'Follow-up',
      content: 'Saya sarankan kontrol ulang {timeFrame}. Jika gejala memburuk sebelumnya, segera hubungi kami.'
    },
    {
      id: 'emergency',
      name: 'Darurat',
      category: 'Urgent',
      content: 'Segera ke IGD terdekat jika mengalami sesak napas berat, nyeri dada, atau pusing yang hebat.'
    }
  ];

  // Initialize conversation with patient context
  useEffect(() => {
    const initializeConsultation = async () => {
      setIsLoading(true);
      try {
        const result = await runTeleconsultChatbotAction({
          patientId: patient.id,
          patientName: patient.name,
          patientDob: patient.dateOfBirth,
          patientGender: patient.gender,
          patientContact: patient.contact,
          patientHistory: patient.history || [],
          screeningHistory: patient.screeningHistory || [],
          messages: [],
          action: 'initialize'
        });

        if (result.success && result.data) {
          setMessages(result.data.messages);
          if (result.data.context) {
            setConsultationContext(result.data.context);
          }
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (patient) {
      initializeConsultation();
    }
  }, [patient.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fungsi untuk mengirim pesan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Tambahkan pesan user
    const userMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: input,
      role: 'user',
      timestamp: new Date(),
      messageType: 'text',
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Panggil AI chatbot
      const result = await runTeleconsultChatbotAction({
        patientId: patient.id,
        patientName: patient.name,
        patientDob: patient.dateOfBirth,
        patientGender: patient.gender,
        patientContact: patient.contact,
        patientHistory: patient.history || [],
        screeningHistory: patient.screeningHistory || [],
        messages: [...messages, userMessage],
        action: 'chat',
        context: consultationContext
      });

      setIsTyping(false);

      if (result.success && result.data) {
        // Update messages dengan response dari AI
        if (result.data.messages) {
          setMessages(result.data.messages);
        }

        // Update konteks jika ada
        if (result.data.context) {
          setConsultationContext(result.data.context);
        }

        // Update suggested questions
        if (result.data.suggestions) {
          setSuggestedQuestions(result.data.suggestions);
        }
      }
    } catch (error: any) {
      setIsTyping(false);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk menjadwalkan video call
  const handleScheduleVideoCall = async () => {
    setIsLoading(true);
    try {
      const result = await runTeleconsultChatbotAction({
        patientId: patient.id,
        patientName: patient.name,
        patientDob: patient.dateOfBirth,
        patientGender: patient.gender,
        patientContact: patient.contact,
        patientHistory: patient.history || [],
        screeningHistory: patient.screeningHistory || [],
        messages: messages,
        action: 'schedule_video',
        context: consultationContext
      });

      if (result.success && result.data) {
        if (result.data.messages) {
          setMessages(result.data.messages);
        }
        if (result.data.context) {
          setConsultationContext(result.data.context);
        }
        if (result.data.videoCallScheduled) {
          toast({
            title: 'Video Call Dijadwalkan',
            description: 'Video call berhasil dijadwalkan',
          });
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk mengakhiri konsultasi
  const handleEndConsultation = async () => {
    setIsLoading(true);
    try {
      const result = await runTeleconsultChatbotAction({
        patientId: patient.id,
        patientName: patient.name,
        patientDob: patient.dateOfBirth,
        patientGender: patient.gender,
        patientContact: patient.contact,
        patientHistory: patient.history || [],
        screeningHistory: patient.screeningHistory || [],
        messages: messages,
        action: 'end_consultation',
        context: consultationContext
      });

      if (result.success && result.data) {
        if (result.data.messages) {
          setMessages(result.data.messages);
        }
        toast({
          title: 'Konsultasi Selesai',
          description: 'Konsultasi berhasil diakhiri',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk menggunakan template pesan
  const useTemplate = (template: MessageTemplate) => {
    let content = template.content
      .replace('{patientName}', patient.name)
      .replace('{doctorName}', 'Dr. FaskesQ')
      .replace('{medication}', 'obat')
      .replace('{dosage}', '3x sehari')
      .replace('{timeFrame}', '1 minggu lagi');
    
    setInput(content);
    setShowTemplates(false);
    inputRef.current?.focus();
  };

  // Fungsi untuk copy conversation
  const copyConversation = () => {
    const conversation = messages.map(msg => 
      `${msg.role === 'user' ? 'Pasien' : 'Dokter'}: ${msg.content}`
    ).join('\n');
    
    navigator.clipboard.writeText(conversation);
    toast({
      title: 'Tersalin',
      description: 'Percakapan telah disalin ke clipboard',
    });
  };

  // Fungsi untuk download conversation
  const downloadConversation = () => {
    const conversation = messages.map(msg => 
      `[${msg.timestamp.toLocaleString()}] ${msg.role === 'user' ? 'Pasien' : 'Dokter'}: ${msg.content}`
    ).join('\n');
    
    const blob = new Blob([conversation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `konsultasi-${patient.name}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Downloaded',
      description: 'Percakapan telah diunduh',
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`} />
              <AvatarFallback>{patient.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{patient.name}</h3>
              <p className="text-xs text-gray-500">
                {patient.gender === 'Pria' ? <Mars className="inline h-3 w-3" /> : <Venus className="inline h-3 w-3" />}
                {' '}{patient.gender === 'Pria' ? 'Laki-laki' : 'Perempuan'} • {patient.age} tahun
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowTemplates(!showTemplates)}>
              <MessageSquare className="h-4 w-4 mr-1" />
              Template
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowContextPanel(!showContextPanel)}>
              <FileText className="h-4 w-4 mr-1" />
              Konteks
            </Button>
            <Button variant="outline" size="sm" onClick={copyConversation}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={downloadConversation}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Context Panel */}
          {showContextPanel && (
            <div className="bg-white border-b p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Gejala</label>
                  <Input 
                    value={consultationContext.symptoms.join(', ')}
                    onChange={(e) => setConsultationContext(prev => ({
                      ...prev,
                      symptoms: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="Gejala yang dialami"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Diagnosis</label>
                  <Input 
                    value={consultationContext.diagnosis}
                    onChange={(e) => setConsultationContext(prev => ({
                      ...prev,
                      diagnosis: e.target.value
                    }))}
                    placeholder="Diagnosis"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Terapi</label>
                  <Input 
                    value={consultationContext.treatment}
                    onChange={(e) => setConsultationContext(prev => ({
                      ...prev,
                      treatment: e.target.value
                    }))}
                    placeholder="Terapi yang direkomendasikan"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Catatan</label>
                  <Input 
                    value={consultationContext.notes}
                    onChange={(e) => setConsultationContext(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    placeholder="Catatan tambahan"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button size="sm" onClick={handleScheduleVideoCall} disabled={isLoading}>
                  <Video className="h-4 w-4 mr-1" />
                  Jadwalkan Video Call
                </Button>
                <Button size="sm" variant="outline" onClick={handleEndConsultation} disabled={isLoading}>
                  Akhiri Konsultasi
                </Button>
              </div>
            </div>
          )}

          {/* Templates Panel */}
          {showTemplates && (
            <div className="bg-white border-b p-4">
              <h4 className="font-medium mb-3">Template Pesan Cepat</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {messageTemplates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    className="justify-start text-left h-auto py-2"
                    onClick={() => useTemplate(template)}
                  >
                    <div>
                      <div className="font-medium text-xs">{template.name}</div>
                      <div className="text-xs text-gray-500">{template.category}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-start space-x-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-500">
                        <Bot className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[70%] rounded-lg px-4 py-2',
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={cn(
                      'text-xs mt-1',
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    )}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`} />
                      <AvatarFallback className="bg-green-500">
                        <User className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-500">
                      <Bot className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Suggested Questions */}
          {suggestedQuestions.length > 0 && (
            <div className="bg-white border-t p-4">
              <h4 className="font-medium mb-2">Pertanyaan yang Disarankan</h4>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="bg-white border-t p-4">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 resize-none"
                rows={2}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button type="submit" disabled={!input.trim() || isLoading} className="px-3">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}