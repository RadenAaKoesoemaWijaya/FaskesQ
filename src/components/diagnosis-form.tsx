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
import { Printer, Search, Loader2, Info, BrainCircuit, PlusCircle, Trash2 } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Patient } from '@/lib/types';
import { useState } from 'react';
import { getMedicalResume, runSuggestIcd10, runSuggestDifferentialDiagnosis } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import type { SuggestIcd10Output, SuggestDifferentialDiagnosisOutput } from '@/app/actions';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

function ReferralPrintLayout({ patient, referralData, medicalResume }: { patient: Patient, referralData: any, medicalResume: string }) {
    const today = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div id="printable-referral-area" className="p-8 font-sans">
             <header className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold">FaskesQ</h1>
                    <p className="text-sm text-gray-600">Jl. Kesehatan No. 1, Kota Sehat</p>
                    <p className="text-sm text-gray-600">Telp: (021) 123-4567</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold">Surat Rujukan</h2>
                    <p className="text-sm">Tanggal: {today}</p>
                </div>
            </header>

            <Separator className="my-6" />

            <section className="mb-6">
                <h3 className="font-bold text-lg mb-2">Data Pasien</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div><strong>Nama:</strong> {patient.name}</div>
                    <div><strong>No. RM:</strong> {patient.medicalRecordNumber}</div>
                    <div><strong>Tanggal Lahir:</strong> {patient.dateOfBirth}</div>
                    <div><strong>Jenis Kelamin:</strong> {patient.gender}</div>
                </div>
            </section>
            
            <Separator className="my-6" />

            <section className="mb-6">
                <h3 className="font-bold text-lg mb-2">Informasi Rujukan</h3>
                <div className="grid grid-cols-1 gap-y-2 text-sm">
                    <div><strong>Dirujuk ke:</strong> {referralData?.facility || 'N/A'}</div>
                    <div><strong>Alasan Rujukan:</strong> {referralData?.reason || 'N/A'}</div>
                </div>
            </section>

             <Separator className="my-6" />

            <section>
                 <h3 className="font-bold text-lg mb-2">Ringkasan Medis</h3>
                 <div className="space-y-4 text-sm border p-4 rounded-md">
                    <p>{medicalResume || 'Resume medis tidak tersedia.'}</p>
                 </div>
            </section>

             <footer className="mt-16 text-sm">
                <div className="grid grid-cols-2 gap-8">
                    <div></div>
                    <div className="text-center">
                        <p>Hormat kami,</p>
                        <div className="h-20"></div>
                        <p className="border-t pt-1">( Dr. Amanda Sari )</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export function DiagnosisForm({ patient }: { patient: Patient }) {
  const { control, getValues, watch, setValue, formState: { errors } } = useFormContext();
  const { toast } = useToast();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "diagnoses"
  });

  // States for Referral
  const isReferred = watch('referral.isReferred');
  const [isPrinting, setIsPrinting] = useState(false);
  const [medicalResume, setMedicalResume] = useState('');
  
  // States for ICD-10 Search
  const [isSearchingIcd, setIsSearchingIcd] = useState(false);
  const [icdSuggestions, setIcdSuggestions] = useState<SuggestIcd10Output['suggestions']>([]);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchTargetIndex, setSearchTargetIndex] = useState<number | null>(null);

  // States for AI Differential Diagnosis
  const [showAiDiagnosis, setShowAiDiagnosis] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [diffDiagnosis, setDiffDiagnosis] = useState<string[]>([]);
  

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
                description: 'Pastikan setidaknya kolom Anamnesis dan Pemeriksaan Fisik telah terisi.',
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
    // If first diagnosis is empty, set it. Otherwise, append.
    const diagnoses = getValues('diagnoses');
    if (diagnoses.length === 1 && !diagnoses[0].value) {
        setValue('diagnoses.0.value', diagnosis);
    } else {
        append({ value: diagnosis });
    }
    toast({
        title: "Diagnosis Ditambahkan",
        description: `"${diagnosis}" telah ditambahkan ke daftar.`,
    });
  }

  const handlePrintReferral = async () => {
    setIsPrinting(true);
    try {
        const formData = getValues();
        const diagnosisText = formData.diagnoses.map((d: {value: string}) => d.value).join(', ');

        const input = {
            anamnesis: `Keluhan Utama: ${formData.mainComplaint}. Riwayat Sekarang: ${formData.presentIllness}. Riwayat Dahulu: ${formData.pastMedicalHistory}. Alergi: ${formData.drugAllergy}.`,
            physicalExamination: `Kesadaran: ${formData.consciousness}, TD: ${formData.bloodPressure}, Nadi: ${formData.heartRate}, RR: ${formData.respiratoryRate}, Suhu: ${formData.temperature}.`,
            supportingExaminations: "Hasil penunjang terlampir jika ada.",
            diagnosis: diagnosisText,
            prescriptionsAndActions: "Terapi dan tindakan terlampir.",
        };
        const result = await getMedicalResume(input);
        if (result.success && result.data) {
            setMedicalResume(result.data.medicalResume);
            // Wait for state to update before printing
            setTimeout(() => {
                 const printContents = document.getElementById('printable-referral-area')?.innerHTML;
                 const originalContents = document.body.innerHTML;
                 if (printContents) {
                    document.body.innerHTML = printContents;
                    window.print();
                    document.body.innerHTML = originalContents;
                    // It's a bit of a hack, but we need to re-attach the event listeners for our app to work after printing
                    window.location.reload();
                 }
            }, 500);

        } else {
            throw new Error(result.error || "Gagal membuat resume medis.");
        }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Gagal Mencetak Rujukan",
            description: error.message,
        });
    } finally {
        setIsPrinting(false);
    }
  }


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
                        <div>
                             <h4 className="font-semibold text-sm mb-2">Klik untuk menambahkan ke daftar diagnosis:</h4>
                             <div className="flex flex-wrap gap-2">
                                {diffDiagnosis.map((diag, i) => (
                                    <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => handleAddDiagnosisFromAi(diag)}>
                                        <PlusCircle className="mr-2 h-3 w-3" />
                                        {diag}
                                    </Badge>
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
                        <FormLabel>Edukasi Pasien</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Jelaskan mengenai penyakit, rencana pengobatan, dan hal-hal yang perlu diperhatikan oleh pasien..." rows={4} {...field} />
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
        <ReferralPrintLayout patient={patient} referralData={watch('referral')} medicalResume={medicalResume} />
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
