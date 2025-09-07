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
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Save, Trash2, Bot, Loader2, BedDouble, Download } from 'lucide-react';
import { Separator } from './ui/separator';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getMedicalResume } from '@/app/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Switch } from './ui/switch';
import Papa from 'papaparse';
import type { Patient } from '@/lib/types';


export function TherapyForm({ patient }: { patient: Patient }) {
  const { control, getValues, watch } = useFormContext();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicalResume, setMedicalResume] = useState('');

  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "prescriptions"
  });

  const isAdmitted = watch('inpatientCare.isAdmitted');

  const handleDownload = () => {
    const data = getValues();

    const formattedData = {
        'Nama Pasien': patient.name,
        'Nomor Rekam Medis': patient.medicalRecordNumber,
        'Tanggal Lahir': patient.dateOfBirth,
        '--- ANAMNESIS ---': '',
        'Keluhan Utama': data.mainComplaint,
        'Riwayat Penyakit Sekarang': data.presentIllness,
        'Riwayat Penyakit Dahulu': data.pastMedicalHistory,
        'Riwayat Alergi Obat': data.drugAllergy,
        '--- PEMERIKSAAN FISIK ---': '',
        'Kesadaran': data.consciousness,
        'Tekanan Darah (mmHg)': data.bloodPressure,
        'Nadi (x/menit)': data.heartRate,
        'Pernapasan (x/menit)': data.respiratoryRate,
        'Suhu (C)': data.temperature,
        'Saturasi Oksigen (%)': data.oxygenSaturation,
        'Mata': data.eyes,
        'Hidung': data.nose,
        'Mulut': data.mouth,
        'Jantung (Inspeksi)': data.heartInspection,
        'Jantung (Palpasi)': data.heartPalpation,
        'Jantung (Perkusi)': data.heartPercussion,
        'Jantung (Auskultasi)': data.heartAuscultation,
        'Paru (Inspeksi)': data.lungsInspection,
        'Paru (Palpasi)': data.lungsPalpation,
        'Paru (Perkusi)': data.lungsPercussion,
        'Paru (Auskultasi)': data.lungsAuscultation,
        'Abdomen (Inspeksi)': data.abdomenInspection,
        'Abdomen (Auskultasi)': data.abdomenAuscultation,
        'Abdomen (Perkusi)': data.abdomenPercussion,
        'Abdomen (Palpasi)': data.abdomenPalpation,
        'Ekstremitas': data.extremities,
        'Neurologis': data.neurological,
        '--- PEMERIKSAAN PENUNJANG ---': '',
        'Darah Lengkap': data.completeBloodCount,
        'Urinalisa': data.urinalysis,
        'Kimia Darah': data.bloodChemistry,
        'Mikroskopis': data.microscopic,
        'Imunologi': data.immunology,
        'X-Ray': data.xray,
        'CT Scan': data.ctScan,
        'MRI': data.mri,
        'USG': data.ultrasound,
        'PET Scan': data.petScan,
        'EKG': data.ekg,
        'EEG': data.eeg,
        'EMG': data.emg,
        '--- DIAGNOSIS & RENCANA ---': '',
        'Diagnosis': data.diagnoses.map((d: any) => d.value).join('; '),
        'Prognosis': data.prognosis,
        'Edukasi Pasien': data.patientEducation,
        'Dirujuk': data.referral?.isReferred ? 'Ya' : 'Tidak',
        'Fasilitas Rujukan': data.referral?.facility,
        'Alasan Rujukan': data.referral?.reason,
        '--- TERAPI ---': '',
        'Resep Obat': data.prescriptions.map((p: any) => `${p.drugName} ${p.preparation} ${p.dose} (Jumlah: ${p.quantity})`).join('; '),
        'Tindakan Medis': data.actions,
        'Rawat Inap': data.inpatientCare?.isAdmitted ? 'Ya' : 'Tidak',
        'Instruksi Rawat Inap': data.inpatientCare?.instructions
    };
    
    // Convert object to an array of {field, value} for papaparse
    const csvData = Object.entries(formattedData).map(([field, value]) => ({ field, value }));
    const csv = Papa.unparse(csvData, { header: true });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `rekam_medis_${patient.name.replace(/ /g, '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
  };


  const handleSaveAndSummarize = async () => {
    setIsProcessing(true);
    try {
        const formData = getValues();
        const prescriptions = formData.prescriptions.map((p: any) => `${p.drugName} ${p.preparation} ${p.dose} (qty: ${p.quantity})`).join(', ');
        const inpatient = formData.inpatientCare?.isAdmitted ? `Instruksi Rawat Inap: ${formData.inpatientCare.instructions}` : 'Tidak ada instruksi rawat inap.';
        const actions = `Tindakan: ${formData.actions}. ${inpatient}`;

        const input = {
            anamnesis: `Keluhan Utama: ${formData.mainComplaint}. Riwayat Sekarang: ${formData.presentIllness}. Riwayat Dahulu: ${formData.pastMedicalHistory}. Alergi: ${formData.drugAllergy}.`,
            physicalExamination: `Kesadaran: ${formData.consciousness}, TD: ${formData.bloodPressure}, Nadi: ${formData.heartRate}, RR: ${formData.respiratoryRate}, Suhu: ${formData.temperature}.`,
            supportingExaminations: "Hasil penunjang terlampir jika ada.",
            diagnosis: formData.diagnoses.map((d: {value: string}) => d.value).join(', '),
            prescriptionsAndActions: `Resep: ${prescriptions}. ${actions}`,
        };
        
        const result = await getMedicalResume(input);
        if(result.success && result.data) {
            setMedicalResume(result.data.medicalResume);
            setIsModalOpen(true);

            // Timer logic
            const storageKey = `serviceStartTime-${patient.id}`;
            const startTime = localStorage.getItem(storageKey);
            let toastDescription = 'Data pemeriksaan berhasil disimpan dan ringkasan dibuat.';

            if (startTime) {
                const elapsed = Math.floor((Date.now() - parseInt(startTime, 10)) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                toastDescription += ` Total waktu pelayanan: ${minutes} menit ${seconds} detik.`;
                localStorage.removeItem(storageKey);
            }
            
            toast({
                title: 'Pemeriksaan Disimpan',
                description: toastDescription,
                duration: 9000,
            });
        } else {
            throw new Error(result.error || "Gagal membuat resume medis.");
        }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Gagal Menyimpan",
            description: error.message,
        });
    } finally {
        setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-medium mb-4">Peresepan Obat</h3>
            <div className="space-y-4">
            {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-end p-4 border rounded-lg relative">
                    <FormField
                        control={control}
                        name={`prescriptions.${index}.drugName`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Obat</FormLabel>
                                <FormControl><Input placeholder="Amoxicillin" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={control}
                        name={`prescriptions.${index}.preparation`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sediaan</FormLabel>
                                <FormControl><Input placeholder="500mg Tab" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={control}
                        name={`prescriptions.${index}.dose`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dosis</FormLabel>
                                <FormControl><Input placeholder="3 x 1" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`prescriptions.${index}.quantity`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Jumlah</FormLabel>
                                <FormControl><Input placeholder="15" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            </div>
             <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => append({ drugName: '', preparation: '', dose: '', quantity: '' })}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Obat
            </Button>
        </div>
        
        <Separator />

        <FormField
            control={control}
            name="actions"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Tindakan Medis Lainnya</FormLabel>
                <FormControl>
                <Textarea
                    placeholder="Contoh: Dilakukan hecting 3 jahitan. Edukasi untuk menjaga luka tetap kering..."
                    rows={4}
                    {...field}
                />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />

        <Separator />

        <div>
            <h3 className="text-lg font-medium mb-2">Tindak Lanjut Rawat Inap</h3>
            <div className="space-y-6 p-4 border rounded-lg">
                <FormField
                    control={control}
                    name="inpatientCare.isAdmitted"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                            <div className="space-y-0.5">
                                <FormLabel className="flex items-center gap-2"><BedDouble />Anjuran Rawat Inap</FormLabel>
                                <p className="text-sm text-muted-foreground">Aktifkan jika pasien memerlukan perawatan lebih lanjut di rumah sakit.</p>
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
                {isAdmitted && (
                     <FormField
                        control={control}
                        name="inpatientCare.instructions"
                        render={({ field }) => (
                        <FormItem className="animate-in fade-in-50">
                            <FormLabel>Instruksi Rawat Inap</FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder="Tuliskan instruksi awal untuk perawatan di ruang rawat inap, seperti terapi cairan, observasi tanda vital, diet, dll."
                                rows={4}
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}
            </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t mt-8">
            <Button type="button" variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Unduh CSV
            </Button>
            <Button type="button" onClick={handleSaveAndSummarize} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                {isProcessing ? 'Memproses...' : 'Simpan Pemeriksaan & Buat Resume'}
            </Button>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Bot /> Resume Medis AI</DialogTitle>
                    <DialogDescription>
                        Berikut adalah ringkasan medis yang dibuat oleh AI berdasarkan data yang telah Anda masukkan. Anda bisa menyalin atau merevisinya.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea value={medicalResume} readOnly rows={10} className="bg-secondary" />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Tutup</Button>
                    </DialogClose>
                    <Button type="button" onClick={() => navigator.clipboard.writeText(medicalResume)}>Salin Teks</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </div>
  );
}
