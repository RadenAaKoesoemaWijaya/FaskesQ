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
import { Save, Search } from 'lucide-react';

const formSchema = z.object({
  primaryDiagnosis: z.string().min(1, 'Diagnosis primer harus diisi.'),
  secondaryDiagnosis: z.string().optional(),
});

export function DiagnosisForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      primaryDiagnosis: '',
      secondaryDiagnosis: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Diagnosis submitted:', values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="primaryDiagnosis"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Diagnosis Primer (ICD-10)</FormLabel>
                <div className="flex gap-2">
                    <FormControl>
                    <Input placeholder="Contoh: J00 - Common cold" {...field} />
                    </FormControl>
                    <Button type="button" variant="outline" size="icon">
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="secondaryDiagnosis"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Diagnosis Sekunder (ICD-10)</FormLabel>
                 <div className="flex gap-2">
                    <FormControl>
                    <Input placeholder="Contoh: E11.9 - Diabetes mellitus" {...field} />
                    </FormControl>
                     <Button type="button" variant="outline" size="icon">
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Simpan Diagnosis
          </Button>
        </div>
      </form>
    </Form>
  );
}
