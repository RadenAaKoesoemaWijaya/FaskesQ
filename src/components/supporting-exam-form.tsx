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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Upload } from 'lucide-react';
import { Label } from './ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

export function SupportingExamForm() {
  const { control, handleSubmit } = useFormContext();

  function onSubmit(values: any) {
    console.log('Supporting Exam submitted:', values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Accordion type="multiple" className="w-full space-y-4">
            <AccordionItem value="lab" className="border rounded-lg px-4">
                <AccordionTrigger className="text-lg font-medium">Laboratorium</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                    <FormField
                    control={control}
                    name="completeBloodCount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Pemeriksaan Darah Lengkap</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Hb, Leukosit, Trombosit, dll." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={control}
                    name="urinalysis"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Pemeriksaan Urinalisa</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Warna, pH, protein, glukosa, dll." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={control}
                    name="bloodChemistry"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Pemeriksaan Kimia Darah</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Gula darah, kolesterol, fungsi hati, fungsi ginjal, dll." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={control}
                    name="microscopic"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Pemeriksaan Mikroskopis</FormLabel>
                        <FormControl>
                            <Textarea placeholder="BTA, Jamur, dll." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={control}
                    name="immunology"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Rapid Test Imunologi</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Widal, HbsAg, HIV, Dengue, dll." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="radiology" className="border rounded-lg px-4">
                <AccordionTrigger className="text-lg font-medium">Radiologi</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                    <FormField control={control} name="xray" render={({ field }) => (<FormItem><FormLabel>Rontgen (X-Ray)</FormLabel><FormControl><Textarea placeholder="Kesan foto thorax, abdomen, dll." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name="ctScan" render={({ field }) => (<FormItem><FormLabel>CT Scan</FormLabel><FormControl><Textarea placeholder="Kesan CT Scan kepala, thorax, dll." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name="mri" render={({ field }) => (<FormItem><FormLabel>MRI</FormLabel><FormControl><Textarea placeholder="Kesan MRI..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name="ultrasound" render={({ field }) => (<FormItem><FormLabel>USG (Ultrasonografi)</FormLabel><FormControl><Textarea placeholder="Kesan USG abdomen, kandungan, dll." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name="petScan" render={({ field }) => (<FormItem><FormLabel>PET Scan</FormLabel><FormControl><Textarea placeholder="Kesan PET Scan..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="other-exams" className="border rounded-lg px-4">
                <AccordionTrigger className="text-lg font-medium">Pemeriksaan Lainnya</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                    <FormField control={control} name="ekg" render={({ field }) => (<FormItem><FormLabel>EKG (Elektrokardiogram)</FormLabel><FormControl><Textarea placeholder="Irama, HR, aksis, dll." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name="eeg" render={({ field }) => (<FormItem><FormLabel>EEG (Elektroensefalogram)</FormLabel><FormControl><Textarea placeholder="Kesan EEG..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name="emg" render={({ field }) => (<FormItem><FormLabel>EMG (Elektromiogram)</FormLabel><FormControl><Textarea placeholder="Kesan EMG..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        
        <div className="space-y-2">
            <Label>Unggah Berkas Laporan</Label>
            <div className="flex items-center gap-4">
                <FormField
                control={control}
                name="fileUpload"
                render={({ field }) => (
                    <FormItem className="flex-grow">
                    <FormControl>
                        <Input type="file" />
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
  );
}
