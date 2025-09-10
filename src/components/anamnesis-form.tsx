'use client';

import { useForm, FormProvider, useFormContext, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Save, ShieldCheck, Loader2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { getScreeningClusters, getPatientById, saveExamination } from '@/lib/data';
import { useEffect, useState, useTransition } from 'react';
import type { ScreeningCluster, Examination } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';

const anamnesisSchema = z.object({
  main_complaint: z.string().min(1, "Keluhan utama wajib diisi."),
  present_illness_history: z.string().optional(),
  past_medical_history: z.string().optional(),
  drug_allergy: z.string().optional(),
  screening_answers: z.array(z.object({
      question_id: z.string(),
      question_text: z.string(),
      answer: z.string(),
  })).optional(),
});

type AnamnesisFormData = z.infer<typeof anamnesisSchema>;

function AnamnesisScreening() {
  const { control } = useFormContext();
  const [clusters, setClusters] = useState<ScreeningCluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<ScreeningCluster | null>(null);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "screening_answers"
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
    remove(); 
    if (cluster) {
      cluster.questions.forEach(q => {
        append({
          question_id: q.id,
          question_text: q.text,
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
                      name={`screening_answers.${index}.answer`}
                      render={({ field: answerField }) => (
                        <FormItem>
                          <FormLabel>{(fields[index] as any).question_text}</FormLabel>
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

function AnamnesisFormFields() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="main_complaint"
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
        name="present_illness_history"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Riwayat Penyakit Sekarang</FormLabel>
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
        name="past_medical_history"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Riwayat Penyakit Dahulu</FormLabel>
            <FormControl>
              <Textarea placeholder="Contoh: Hipertensi terkontrol, Diabetes Melitus..." rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="drug_allergy"
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

export function PatientAnamnesis({ patientId }: { patientId: string }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [examination, setExamination] = useState<Partial<Examination> | null>(null);

  const form = useForm<AnamnesisFormData>({
    resolver: zodResolver(anamnesisSchema),
    defaultValues: {
      main_complaint: '',
      present_illness_history: '',
      past_medical_history: '',
      drug_allergy: '',
      screening_answers: [],
    },
  });

  useEffect(() => {
    async function fetchLatestAnamnesis() {
      const patient = await getPatientById(patientId);
      const latestExam = patient?.history?.find(h => h.type === 'anamnesis');
      if (latestExam) {
        setExamination(latestExam);
        form.reset({
          main_complaint: latestExam.main_complaint || '',
          present_illness_history: latestExam.present_illness_history || '',
          past_medical_history: latestExam.past_medical_history || '',
          drug_allergy: latestExam.drug_allergy || '',
          screening_answers: [], // Note: screening is handled separately for now
        });
      }
    }
    fetchLatestAnamnesis();
  }, [patientId, form]);

  const onSubmit = (data: AnamnesisFormData) => {
    startTransition(async () => {
      try {
        await saveExamination(patientId, {
          ...examination, // original data
          ...data,       // new data from form
          id: examination?.id, // ensure id is passed for update
          type: 'anamnesis',
        } as Examination);
        toast({
          title: "Sukses",
          description: "Data anamnesis berhasil disimpan.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menyimpan data anamnesis.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="p-6 border rounded-lg bg-card shadow-sm">
            <AnamnesisFormFields />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Simpan Anamnesis</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
