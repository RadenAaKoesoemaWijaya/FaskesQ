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
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

export function AnamnesisForm() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <FormField
        control={control}
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
        control={control}
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
        control={control}
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
        control={control}
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
    </div>
  );
}
