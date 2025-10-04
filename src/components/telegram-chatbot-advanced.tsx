'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Bot, 
  User, 
  Clock,
  X,
  Mars,
  Venus
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { runTelegramChatbotAdvancedAction } from '@/app/actions';
import type { TelegramMessage } from '@/ai/flows/telegram-chatbot-advanced-flow';
import type { Patient } from '@/lib/types';

interface TelegramChatbotAdvancedProps {
  patient: Patient;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    phoneNumber?: string;
  }>;
  consultationContext: ConsultationContext;
  onChatbotResponse: (response: string) => void;
  onClose?: () => void;
}

interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
}

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  { id: '1', name: 'Salam Awal', category: 'umum', content: 'Halo {patientName}, saya {doctorName} akan membantu konsultasi Anda hari ini.' },
  { id: '2', name: 'Tanya Gejala', category: 'gejala', content: 'Bisa jelaskan gejala yang Anda rasakan saat ini {patientName}?' },
  { id: '3', name: 'Saran Istirahat', category: 'saran', content: 'Saya sarankan {patientName} untuk istirahat yang cukup dan minum obat secara teratur.' },
  { id: '4', name: 'Jadwal Kontrol', category: 'kontrol', content: 'Jangan lupa kontrol kembali sesuai jadwal ya {patientName}.' }
];

interface ConsultationContext {
  patientName: string;
  age: number;
  gender: 'male' | 'female';
  symptoms: string[];
  medicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  vitals: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  consultationNotes: string[];
}

export function TelegramChatbotAdvanced({ patient, consultationContext: initialContext, onChatbotResponse, onClose }: TelegramChatbotAdvancedProps) {
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [consultationMode, setConsultationMode] = useState<'general' | 'emergency' | 'follow-up' | 'medication'>('general');
  const [consultationContext, setConsultationContext] = useState(initialContext);
  const [showTemplates, setShowTemplates] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize conversation with system message
  useEffect(() => {
    if (!patient?.contact) {
      console.error('Patient contact is required');
      return;
    }

    const systemMessage: TelegramMessage = {
      id: 'system-1',
      role: 'system',
      content: 'Sistem AI medis siap membantu. Silakan jelaskan keluhan Anda.',
      timestamp: new Date(),
      phoneNumber: patient.contact,
    };
    setMessages([systemMessage]);
  }, [patient?.contact]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fungsi untuk mengirim pesan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Validate patient data
    if (!patient?.contact) {
      toast({
        title: 'Error',
        description: 'Data pasien tidak lengkap',
        variant: 'destructive'
      });
      return;
    }

    const userMessage: TelegramMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      phoneNumber: patient.contact,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await runTelegramChatbotAdvancedAction({
        messages: [...messages, userMessage],
        context: consultationContext,
        consultationMode,
        patientPhoneNumber: patient.contact,
      });

      if (result.success && result.data) {
        const botMessage: TelegramMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.data.response,
          timestamp: new Date(),
          phoneNumber: patient.contact,
        };

        setMessages(prev => [...prev, botMessage]);
        onChatbotResponse(result.data.response);
      } else {
        throw new Error(result.error || 'Gagal mendapatkan respons dari AI');
      }
    } catch (error) {
      console.error('Error in chatbot:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses chatbot';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      // Add error message to chat
      const errorBotMessage: TelegramMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.',
        timestamp: new Date(),
        phoneNumber: patient.contact,
      };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk menggunakan template pesan
  const useTemplate = (template: MessageTemplate) => {
    const content = template.content
      .replace('{patientName}', patient.name)
      .replace('{doctorName}', 'Doctor'); // Bisa diganti dengan nama dokter yang login
    
    setInput(content);
    setShowTemplates(false);
    inputRef.current?.focus();
  };

  // Fungsi untuk copy pesan
  const copyMessage = async (content: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
        toast({
          title: 'Berhasil',
          description: 'Pesan telah disalin ke clipboard'
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
          title: 'Berhasil',
          description: 'Pesan telah disalin ke clipboard'
        });
      }
    } catch (error) {
      console.error('Failed to copy message:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyalin pesan ke clipboard',
        variant: 'destructive'
      });
    }
  };

  // Fungsi untuk export transkrip
  const exportTranscript = () => {
    if (messages.length === 0) {
      toast({
        title: 'Error',
        description: 'Tidak ada transkrip untuk diekspor',
        variant: 'destructive'
      });
      return;
    }

    const transcriptText = messages
      .map(msg => `[${msg.timestamp.toLocaleTimeString()}] ${msg.role === 'assistant' ? 'AI Assistant' : 'Dokter'}: ${msg.content}`)
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

    toast({
      title: 'Berhasil',
      description: 'Transkrip berhasil diekspor'
    });
  };

  // Fungsi untuk update konteks
  const updateContext = <K extends keyof ConsultationContext>(field: K, value: ConsultationContext[K]) => {
    setConsultationContext(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fungsi untuk menambahkan gejala
  const addSymptom = (symptom: string) => {
    if (symptom.trim() && !consultationContext.symptoms.includes(symptom.trim())) {
      setConsultationContext(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptom.trim()]
      }));
    }
  };

  // Fungsi untuk menghapus gejala
  const removeSymptom = (symptom: string) => {
    setConsultationContext(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(s => s !== symptom)
    }));
  };

  // Fungsi untuk menambahkan riwayat medis
  const addMedicalHistory = (history: string) => {
    if (history.trim() && !consultationContext.medicalHistory.includes(history.trim())) {
      setConsultationContext(prev => ({
        ...prev,
        medicalHistory: [...prev.medicalHistory, history.trim()]
      }));
    }
  };

  // Fungsi untuk menghapus riwayat medis
  const removeMedicalHistory = (history: string) => {
    setConsultationContext(prev => ({
      ...prev,
      medicalHistory: prev.medicalHistory.filter(h => h !== history)
    }));
  };

  // Fungsi untuk menambahkan alergi
  const addAllergy = (allergy: string) => {
    if (allergy.trim() && !consultationContext.allergies.includes(allergy.trim())) {
      setConsultationContext(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergy.trim()]
      }));
    }
  };

  // Fungsi untuk menghapus alergi
  const removeAllergy = (allergy: string) => {
    setConsultationContext(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }));
  };



  return (
    <Card className="h-[600px] flex flex-col">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-lg">AI Chatbot Telegram</CardTitle>
              <p className="text-sm text-muted-foreground">Konsultasi dengan AI untuk {patient.name}</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Consultation Mode Selector */}
        <div className="p-4 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Mode:</span>
            <select
              value={consultationMode}
              onChange={(e) => setConsultationMode(e.target.value as 'general' | 'emergency' | 'follow-up' | 'medication')}
              className="text-sm border rounded px-2 py-1"
              aria-label="Mode konsultasi"
            >
              <option value="general">Umum</option>
              <option value="emergency">Darurat</option>
              <option value="follow-up">Tindak Lanjut</option>
              <option value="medication">Obat</option>
            </select>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div className={`text-xs opacity-70 mt-1 flex items-center gap-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-muted-foreground'
                  }`}>
                    <Clock className="h-3 w-3" />
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-muted px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-1">
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

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-xs"
            >
              Template Pesan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportTranscript}
              className="text-xs"
            >
              Export Transkrip
            </Button>
          </div>
          
          {showTemplates && (
            <div className="mb-3 p-3 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Template Pesan</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MESSAGE_TEMPLATES.map((template) => (
                  <Button
                    key={template.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => useTemplate(template)}
                    className="text-xs justify-start"
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              ref={inputRef}
              placeholder="Ketik pesan untuk AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[60px] max-h-[120px]"
              rows={2}
              aria-label="Pesan untuk AI"
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()} 
              className="px-3"
              aria-label="Kirim pesan"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}