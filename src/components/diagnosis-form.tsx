'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Printer, Search, Loader2, Info, BrainCircuit, PlusCircle, Trash2, Sparkles } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Patient } from '@/lib/types';
import { useState } from 'react';
import { getMedicalResume, runSuggestIcd10, runSuggestDifferentialDiagnosis, runSuggestPatientEducation } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import type { SuggestIcd10Output } from '@/ai/flows/suggest-icd10-flow';
import type { SuggestDifferentialDiagnosisOutput } from '@/ai/flows/suggest-differential-diagnosis';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';


export function DiagnosisForm({ patient }: { patient: Patient }) {
  const { control, getValues, watch, setValue, formState: { errors } } = useFormContext();
  const { toast } = useToast();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "diagnoses"
  });

  const isReferred = watch('referral.isReferred');
  const [isPrinting, setIsPrinting] = useState(false);
  const [medicalResume, setMedicalResume] = useState('');
  
  const [isSearchingIcd, setIsSearchingIcd] = useState(false);
  const [icdSuggestions, setIcdSuggestions] = useState<SuggestIcd10Output['suggestions']>([]);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchTargetIndex, setSearchTargetIndex] = useState<number | null>(null);

  const [showAiDiagnosis, setShowAiDiagnosis] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [diffDiagnosis, setDiffDiagnosis] = useState<SuggestDifferentialDiagnosisOutput['diagnoses']>([]);

  const [isGeneratingEducation, setIsGeneratingEducation] = useState(false);
  
  const handleSearchIcd = async (index: number) => {
      setSearchTargetIndex(index);
      const query = getValues(`diagnoses.${index}.value`);

      if (!query) {
          toast({
              variant: "destructive",
              title: "Teks Diagnosis Kosong",
              description: "Silakan masukkan deskripsi diagnosis sebelum mencari kode.",
          });
          return;
      }

      setIsSearchingIcd(true);
      setIcdSuggestions([]);
      setIsSearchDialogOpen(true);
      
      const result = await runSuggestIcd10({ diagnosisQuery: query });

      if (result.success && result.data) {
          setIcdSuggestions(result.data.suggestions);
      } else {
          toast({
              variant: "destructive",
              title: "Pencarian Gagal",
              description: result.error || "Gagal mendapatkan saran kode ICD-10.",
          });
          setIsSearchDialogOpen(false);
      }
      setIsSearchingIcd(false);
  }

  const handleSelectIcd = (suggestion: { code: string, description: string }) => {
      if (searchTargetIndex !== null) {
          setValue(`diagnoses.${searchTargetIndex}.value`, `${suggestion.code} - ${suggestion.description}`);
          setIsSearchDialogOpen(false);
      }
  }

  const handleSuggestDifferentialDiagnosis = async () => {
    setIsSuggesting(true);
    setDiffDiagnosis([]);
    try {
        const values = getValues();
        const anamnesis = `Keluhan Utama: ${values.mainComplaint}. Riwayat Sekarang: ${values.presentIllness}. Riwayat Dahulu: ${values.pastMedicalHistory}. Alergi: ${values.drugAllergy}.`;
        const physicalExam = `Kesadaran: ${values.consciousness}, TD: ${values.bloodPressure}, Nadi: ${values.heartRate}, RR: ${values.respiratoryRate}, Suhu: ${values.temperature}. Temuan lain: ${values.eyes}, ${values.nose}, ${values.mouth}, ${values.lungsAuscultation}, ${values.heartAuscultation}, ${values.abdomenAuscultation}`;
        
        if (!values.mainComplaint) {
            toast({
                variant: 'destructive',
                title: 'Data Tidak Lengkap',
                description: 'Pastikan setidaknya kolom Keluhan Utama pada Anamnesis telah terisi.',
            });
            return;
        }

        const result = await runSuggestDifferentialDiagnosis({ anamnesis, physicalExam });
        
        if (result.success && result.data) {
            setDiffDiagnosis(result.data.diagnoses);
        } else {
            throw new Error(result.error || 'Gagal mendapatkan rekomendasi.');
        }

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Gagal Mendapatkan Rekomendasi",
            description: error.message,
        });
    } finally {
        setIsSuggesting(false);
    }
  }
  
  const handleAddDiagnosisFromAi = (diagnosis: string) => {
    const currentDiagnoses = getValues('diagnoses') as { value: string }[];
    if (currentDiagnoses.length === 0 || !currentDiagnoses[0].value) {
      setValue('diagnoses.0.value', diagnosis);
    } else {
      append({ value: diagnosis });
    }
  };

  const handleGenerateEducation = async () => {
    const diagnosis = getValues("diagnoses.0.value");
    if (!diagnosis) {
        toast({
            variant: 'destructive',
            title: 'Diagnosis Kerja Kosong',
            description: 'Silakan isi Diagnosis Kerja sebelum membuat edukasi pasien.',
        });
        return;
    }

    setIsGeneratingEducation(true);
    try {
        const result = await runSuggestPatientEducation({ diagnosis });
        if(result.success && result.data) {
            const educationText = `Penjelasan Penyakit:\n${result.data.diseaseExplanation}\n\nRencana Pengobatan:\n${result.data.treatmentPlan}\n\nAnjuran Perawatan di Rumah:\n${result.data.homeCareAdvice}\n\nTanda Bahaya:\n${result.data.warningSigns}`;
            setValue('patientEducation', educationText);
            toast({
                title: 'Edukasi Pasien Dibuat',
                description: 'Teks edukasi pasien telah berhasil dibuat oleh AI.'
            });
        } else {
            throw new Error(result.error || "Gagal membuat edukasi pasien.");
        }
    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Gagal Membuat Edukasi",
            description: error.message,
        });
    } finally {
        setIsGeneratingEducation(false);
    }
  }

  const handlePrintReferral = async () => {
    setIsPrinting(true);
    try {
      const values = getValues();
      const anamnesis = `Keluhan Utama: ${values.mainComplaint}. Riwayat Sekarang: ${values.presentIllness}. Riwayat Dahulu: ${values.pastMedicalHistory}. Alergi: ${values.drugAllergy}.`;
      const physicalExam = `Kesadaran: ${values.consciousness}, TD: ${values.bloodPressure}, Nadi: ${values.heartRate}, RR: ${values.respiratoryRate}, Suhu: ${values.temperature}. Temuan lain: ${values.eyes}, ${values.nose}, ${values.mouth}, ${values.lungsAuscultation}, ${values.heartAuscultation}, ${values.abdomenAuscultation}`;
      
      const resumeResult = await getMedicalResume({
        anamnesis,
        physicalExamination: physicalExam,
        diagnosis: values.diagnoses.map((d: { value: string }) => d.value).join(', '),
        supportingExaminations: "Hasil penunjang terlampir jika ada.",
        prescriptionsAndActions: values.patientEducation || '',
      });

      if (resumeResult.success && resumeResult.data) {
        setMedicalResume(resumeResult.data.medicalResume);
        
        setTimeout(() => {
          const printContent = document.getElementById('printable-referral-area');
          if (printContent) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
              printWindow.document.write('<html><head><title>Surat Rujukan</title></head><body>' + printContent.innerHTML + '</body></html>');
              printWindow.document.close();
              printWindow.print();
            }
          }
        }, 100);
      } else {
        toast({
          variant: "destructive",
          title: "Gagal Membuat Resume",
          description: resumeResult.error || "Gagal membuat resume medis.",
        });
      }
    } catch (error) {
      console.error('Error printing referral:', error);
      toast({
        variant: "destructive",
        title: "Gagal Mencetak",
        description: "Terjadi kesalahan saat mencetak surat rujukan.",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Penegakan Diagnosis</h3>

         <div className="space-y-4 p-4 border rounded-lg mb-6">
            <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2"><BrainCircuit />Rekomendasi Diagnosis Banding AI</FormLabel>
                    <p className="text-sm text-muted-foreground">Aktifkan untuk mendapatkan saran diagnosis banding dari AI.</p>
                </div>
                <FormControl>
                    <Switch
                    checked={showAiDiagnosis}
                    onCheckedChange={setShowAiDiagnosis}
                    />
                </FormControl>
            </FormItem>

            {showAiDiagnosis && (
                <div className="space-y-4 pt-4 border-t animate-in fade-in-50">
                    <Button type="button" variant="outline" onClick={handleSuggestDifferentialDiagnosis} disabled={isSuggesting}>
                        {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                        {isSuggesting ? 'Menganalisis...' : 'Dapatkan Rekomendasi'}
                    </Button>
                    {isSuggesting && <p className="text-sm text-muted-foreground">AI sedang menganalisis data anamnesis dan pemeriksaan fisik...</p>}
                     {diffDiagnosis.length > 0 && (
                        <div className="pt-2">
                            <h4 className="font-semibold text-sm mb-3">Rekomendasi Diagnosis (klik untuk menambahkan):</h4>
                            <div className="space-y-3">
                                {diffDiagnosis.map((diag, i) => (
                                <div key={i} className="p-3 border rounded-lg cursor-pointer hover:bg-accent" onClick={() => handleAddDiagnosisFromAi(diag.diagnosis)}>
                                    <div className="flex justify-between items-start">
                                        <h5 className="font-semibold">{diag.diagnosis}</h5>
                                        <Badge variant={diag.priority === 'High' ? 'destructive' : diag.priority === 'Medium' ? 'secondary' : 'outline'}>
                                            {diag.priority} Priority
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1 mb-2">{diag.reasoning}</p>
                                    <span className="text-xs font-medium text-blue-600">Keyakinan AI: {diag.confidence}%</span>
                                </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>


        <div className="space-y-4">
             {fields.map((field, index) => (
                <div key={field.id} className={cn("p-4 border rounded-lg", index === 0 && "border-primary/50 bg-primary/5")}>
                    <FormField
                    control={control}
                    name={`diagnoses.${index}.value`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{index === 0 ? 'Diagnosis Kerja' : `Diagnosis Banding ${index}`}</FormLabel>
                        <div className="flex gap-2">
                            <FormControl>
                            <Input placeholder="Contoh: Common cold" {...field} />
                            </FormControl>
                            <Button type="button" variant="outline" size="icon" onClick={() => handleSearchIcd(index)}>
                                <Search className="h-4 w-4" />
                            </Button>
                             {fields.length > 1 && (
                                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            ))}
            {errors.diagnoses && !errors.diagnoses.root && (
                <p className="text-sm font-medium text-destructive">
                    {(errors.diagnoses as any)?.message}
                </p>
            )}
             <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ value: '' })}
                disabled={fields.length >= 10}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Diagnosis
            </Button>
        </div>
      </div>
      
      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-4">Prognosis & Edukasi</h3>
        <div className="space-y-6">
            <FormField
                control={control}
                name="prognosis"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Prognosis</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Jelaskan prognosis penyakit (cth: ad bonam, ad malam, dll.) beserta alasannya..." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={control}
                name="patientEducation"
                render={({ field }) => (
                    <FormItem>
                         <div className="flex items-center justify-between">
                            <FormLabel>Edukasi Pasien</FormLabel>
                            <Button type="button" variant="outline" size="sm" onClick={handleGenerateEducation} disabled={isGeneratingEducation}>
                                {isGeneratingEducation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Buat Rekomendasi AI
                            </Button>
                        </div>
                        <FormControl>
                            <Textarea placeholder="Jelaskan mengenai penyakit, rencana pengobatan, dan hal-hal yang perlu diperhatikan oleh pasien..." rows={8} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
      </div>

       <Separator />

       <div>
        <h3 className="text-lg font-medium mb-2">Rujukan</h3>
        <div className="space-y-6 p-4 border rounded-lg">
             <FormField
                control={control}
                name="referral.isReferred"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                            <FormLabel>Rujuk Pasien</FormLabel>
                            <p className="text-sm text-muted-foreground">Aktifkan jika pasien perlu dirujuk ke fasilitas kesehatan lain.</p>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
                />
            {isReferred && (
                <div className="space-y-6 animate-in fade-in-50">
                     <FormField
                        control={control}
                        name="referral.facility"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fasilitas Kesehatan Tujuan</FormLabel>
                                <FormControl>
                                    <Input placeholder="Contoh: RSUPN Dr. Cipto Mangunkusumo" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={control}
                        name="referral.reason"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Alasan Rujukan</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Contoh: Memerlukan pemeriksaan dan penanganan oleh dokter spesialis..." rows={3} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end">
                        <Button type="button" onClick={handlePrintReferral} disabled={isPrinting}>
                           {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                           {isPrinting ? 'Mempersiapkan...' : 'Cetak Surat Rujukan'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
      </div>
      <div className="hidden">
         <div id="printable-referral-area" className="p-8">
            <p>Nama: {patient.name}</p>
            <p>Resume: {medicalResume}</p>
        </div>
      </div>

       <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Saran Kode ICD-10</DialogTitle>
                    <DialogDescription>
                        Berikut adalah saran kode ICD-10 berdasarkan deskripsi diagnosis Anda. Klik salah satu untuk memilih.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {isSearchingIcd ? (
                        <div className="flex items-center justify-center h-24">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : icdSuggestions.length > 0 ? (
                        <div className="space-y-2">
                            {icdSuggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectIcd(suggestion)}
                                    className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors border"
                                >
                                    <p className="font-bold">{suggestion.code}</p>
                                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                                </button>
                            ))}
                        </div>
                    ) : (
                         <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Tidak Ada Saran</AlertTitle>
                            <AlertDescription>
                                AI tidak dapat menemukan saran untuk diagnosis tersebut. Coba gunakan kata kunci yang berbeda atau isi secara manual.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </DialogContent>
        </Dialog>

    </div>
  );
}
