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

function ClusterCard({
  cluster,
  onUpdate,
  onDelete,
}: {
  cluster: ScreeningCluster;
  onUpdate: (updatedCluster: ScreeningCluster) => void;
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
      const newQuestion = await addScreeningQuestion(cluster.id, newQuestionText.trim());
      const updatedQuestions = [...cluster.questions, newQuestion];
      onUpdate({ ...cluster, questions: updatedQuestions });
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
      await updateScreeningQuestion(cluster.id, updatedQuestion.id, updatedQuestion.text);
      const updatedQuestions = cluster.questions.map((q) =>
        q.id === updatedQuestion.id ? updatedQuestion : q
      );
      onUpdate({ ...cluster, questions: updatedQuestions });
       toast({ title: "Pertanyaan diperbarui" });
    } catch {
       toast({ title: "Gagal memperbarui pertanyaan", variant: 'destructive' });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
      try {
        await deleteScreeningQuestion(cluster.id, questionId);
        const updatedQuestions = cluster.questions.filter((q) => q.id !== questionId);
        onUpdate({ ...cluster, questions: updatedQuestions });
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
                <CardTitle>{cluster.name}</CardTitle>
                <CardDescription>
                Rentang Usia: {cluster.ageRange.min} - {cluster.ageRange.max} tahun
                </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onDelete(cluster.id)}>
                <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {cluster.questions.map((q) => (
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

function NewClusterForm({ onAdd }: { onAdd: (cluster: ScreeningCluster) => void }) {
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
      const newCluster = await addScreeningCluster({
        name,
        ageRange: { min: parseInt(minAge), max: parseInt(maxAge) },
      });
      onAdd(newCluster);
      setName('');
      setMinAge('');
      setMaxAge('');
      toast({ title: "Klaster baru dibuat" });
    } catch (error) {
      toast({ title: "Gagal membuat klaster", variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Klaster Baru</CardTitle>
        <CardDescription>
          Buat grup pertanyaan baru berdasarkan nama atau rentang usia pasien.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clusterName">Nama Klaster</Label>
            <Input
              id="clusterName"
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
                Isi rentang usia 0-150 jika klaster berlaku untuk semua usia.
              </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
               {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buat Klaster
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ScreeningSettingsPage() {
  const [clusters, setClusters] = useState<ScreeningCluster[]>([]);
  const [clusterToDelete, setClusterToDelete] = useState<ScreeningCluster | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      const data = await getScreeningClusters();
      setClusters(data);
    }
    loadData();
  }, []);

  const handleAddCluster = (newCluster: ScreeningCluster) => {
    setClusters((prev) => [...prev, newCluster].sort((a,b) => a.name.localeCompare(b.name)));
  };

  const handleUpdateCluster = (updatedCluster: ScreeningCluster) => {
    setClusters((prev) =>
      prev.map((c) => (c.id === updatedCluster.id ? updatedCluster : c))
    );
  };
  
  const handleDeleteRequest = (cluster: ScreeningCluster) => {
    setClusterToDelete(cluster);
  }

  const handleConfirmDelete = async () => {
    if (!clusterToDelete) return;
    
    try {
        await deleteScreeningCluster(clusterToDelete.id);
        setClusters(prev => prev.filter(c => c.id !== clusterToDelete.id));
        toast({ title: `Klaster "${clusterToDelete.name}" dihapus.` });
    } catch {
        toast({ title: "Gagal menghapus klaster.", variant: 'destructive' });
    } finally {
        setClusterToDelete(null);
    }
  }

  return (
    <div className="animate-in fade-in-50">
      <PageHeader
        title="Pengaturan Skrining Kesehatan"
        subtitle="Kelola daftar pertanyaan skrining berdasarkan klaster usia atau kategori penyakit."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <NewClusterForm onAdd={handleAddCluster} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          {clusters.length > 0 ? (
            clusters.map((cluster) => (
              <ClusterCard
                key={cluster.id}
                cluster={cluster}
                onUpdate={handleUpdateCluster}
                onDelete={() => handleDeleteRequest(cluster)}
              />
            ))
          ) : (
             <Card className="text-center p-8">
                <CardTitle>Belum Ada Klaster</CardTitle>
                <CardDescription>Buat klaster baru untuk mulai menambahkan pertanyaan skrining.</CardDescription>
            </Card>
          )}
        </div>
      </div>

       <AlertDialog open={!!clusterToDelete} onOpenChange={(open) => !open && setClusterToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus klaster ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus klaster <strong className='text-foreground'>{clusterToDelete?.name}</strong> beserta semua pertanyaannya. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClusterToDelete(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
