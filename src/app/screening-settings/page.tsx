'use client';

import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Edit, Save, X, Loader2, Mic, MicOff } from 'lucide-react';
import {
  getScreeningClusters,
  addScreeningCluster,
  updateScreeningCluster,
  deleteScreeningCluster,
  addScreeningQuestion,
  updateScreeningQuestion,
  deleteScreeningQuestion,
} from '@/lib/data';
import type { ScreeningCluster, ScreeningQuestion } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

function QuestionItem({
  question,
  onSave,
  onDelete,
}: {
  question: ScreeningQuestion;
  onSave: (question: ScreeningQuestion) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(question.text);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({ ...question, text });
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50">
      {isEditing ? (
        <>
          <Input value={text} onChange={(e) => setText(e.target.value)} className="flex-grow" />
          <Button size="icon" variant="ghost" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}>
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <p className="flex-grow text-sm">{question.text}</p>
          <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onDelete(question.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </>
      )}
    </div>
  );
}

function ScreeningItemCard({
  screening,
  onUpdate,
  onDelete,
}: {
  screening: ScreeningCluster;
  onUpdate: (updatedScreening: ScreeningCluster) => void;
  onDelete: (id: string) => void;
}) {
  const { toast } = useToast();
  const [newQuestionText, setNewQuestionText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
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
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            interimTranscript += event.results[i][0].transcript;
        }
        setNewQuestionText(interimTranscript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        toast({
            variant: "destructive",
            title: "Error Pengenalan Suara",
            description: `Terjadi kesalahan: ${event.error}. Pastikan Anda telah memberikan izin mikrofon.`,
        });
        setIsRecording(false);
      };

    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);
  

  const handleToggleRecording = () => {
    if (!recognitionRef.current) {
         toast({
            variant: "destructive",
            title: "Browser Tidak Mendukung",
            description: "Maaf, browser Anda tidak mendukung fitur pengenalan suara.",
        });
        return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setNewQuestionText('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };


  const handleAddQuestion = async () => {
    if (!newQuestionText.trim()) return;
    setIsAdding(true);
    try {
      const newQuestion = await addScreeningQuestion(screening.id, newQuestionText.trim());
      const updatedQuestions = [...screening.questions, newQuestion];
      onUpdate({ ...screening, questions: updatedQuestions });
      setNewQuestionText('');
      toast({ title: "Pertanyaan ditambahkan" });
    } catch (error) {
      toast({ title: "Gagal menambahkan pertanyaan", variant: 'destructive' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateQuestion = async (updatedQuestion: ScreeningQuestion) => {
    try {
      await updateScreeningQuestion(screening.id, updatedQuestion.id, updatedQuestion.text);
      const updatedQuestions = screening.questions.map((q) =>
        q.id === updatedQuestion.id ? updatedQuestion : q
      );
      onUpdate({ ...screening, questions: updatedQuestions });
       toast({ title: "Pertanyaan diperbarui" });
    } catch {
       toast({ title: "Gagal memperbarui pertanyaan", variant: 'destructive' });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
      try {
        await deleteScreeningQuestion(screening.id, questionId);
        const updatedQuestions = screening.questions.filter((q) => q.id !== questionId);
        onUpdate({ ...screening, questions: updatedQuestions });
        toast({ title: "Pertanyaan dihapus" });
      } catch {
        toast({ title: "Gagal menghapus pertanyaan", variant: 'destructive' });
      }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{screening.name}</CardTitle>
                <CardDescription>
                Rentang Usia: {screening.ageRange.min} - {screening.ageRange.max} tahun
                </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onDelete(screening.id)}>
                <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {screening.questions.map((q) => (
            <QuestionItem 
                key={q.id} 
                question={q} 
                onSave={handleUpdateQuestion}
                onDelete={handleDeleteQuestion}
            />
          ))}
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Input
            placeholder={isRecording ? 'Mendengarkan...' : 'Ketik atau rekam pertanyaan baru...'}
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            disabled={isRecording}
          />
           <Button onClick={handleToggleRecording} size="icon" variant={isRecording ? 'destructive' : 'outline'}>
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button onClick={handleAddQuestion} disabled={isAdding || isRecording}>
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin"/> : <PlusCircle className="h-4 w-4" />}
            <span className="hidden sm:inline ml-2">Tambah</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NewScreeningForm({ onAdd }: { onAdd: (screening: ScreeningCluster) => void }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !minAge || !maxAge) {
      toast({ title: "Harap isi semua kolom", variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const newScreening = await addScreeningCluster({
        name,
        ageRange: { min: parseInt(minAge), max: parseInt(maxAge) },
      });
      onAdd(newScreening);
      setName('');
      setMinAge('');
      setMaxAge('');
      toast({ title: "Skrining baru dibuat" });
    } catch (error) {
      toast({ title: "Gagal membuat skrining", variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Skrining Baru</CardTitle>
        <CardDescription>
          Buat grup pertanyaan baru berdasarkan nama skrining atau rentang usia pasien.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="screeningName">Nama Skrining</Label>
            <Input
              id="screeningName"
              placeholder="Contoh: Skrining Diabetes"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minAge">Usia Minimal</Label>
              <Input
                id="minAge"
                type="number"
                placeholder="cth: 0"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAge">Usia Maksimal</Label>
              <Input
                id="maxAge"
                type="number"
                placeholder="cth: 90"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
              />
            </div>
          </div>
          <Alert>
              <AlertTitle>Info</AlertTitle>
              <AlertDescription>
                Isi rentang usia 0-150 jika skrining berlaku untuk semua usia.
              </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
               {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buat Skrining
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ScreeningSettingsPage() {
  const [screenings, setScreenings] = useState<ScreeningCluster[]>([]);
  const [screeningToDelete, setScreeningToDelete] = useState<ScreeningCluster | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      const data = await getScreeningClusters();
      setScreenings(data);
    }
    loadData();
  }, []);

  const handleAddScreening = (newScreening: ScreeningCluster) => {
    setScreenings((prev) => [...prev, newScreening].sort((a,b) => a.name.localeCompare(b.name)));
  };

  const handleUpdateScreening = (updatedScreening: ScreeningCluster) => {
    setScreenings((prev) =>
      prev.map((s) => (s.id === updatedScreening.id ? updatedScreening : s))
    );
  };
  
  const handleDeleteRequest = (screening: ScreeningCluster) => {
    setScreeningToDelete(screening);
  }

  const handleConfirmDelete = async () => {
    if (!screeningToDelete) return;
    
    try {
        await deleteScreeningCluster(screeningToDelete.id);
        setScreenings(prev => prev.filter(s => s.id !== screeningToDelete.id));
        toast({ title: `Skrining "${screeningToDelete.name}" dihapus.` });
    } catch {
        toast({ title: "Gagal menghapus skrining.", variant: 'destructive' });
    } finally {
        setScreeningToDelete(null);
    }
  }

  return (
    <div className="animate-in fade-in-50">
      <PageHeader
        title="Pengaturan Skrining Kesehatan"
        subtitle="Kelola daftar pertanyaan skrining berdasarkan kategori atau rentang usia."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <NewScreeningForm onAdd={handleAddScreening} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          {screenings.length > 0 ? (
            screenings.map((screening) => (
              <ScreeningItemCard
                key={screening.id}
                screening={screening}
                onUpdate={handleUpdateScreening}
                onDelete={() => handleDeleteRequest(screening)}
              />
            ))
          ) : (
             <Card className="text-center p-8">
                <CardTitle>Belum Ada Skrining</CardTitle>
                <CardDescription>Buat skrining baru untuk mulai menambahkan pertanyaan.</CardDescription>
            </Card>
          )}
        </div>
      </div>

       <AlertDialog open={!!screeningToDelete} onOpenChange={(open) => !open && setScreeningToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus skrining ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus skrining <strong className='text-foreground'>{screeningToDelete?.name}</strong> beserta semua pertanyaannya. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setScreeningToDelete(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
