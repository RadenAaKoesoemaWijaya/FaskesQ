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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';

const formSchema = z.object({
    consciousness: z.string().min(1, "Tingkat kesadaran harus dipilih"),
    bloodPressure: z.string().min(1, "Tekanan darah harus diisi"),
    heartRate: z.string().min(1, "Nadi harus diisi"),
    respiratoryRate: z.string().min(1, "Laju pernapasan harus diisi"),
    temperature: z.string().min(1, "Suhu harus diisi"),
    eyes: z.string().optional(),
    nose: z.string().optional(),
    mouth: z.string().optional(),
    chest: z.string().optional(),
    lungs: z.string().optional(),
    heart: z.string().optional(),
    abdomen: z.string().optional(),
    extremities: z.string().optional(),
});

export function PhysicalExamForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        consciousness: '',
        bloodPressure: '',
        heartRate: '',
        respiratoryRate: '',
        temperature: '',
        eyes: '',
        nose: '',
        mouth: '',
        chest: '',
        lungs: '',
        heart: '',
        abdomen: '',
        extremities: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Physical Exam submitted:', values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Tanda-Tanda Vital & Kesadaran</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                control={form.control}
                name="consciousness"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tingkat Kesadaran</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih tingkat kesadaran" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Compos Mentis">Compos Mentis</SelectItem>
                            <SelectItem value="Apatis">Apatis</SelectItem>
                            <SelectItem value="Somnolen">Somnolen</SelectItem>
                            <SelectItem value="Sopor">Sopor</SelectItem>
                            <SelectItem value="Coma">Coma</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField control={form.control} name="bloodPressure" render={({ field }) => (
                    <FormItem><FormLabel>Tekanan Darah (mmHg)</FormLabel><FormControl><Input placeholder="120/80" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="heartRate" render={({ field }) => (
                    <FormItem><FormLabel>Nadi (x/menit)</FormLabel><FormControl><Input placeholder="80" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="respiratoryRate" render={({ field }) => (
                    <FormItem><FormLabel>Pernapasan (x/menit)</FormLabel><FormControl><Input placeholder="20" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="temperature" render={({ field }) => (
                    <FormItem><FormLabel>Suhu (°C)</FormLabel><FormControl><Input placeholder="36.5" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
        </div>

        <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Pemeriksaan Organ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="eyes" render={({ field }) => (
                    <FormItem><FormLabel>Mata</FormLabel><FormControl><Textarea placeholder="Konjungtiva anemis (-/-), sklera ikterik (-/-)..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="nose" render={({ field }) => (
                    <FormItem><FormLabel>Hidung</FormLabel><FormControl><Textarea placeholder="Napas cuping hidung (-), sekret (-)..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="mouth" render={({ field }) => (
                    <FormItem><FormLabel>Mulut</FormLabel><FormControl><Textarea placeholder="Faring hiperemis (-), tonsil T1-T1..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="chest" render={({ field }) => (
                    <FormItem><FormLabel>Dada (Inspeksi & Palpasi)</FormLabel><FormControl><Textarea placeholder="Bentuk normochest, pergerakan simetris..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="lungs" render={({ field }) => (
                    <FormItem><FormLabel>Paru-paru (Perkusi & Auskultasi)</FormLabel><FormControl><Textarea placeholder="Sonor di kedua lapang paru, vesikuler (+/+), rhonki (-/-)..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="heart" render={({ field }) => (
                    <FormItem><FormLabel>Jantung</FormLabel><FormControl><Textarea placeholder="Batas jantung normal, BJ I-II reguler, murmur (-), gallop (-)..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="abdomen" render={({ field }) => (
                    <FormItem><FormLabel>Perut</FormLabel><FormControl><Textarea placeholder="Datar, lemas, nyeri tekan (-), bising usus (+) normal..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="extremities" render={({ field }) => (
                    <FormItem><FormLabel>Ekstremitas</FormLabel><FormControl><Textarea placeholder="Akral hangat, CRT < 2 detik, edema (-/-)..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
        </div>
        
         <div className="flex justify-end pt-4">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Simpan Pemeriksaan Fisik
          </Button>
        </div>
      </form>
    </Form>
  );
}
