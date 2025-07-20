'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { Save } from 'lucide-react';

const formSchema = z.object({
  mainComplaint: z.string().min(1, 'Keluhan utama tidak boleh kosong.'),
  presentIllness: z.string().min(1, 'Riwayat penyakit sekarang tidak boleh kosong.'),
  pastMedicalHistory: z.string().optional(),
  drugAllergy: z.string().optional(),
});

export function AnamnesisForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mainComplaint: '',
      presentIllness: '',
      pastMedicalHistory: '',
      drugAllergy: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Anamnesis submitted:', values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="mainComplaint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keluhan Utama</FormLabel>
              <FormControl>
                <Textarea placeholder="Contoh: Demam sejak 3 hari yang lalu..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="presentIllness"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keluhan Penyerta / Riwayat Penyakit Sekarang</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Jelaskan detail keluhan, kronologi, dan gejala penyerta lainnya..."
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pastMedicalHistory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Riwayat Penyakit Dahulu</FormLabel>
              <FormControl>
                <Textarea placeholder="Contoh: Hipertensi terkontrol, Diabetes Melitus sejak 5 tahun lalu..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="drugAllergy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Riwayat Alergi Obat</FormLabel>
              <FormControl>
                <Textarea placeholder="Contoh: Alergi Paracetamol (muncul ruam)..." rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <div className="flex justify-end pt-4">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Simpan Anamnesis
          </Button>
        </div>
      </form>
    </Form>
  );
}
