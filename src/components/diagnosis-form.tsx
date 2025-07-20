'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Save, Search, Share2 } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';

export function DiagnosisForm() {
  const { control, handleSubmit, watch } = useFormContext();
  const isReferred = watch('referral.isReferred');

  function onSubmit(values: any) {
    console.log('Diagnosis submitted:', values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Penegakan Diagnosis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={control}
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
            control={control}
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
      </div>
      
      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-4">Prognosis & Edukasi</h3>
        <div className="space-y-6">
            <FormField
                control={control}
                name="prognosis"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Prognosis</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Jelaskan prognosis penyakit (cth: ad bonam, ad malam, dll.) beserta alasannya..." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={control}
                name="patientEducation"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Edukasi Pasien</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Jelaskan mengenai penyakit, rencana pengobatan, dan hal-hal yang perlu diperhatikan oleh pasien..." rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
      </div>

       <Separator />

       <div>
        <h3 className="text-lg font-medium mb-2">Rujukan</h3>
        <div className="space-y-6 p-4 border rounded-lg">
             <FormField
                control={control}
                name="referral.isReferred"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                            <FormLabel>Rujuk Pasien</FormLabel>
                            <p className="text-sm text-muted-foreground">Aktifkan jika pasien perlu dirujuk ke fasilitas kesehatan lain.</p>
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
            {isReferred && (
                <div className="space-y-6 animate-in fade-in-50">
                     <FormField
                        control={control}
                        name="referral.facility"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fasilitas Kesehatan Tujuan</FormLabel>
                                <FormControl>
                                    <Input placeholder="Contoh: RSUPN Dr. Cipto Mangunkusumo" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={control}
                        name="referral.reason"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Alasan Rujukan</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Contoh: Memerlukan pemeriksaan dan penanganan oleh dokter spesialis..." rows={3} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          Simpan Diagnosis
        </Button>
      </div>
    </form>
  );
}
