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
import { Textarea } from '@/components/ui/textarea';
import { Save, ShieldCheck } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { getScreeningClusters } from '@/lib/data';
import { useEffect, useState } from 'react';
import type { ScreeningCluster, ScreeningQuestion } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';

function AnamnesisScreening() {
  const { control, setValue } = useFormContext();
  const [clusters, setClusters] = useState<ScreeningCluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<ScreeningCluster | null>(null);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "screeningAnswers"
  });

  useEffect(() => {
    async function loadClusters() {
      const data = await getScreeningClusters();
      setClusters(data);
    }
    loadClusters();
  }, []);

  const handleClusterChange = (clusterId: string) => {
    const cluster = clusters.find(c => c.id === clusterId) || null;
    setSelectedCluster(cluster);
    // Clear previous answers
    remove();
    // Append new questions
    if (cluster) {
      cluster.questions.forEach(q => {
        append({
          questionId: q.id,
          questionText: q.text,
          answer: ''
        });
      });
    }
  };

  return (
     <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="screening" className="border rounded-lg px-4 bg-muted/30">
        <AccordionTrigger>
          <div className="flex items-center gap-2 text-base">
            <ShieldCheck className="text-primary" />
            Skrining Kesehatan Tambahan (Opsional)
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 space-y-4">
           <Select onValueChange={handleClusterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis skrining yang relevan..." />
              </SelectTrigger>
              <SelectContent>
                {clusters.map(cluster => (
                  <SelectItem key={cluster.id} value={cluster.id}>{cluster.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCluster && (
              <div className='space-y-4 border-t pt-4 animate-in fade-in-50'>
                 {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={control}
                      name={`screeningAnswers.${index}.answer`}
                      render={({ field: answerField }) => (
                        <FormItem>
                          <FormLabel>{(fields[index] as any).questionText}</FormLabel>
                           <FormControl>
                              <Input placeholder="Jawaban pasien..." {...answerField} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                 ))}
              </div>
            )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

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

      <AnamnesisScreening />

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
