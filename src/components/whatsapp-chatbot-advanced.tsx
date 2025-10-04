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
  Heart
} from 'lucide-react';
import { runWhatsAppChatbotAdvancedAction } from '@/app/actions';
import type { WhatsAppMessage } from '@/ai/flows/whatsapp-chatbot-advanced-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WhatsAppChatbotAdvancedProps {
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
}

export function WhatsAppChatbotAdvanced({ patient, onBack }: WhatsAppChatbotAdvancedProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [consultationContext, setConsultationContext] = useState<ConsultationContext>({
    symptoms: [],
    diagnosis: '',
    treatment: '',
    notes: ''
  });
  const [showTemplates, setShowTemplates] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Message templates for quick responses
  const messageTemplates: MessageTemplate[] = [
    {
      id: 'greeting',
      name: 'Sapaan',
      category: 'Umum',
      content: 'Halo {patientName}, saya dr. {doctorName} dari FaskesQ. Apakah Anda sudah siap untuk konsultasi hari ini?'
    },
    {
      id: 'symptoms',
      name: 'Tanya Gejala',
      category: 'Anamnesis',
      content: 'Bisa tolong jelaskan gejala yang Anda rasakan? Kapan pertama kali muncul dan bagaimana perkembangannya?'
    },
    {
      id: 'medication',
      name: 'Info Obat',
      category: 'Terapi',
      content: 'Saya akan meresepkan {medication}. Obat ini diminum {dosage}. Apakah Anda punya alergi obat tertentu?'
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
        const result = await runWhatsAppChatbotAdvancedAction({
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
    const userMessage: WhatsAppMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: input,
      role: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Panggil AI chatbot
      const result = await runWhatsAppChatbotAdvancedAction({
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


      } else {
        // Tambahkan pesan error
        const errorMessage: WhatsAppMessage = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
          role: 'assistant',
          timestamp: new Date(),
          status: 'sent'
        };

        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
      // Tambahkan pesan error
      const errorMessage: WhatsAppMessage = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        role: 'assistant',
        timestamp: new Date(),
        status: 'sent'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template: MessageTemplate) => {
    const personalizedContent = template.content
      .replace('{patientName}', patient.name)
      .replace('{doctorName}', 'Dr. [Nama Dokter]')
      .replace('{medication}', '[Nama Obat]')
      .replace('{dosage}', '[Dosis]')
      .replace('{timeFrame}', '[Waktu]');
    
    setInput(personalizedContent);
    setShowTemplates(false);
    inputRef.current?.focus();
  };

  // Copy message to clipboard
  const copyMessage = async (content: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
        toast({
          title: 'Tersalin',
          description: 'Pesan telah disalin ke clipboard',
        });
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast({
          title: 'Tersalin',
          description: 'Pesan telah disalin ke clipboard',
        });
      }
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Menyalin',
        description: 'Tidak dapat menyalin teks ke clipboard',
      });
    }
  };

  // Export conversation
  const exportConversation = () => {
    const conversation = messages
      .map(msg => `[${msg.timestamp.toLocaleTimeString()}] ${msg.role === 'user' ? 'Dokter' : 'AI'}: ${msg.content}`)
      .join('\n');
    
    const blob = new Blob([conversation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `konsultasi-${patient.name}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Send to WhatsApp
  const sendToWhatsApp = () => {
    if (!patient?.contact) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Nomor kontak pasien tidak tersedia',
      });
      return;
    }
    
    if (messages.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Tidak ada pesan untuk dikirim',
      });
      return;
    }
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      const phoneNumber = patient.contact.replace(/\D/g, '').replace(/^08/, '628');
      const message = encodeURIComponent(lastMessage.content);
      const url = `https://wa.me/${phoneNumber}?text=${message}`;
      window.open(url, '_blank');
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Tidak ada pesan dari dokter untuk dikirim',
      });
    }
  };

  // Update consultation context
  const updateContext = (field: keyof ConsultationContext, value: string | string[]) => {
    setConsultationContext(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const GenderIcon = patient.gender === 'Pria' ? Mars : patient.gender === 'Wanita' ? Venus : User;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              <GenderIcon className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{patient.name}</h3>
            <p className="text-sm text-muted-foreground">{patient.medicalRecordNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowContextPanel(!showContextPanel)}
          >
            <Stethoscope className="h-4 w-4 mr-2" />
            Konteks
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportConversation}
            disabled={messages.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
              variant="default"
              size="sm"
              onClick={sendToWhatsApp}
              disabled={messages.length === 0}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Kirim WA
            </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Template Bar */}
          {showTemplates && (
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Template Pesan</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowTemplates(false)}
                >
                  ×
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {messageTemplates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTemplateSelect(template)}
                    className="text-left justify-start h-auto py-2"
                  >
                    <div>
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.category}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                      <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={cn(
                      'max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 relative group',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.status === 'sent' && (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                    
                    {message.role === 'user' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyMessage(message.content)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Indikator typing */}
              {isTyping && (
                <div className="flex items-start gap-3 justify-start">
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="px-4 py-2 rounded-lg bg-muted flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Mengetik...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t bg-card">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ketik pesan untuk pasien..."
                  disabled={isLoading}
                  className="min-h-[60px] resize-none"
                  rows={2}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowTemplates(!showTemplates)}
                  title="Template Pesan"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Context Panel */}
        {showContextPanel && (
          <div className="w-80 border-l bg-card p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Konteks Konsultasi
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Gejala Utama</label>
                    <Textarea
                      placeholder="Tulis gejala yang dikeluhkan pasien..."
                      value={consultationContext.symptoms.join(', ')}
                      onChange={(e) => updateContext('symptoms', e.target.value.split(',').map(s => s.trim()))}
                      className="mt-1 text-sm"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Diagnosis</label>
                    <Input
                      placeholder="Diagnosis utama"
                      value={consultationContext.diagnosis}
                      onChange={(e) => updateContext('diagnosis', e.target.value)}
                      className="mt-1 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Terapi/Obat</label>
                    <Textarea
                      placeholder="Rencana terapi atau obat yang diberikan"
                      value={consultationContext.treatment}
                      onChange={(e) => updateContext('treatment', e.target.value)}
                      className="mt-1 text-sm"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Catatan Tambahan</label>
                    <Textarea
                      placeholder="Catatan penting lainnya"
                      value={consultationContext.notes}
                      onChange={(e) => updateContext('notes', e.target.value)}
                      className="mt-1 text-sm"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <Separator />
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Info Pasien
                </h4>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Usia:</span> {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} tahun</p>
                  <p><span className="font-medium">Gender:</span> {patient.gender}</p>
                  <p><span className="font-medium">Kontak:</span> {patient.contact}</p>
                  <p><span className="font-medium">No. RM:</span> {patient.medicalRecordNumber}</p>
                </div>
              </div>

              <Separator />
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Riwayat Pemeriksaan
                </h4>
                <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
                  {patient.history && patient.history.length > 0 ? (
                    patient.history.slice(-3).map((exam, index) => (
                      <div key={index} className="text-xs p-2 bg-muted rounded">
                        <p className="font-medium">{exam.date}</p>
                        <p>{exam.diagnosis}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-xs">Belum ada riwayat</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}