'use client';

import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Upload, Printer, Loader2, FileCheck, X, Sparkles, BrainCircuit } from 'lucide-react';
import { Label } from './ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Checkbox } from './ui/checkbox';
import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Separator } from '@/components/ui/separator';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { suggestSupportingExaminations } from '@/ai/flows/suggest-supporting-examinations';
import type { SuggestSupportingExaminationsOutput } from '@/ai/flows/suggest-supporting-examinations-types';
import { Badge } from './ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const requestMap: { [key: string]: string } = {
    'Darah Lengkap': 'requests.lab.completeBloodCount',
    'Urinalisa': 'requests.lab.urinalysis',
    'Kimia Darah': 'requests.lab.bloodChemistry',
    'Mikroskopis': 'requests.lab.microscopic',
    'Imunologi (Rapid Test)': 'requests.lab.immunology',
    'Rontgen (X-Ray)': 'requests.radiology.xray',
    'CT Scan': 'requests.radiology.ctScan',
    'MRI': 'requests.radiology.mri',
    'USG (Ultrasonografi)': 'requests.radiology.ultrasound',
    'PET Scan': 'requests.radiology.petScan',
    'EKG (Elektrokardiogram)': 'requests.other.ekg',
    'EEG (Elektroensefalogram)': 'requests.other.eeg',
    'EMG (Elektromiogram)': 'requests.other.emg',
};

const labRequests = [
    { id: 'requests.lab.completeBloodCount', label: 'Darah Lengkap' },
    { id: 'requests.lab.urinalysis', label: 'Urinalisa' },
    { id: 'requests.lab.bloodChemistry', label: 'Kimia Darah' },
    { id: 'requests.lab.microscopic', label: 'Mikroskopis' },
    { id: 'requests.lab.immunology', label: 'Imunologi (Rapid Test)' },
];

const radiologyRequests = [
    { id: 'requests.radiology.xray', label: 'Rontgen (X-Ray)' },
    { id: 'requests.radiology.ctScan', label: 'CT Scan' },
    { id: 'requests.radiology.mri', label: 'MRI' },
    { id: 'requests.radiology.ultrasound', label: 'USG (Ultrasonografi)' },
    { id: 'requests.radiology.petScan', label: 'PET Scan' },
];

const otherRequests = [
    { id: 'requests.other.ekg', label: 'EKG (Elektrokardiogram)' },
    { id: 'requests.other.eeg', label: 'EEG (Elektroensefalogram)' },
    { id: 'requests.other.emg', label: 'EMG (Elektromiogram)' },
];

function RequestPrintLayout({ patient, requests }: { patient: Patient, requests: any }) {
    const today = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const requestedLab = labRequests.filter(item => requests?.lab?.[item.id.split('.').pop()!]);
    const requestedRadiology = radiologyRequests.filter(item => requests?.radiology?.[item.id.split('.').pop()!]);
    const requestedOther = otherRequests.filter(item => requests?.other?.[item.id.split('.').pop()!]);

    return (
        <div id="printable-area" className="p-8 font-sans">
             <header className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold">FaskesQ</h1>
                    <p className="text-sm text-gray-600">Jl. Kesehatan No. 1, Kota Sehat</p>
                    <p className="text-sm text-gray-600">Telp: (021) 123-4567</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold">Formulir Permintaan Pemeriksaan Penunjang</h2>
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
            <section>
                 <h3 className="font-bold text-lg mb-2">Pemeriksaan yang Diminta</h3>
                 <div className="space-y-4">
                    {requestedLab.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2 underline">Laboratorium</h4>
                            <ul className="list-disc list-inside">
                                {requestedLab.map(req => <li key={req.id}>{req.label}</li>)}
                            </ul>
                        </div>
                    )}
                    {requestedRadiology.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2 underline">Radiologi</h4>
                            <ul className="list-disc list-inside">
                                {requestedRadiology.map(req => <li key={req.id}>{req.label}</li>)}
                            </ul>
                        </div>
                    )}
                     {requestedOther.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2 underline">Lainnya</h4>
                            <ul className="list-disc list-inside">
                                {requestedOther.map(req => <li key={req.id}>{req.label}</li>)}
                            </ul>
                        </div>
                    )}
                 </div>
                 {requests.notes && (
                     <div className="mt-4">
                         <h4 className="font-semibold mb-1">Catatan/Indikasi Klinis:</h4>
                         <p className="text-sm border p-2 rounded-md">{requests.notes}</p>
                     </div>
                 )}
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

export function SupportingExamForm({ patient }: { patient: Patient }) {
  const { control, handleSubmit, watch, setValue, getValues } = useFormContext();
  const { toast } = useToast();
  const requests = watch('requests');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<SuggestSupportingExaminationsOutput | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setValue('fileUpload', file.name, { shouldValidate: true });
      toast({
        title: 'Berkas Dipilih',
        description: `Nama berkas: ${file.name}`,
      });
    }
  };

 const handleGenerateSuggestions = async () => {
    setIsGenerating(true);
    setAiSuggestions(null);
    try {
      const anamnesis = getValues('anamnesis');
      const physicalExam = getValues('physicalExamination');
      const diagnosisForm = getValues('diagnosis');

      // Simple check for now, can be improved
      const differentialDiagnoses = diagnosisForm ? [{ diagnosis: diagnosisForm, confidence: 90, priority: 'High', reasoning: 'Based on form input' }] : [];

      if (!anamnesis || !physicalExam) {
        toast({ title: 'Data Kurang', description: 'Anamnesis dan Pemeriksaan Fisik harus diisi.', variant: 'destructive' });
        return;
      }

      const result = await suggestSupportingExaminations({
        anamnesis,
        physicalExam,
        differentialDiagnoses,
      });

      setAiSuggestions(result);
      if (result.recommendations.length > 0) {
        setShowConfirmation(true);
      } else {
        toast({ title: 'Tidak Ada Rekomendasi', description: 'AI tidak menemukan rekomendasi pemeriksaan yang relevan saat ini.' });
      }
    } catch (error) {
      console.error("Failed to get AI suggestions:", error);
      toast({ title: 'Gagal Menghasilkan Rekomendasi', description: 'Terjadi kesalahan saat berkomunikasi dengan AI.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptSuggestions = () => {
    if (!aiSuggestions) return;

    let suggestionsAddedCount = 0;
    aiSuggestions.recommendations.forEach(suggestion => {
      const formFieldName = requestMap[suggestion.examination];
      if (formFieldName) {
        setValue(formFieldName, true, { shouldDirty: true, shouldValidate: true });
        suggestionsAddedCount++;
      }
    });

    if (suggestionsAddedCount > 0) {
        toast({ 
            title: 'Permintaan Ditambahkan', 
            description: `${suggestionsAddedCount} rekomendasi pemeriksaan telah ditambahkan ke formulir.`
        });
    }

    setShowConfirmation(false);
    setAiSuggestions(null);
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  async function onSubmit(values: any) {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Supporting Exam submitted:', { ...values, uploadedFile: uploadedFile?.name });
    setIsSaving(false);
    toast({
      title: 'Pemeriksaan Penunjang Disimpan',
      description: 'Data hasil dan permintaan pemeriksaan penunjang telah berhasil disimpan.',
    });
  }

  const handlePrint = () => {
    window.print();
  }

  return (
      <> 
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><BrainCircuit className="mr-2" />Sistem Pendukung Keputusan Klinis AI</CardTitle>
                <CardDescription>Dapatkan rekomendasi pemeriksaan penunjang berdasarkan data klinis pasien untuk membantu menegakkan diagnosis.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Button type="button" onClick={handleGenerateSuggestions} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {isGenerating ? 'Menganalisis...' : 'Dapatkan Rekomendasi AI'}
                </Button>
            </CardContent>
        </Card>
        <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="request" className="border rounded-lg px-4">
                <AccordionTrigger className="text-lg font-medium">Buat Permintaan Pemeriksaan</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Laboratorium</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                           {labRequests.map(item => (
                               <FormField
                                    key={item.id}
                                    control={control}
                                    name={item.id}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel>
                                        </FormItem>
                                    )}
                                />
                           ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Radiologi</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                           {radiologyRequests.map(item => (
                               <FormField
                                    key={item.id}
                                    control={control}
                                    name={item.id}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel>
                                        </FormItem>
                                    )}
                                />
                           ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Pemeriksaan Lainnya</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                           {otherRequests.map(item => (
                               <FormField
                                    key={item.id}
                                    control={control}
                                    name={item.id}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel>
                                        </FormItem>
                                    )}
                                />
                           ))}
                        </CardContent>
                    </Card>
                     <FormField
                        control={control}
                        name="requests.notes"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Catatan / Indikasi Klinis</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Contoh: Demam hari ke-5, curiga Demam Berdarah..." rows={3} {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                    <div className="flex justify-end pt-2">
                        <Button type="button" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Cetak Permintaan
                        </Button>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <Accordion type="multiple" className="w-full space-y-4">
            <AccordionItem value="lab" className="border rounded-lg px-4">
                <AccordionTrigger className="text-lg font-medium">Input Hasil Laboratorium</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                    <FormField
                    control={control}
                    name="completeBloodCount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Pemeriksaan Darah Lengkap</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Hb, Leukosit, Trombosit, dll." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={control}
                    name="urinalysis"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Pemeriksaan Urinalisa</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Warna, pH, protein, glukosa, dll." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={control}
                    name="bloodChemistry"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Pemeriksaan Kimia Darah</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Gula darah, kolesterol, fungsi hati, fungsi ginjal, dll." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={control}
                    name="microscopic"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Pemeriksaan Mikroskopis</FormLabel>
                        <FormControl>
                            <Textarea placeholder="BTA, Jamur, dll." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={control}
                    name="immunology"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Rapid Test Imunologi</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Widal, HbsAg, HIV, Dengue, dll." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="radiology" className="border rounded-lg px-4">
                <AccordionTrigger className="text-lg font-medium">Input Hasil Radiologi</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                    <FormField control={control} name="xray" render={({ field }) => (<FormItem><FormLabel>Rontgen (X-Ray)</FormLabel><FormControl><Textarea placeholder="Kesan foto thorax, abdomen, dll." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name="ctScan" render={({ field }) => (<FormItem><FormLabel>CT Scan</FormLabel><FormControl><Textarea placeholder="Kesan CT Scan kepala, thorax, dll." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name="mri" render={({ field }) => (<FormItem><FormLabel>MRI</FormLabel><FormControl><Textarea placeholder="Kesan MRI..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name="ultrasound" render={({ field }) => (<FormItem><FormLabel>USG (Ultrasonografi)</FormLabel><FormControl><Textarea placeholder="Kesan USG abdomen, kandungan, dll." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name="petScan" render={({ field }) => (<FormItem><FormLabel>PET Scan</FormLabel><FormControl><Textarea placeholder="Kesan PET Scan..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="other-exams" className="border rounded-lg px-4">
                <AccordionTrigger className="text-lg font-medium">Input Hasil Pemeriksaan Lainnya</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                    <FormField control={control} name="ekg" render={({ field }) => (<FormItem><FormLabel>EKG (Elektrokardiogram)</FormLabel><FormControl><Textarea placeholder="Irama, HR, aksis, dll." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name="eeg" render={({ field }) => (<FormItem><FormLabel>EEG (Elektroensefalogram)</FormLabel><FormControl><Textarea placeholder="Kesan EEG..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name="emg" render={({ field }) => (<FormItem><FormLabel>EMG (Elektromiogram)</FormLabel><FormControl><Textarea placeholder="Kesan EMG..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        
        <div className="space-y-2">
            <Label>Unggah Berkas Laporan</Label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <Button type="button" variant="outline" onClick={triggerFileSelect}>
                    <Upload className="mr-2 h-4 w-4" />
                    Pilih Berkas...
                </Button>
                 {uploadedFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border rounded-md bg-secondary/50 flex-grow">
                        <FileCheck className='h-4 w-4 text-green-600' />
                        <span className="truncate">{uploadedFile.name}</span>
                        <Button type='button' variant='ghost' size='icon' className='h-6 w-6 ml-auto' onClick={() => setUploadedFile(null)}>
                            <X className='h-4 w-4' />
                        </Button>
                    </div>
                )}
            </div>
             <FormField control={control} name="fileUpload" render={() => <FormMessage />} />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'Menyimpan...' : 'Simpan Pemeriksaan Penunjang'}
          </Button>
        </div>
        <div className="hidden">
           <RequestPrintLayout patient={patient} requests={requests} />
        </div>
      </form>
       <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Rekomendasi AI</AlertDialogTitle>
                    <AlertDialogDescription>
                        AI telah merekomendasikan pemeriksaan berikut berdasarkan data pasien. Apakah Anda ingin menambahkannya ke formulir permintaan?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="max-h-60 overflow-y-auto p-2 border rounded-md my-4">
                    {aiSuggestions?.recommendations.map((suggestion, index) => (
                         <div key={index} className="mb-3 p-3 rounded-lg bg-secondary/50">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold">{suggestion.examination}</h4>
                                <Badge variant="secondary">Disarankan</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{suggestion.reasoning}</p>
                        </div>
                    ))}
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setAiSuggestions(null)}>Tolak</AlertDialogCancel>
                    <AlertDialogAction onClick={handleAcceptSuggestions}>Tambahkan ke Permintaan</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </>
  );
}
