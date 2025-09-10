'use client';

import { useState, useRef, useEffect } from 'react';
import type { Patient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, User, Loader2, ArrowLeft, Venus, Mars } from 'lucide-react';
import { runTeleconsultChatbot, type ChatMessage } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


interface TeleconsultChatbotProps {
  patient: Patient;
  onBack: () => void;
}

export function TeleconsultChatbot({ patient, onBack }: TeleconsultChatbotProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Initiate conversation with the AI assistant on component mount
  useEffect(() => {
    const initiateConversation = async () => {
      setIsLoading(true);
      try {
        const result = await runTeleconsultChatbot({
          patientId: patient.id,
          patientName: patient.name,
          patientDob: patient.dateOfBirth,
          history: [], // Start with empty history
        });

        if (result.success && result.data) {
          setMessages(result.data.history);
        } else {
          throw new Error(result.error || 'Gagal memulai percakapan dengan AI.');
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
    initiateConversation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.id]);


  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput('');
    setIsLoading(true);

    try {
      const result = await runTeleconsultChatbot({
        patientId: patient.id,
        patientName: patient.name,
        patientDob: patient.dateOfBirth,
        history: currentMessages,
      });

      if (result.success && result.data) {
        setMessages(result.data.history);
      } else {
        throw new Error(result.error || 'Gagal mendapatkan respons dari AI.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
       // Revert the user message on error
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const GenderIcon = patient.gender === 'Pria' ? Mars : patient.gender === 'Wanita' ? Venus : User;

  return (
    <div className="flex flex-col h-full">
       <div className="flex items-center p-4 border-b">
         <Button variant="ghost" size="icon" onClick={onBack} className="mr-4">
            <ArrowLeft />
         </Button>
        <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
                <GenderIcon className="h-5 w-5" />
            </AvatarFallback>
        </Avatar>
        <div className="ml-4">
          <h3 className="font-semibold">Konsultasi dengan {patient.name}</h3>
          <p className="text-sm text-muted-foreground">Dibantu oleh Asisten AI</p>
        </div>
      </div>
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
             message.role !== 'tool' && (
                <div
                key={index}
                className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
                >
                {message.role === 'model' && (
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                )}
                <div
                    className={cn(
                    'max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg',
                    message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                    <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                )}
                </div>
            )
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
                 <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                  <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                </Avatar>
                <div className="px-4 py-2 rounded-lg bg-muted flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketikkan pesan Anda sebagai dokter..."
            disabled={isLoading}
            autoComplete='off'
          />
          <Button type="submit" disabled={isLoading || !input}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
