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
import { Save, Upload } from 'lucide-react';
import { Label } from './ui/label';

const formSchema = z.object({
  labResults: z.string().optional(),
  radiologyResults: z.string().optional(),
  otherResults: z.string().optional(),
  fileUpload: z.any().optional(),
});

export function SupportingExamForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      labResults: '',
      radiologyResults: '',
      otherResults: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Supporting Exam submitted:', values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="labResults"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hasil Laboratorium</FormLabel>
              <FormControl>
                <Textarea placeholder="Contoh: Hemoglobin 12.5 g/dL, Leukosit 8.000/uL..." rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="radiologyResults"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hasil Radiologi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Contoh: Foto Thorax: Cor dan pulmo dalam batas normal..."
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
          name="otherResults"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pemeriksaan Lainnya (EKG, dll)</FormLabel>
              <FormControl>
                <Textarea placeholder="Hasil pemeriksaan penunjang lainnya..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
            <Label>Unggah Berkas Laporan</Label>
            <div className="flex items-center gap-4">
                <FormField
                control={form.control}
                name="fileUpload"
                render={({ field }) => (
                    <FormItem className="flex-grow">
                    <FormControl>
                        <Input type="file" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="button" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Unggah
                </Button>
            </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Simpan Pemeriksaan Penunjang
          </Button>
        </div>
      </form>
    </Form>
  );
}
