'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getMedicalResume } from '@/app/actions';
import type { Patient } from '@/lib/types';
import { Sparkles, LoaderCircle, Save } from 'lucide-react';

const formSchema = z.object({
  anamnesis: z.string().min(1, 'Anamnesis tidak boleh kosong.'),
  physicalExamination: z.string().min(1, 'Pemeriksaan fisik tidak boleh kosong.'),
  supportingExaminations: z.string().min(1, 'Pemeriksaan penunjang tidak boleh kosong.'),
  diagnosis: z.string().min(1, 'Diagnosis tidak boleh kosong.'),
  prescriptionsAndActions: z.string().min(1, 'Peresepan & tindakan tidak boleh kosong.'),
  medicalResume: z.string().min(1, 'Resume medis tidak boleh kosong.'),
});

export function ExaminationForm({ patient }: { patient: Patient }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      anamnesis: '',
      physicalExamination: '',
      supportingExaminations: '',
      diagnosis: '',
      prescriptionsAndActions: '',
      medicalResume: '',
    },
  });

  async function onGenerateResume() {
    setIsLoading(true);
    const values = form.getValues();
    const result = await getMedicalResume({
        anamnesis: values.anamnesis,
        physicalExamination: values.physicalExamination,
        supportingExaminations: values.supportingExaminations,
        diagnosis: values.diagnosis,
        prescriptionsAndActions: values.prescriptionsAndActions,
    });

    if (result.success && result.data) {
      form.setValue('medicalResume', result.data.medicalResume);
      toast({
        title: 'Resume Medis Dibuat',
        description: 'Resume medis telah berhasil dibuat oleh AI.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Terjadi Kesalahan',
        description: result.error,
      });
    }
    setIsLoading(false);
  }

  function onSaveRecord(values: z.infer<typeof formSchema>) {
    console.log('Menyimpan rekam medis:', { patientId: patient.id, ...values });
    toast({
      title: 'Rekam Medis Tersimpan',
      description: `Rekam medis untuk ${patient.name} telah berhasil disimpan.`,
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSaveRecord)}
        className="space-y-8"
      >
        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
                <FormField
                    control={form.control}
                    name="anamnesis"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Anamnesis</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Keluhan utama, riwayat penyakit sekarang, riwayat penyakit dahulu..."
                            rows={4}
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="physicalExamination"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Pemeriksaan Fisik</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Keadaan umum, tanda vital, status lokalis..."
                            rows={4}
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="supportingExaminations"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Pemeriksaan Penunjang</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Hasil laboratorium, radiologi, EKG, dll."
                            rows={4}
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <div className="space-y-6">
                 <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Diagnosis</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Diagnosis kerja dan diagnosis banding..."
                            rows={2}
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="prescriptionsAndActions"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Peresepan Obat dan Tindakan</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Resep obat, tindakan medis yang dilakukan, edukasi pasien..."
                            rows={4}
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="medicalResume"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Resume Medis</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Klik 'Lengkapi dengan AI' atau isi manual..."
                            rows={4}
                            className="bg-secondary/50"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
        </div>
       
        <div className="flex justify-between items-center gap-4 pt-4 border-t">
          <Button
            type="button"
            onClick={onGenerateResume}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Lengkapi Resume dengan AI
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Simpan Rekam Medis
            </Button>
        </div>
      </form>
    </Form>
  );
}
