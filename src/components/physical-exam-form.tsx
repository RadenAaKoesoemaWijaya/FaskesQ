'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

export function PhysicalExamForm() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium">Tanda-Tanda Vital & Kesadaran</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
              control={control}
              name="consciousness"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Tingkat Kesadaran</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <FormField control={control} name="bloodPressure" render={({ field }) => (
                  <FormItem><FormLabel>Tekanan Darah (mmHg)</FormLabel><FormControl><Input placeholder="120/80" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={control} name="heartRate" render={({ field }) => (
                  <FormItem><FormLabel>Nadi (x/menit)</FormLabel><FormControl><Input placeholder="80" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={control} name="respiratoryRate" render={({ field }) => (
                  <FormItem><FormLabel>Pernapasan (x/menit)</FormLabel><FormControl><Input placeholder="20" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={control} name="temperature" render={({ field }) => (
                  <FormItem><FormLabel>Suhu (°C)</FormLabel><FormControl><Input placeholder="36.5" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={control} name="oxygenSaturation" render={({ field }) => (
                  <FormItem><FormLabel>Saturasi Oksigen (%)</FormLabel><FormControl><Input placeholder="98" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
          </div>
      </div>

      <Accordion type="multiple" className="w-full space-y-4">
        <AccordionItem value="head-neck" className="border rounded-lg px-4">
           <AccordionTrigger className="text-lg font-medium">Kepala & Leher</AccordionTrigger>
           <AccordionContent className="pt-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={control} name="eyes" render={({ field }) => (
                    <FormItem><FormLabel>Mata</FormLabel><FormControl><Textarea placeholder="Konjungtiva anemis (-/-), sklera ikterik (-/-)..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name="nose" render={({ field }) => (
                    <FormItem><FormLabel>Hidung</FormLabel><FormControl><Textarea placeholder="Napas cuping hidung (-), sekret (-)..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name="mouth" render={({ field }) => (
                    <FormItem><FormLabel>Mulut</FormLabel><FormControl><Textarea placeholder="Faring hiperemis (-), tonsil T1-T1..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
             </div>
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="chest" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-medium">Dada (Paru & Jantung)</AccordionTrigger>
          <AccordionContent className="pt-4 space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Paru-paru</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={control} name="lungsInspection" render={({ field }) => (
                  <FormItem><FormLabel>Inspeksi</FormLabel><FormControl><Textarea placeholder="Simetris saat statis dan dinamis..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={control} name="lungsPalpation" render={({ field }) => (
                  <FormItem><FormLabel>Palpasi</FormLabel><FormControl><Textarea placeholder="Stem fremitus kanan sama dengan kiri..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={control} name="lungsPercussion" render={({ field }) => (
                  <FormItem><FormLabel>Perkusi</FormLabel><FormControl><Textarea placeholder="Sonor di kedua lapang paru..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={control} name="lungsAuscultation" render={({ field }) => (
                  <FormItem><FormLabel>Auskultasi</FormLabel><FormControl><Textarea placeholder="Vesikuler (+/+), rhonki (-/-), wheezing (-/-)..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>
             <div>
              <h4 className="font-semibold mb-2">Jantung</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={control} name="heartInspection" render={({ field }) => (
                  <FormItem><FormLabel>Inspeksi</FormLabel><FormControl><Textarea placeholder="Ictus cordis tidak terlihat..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={control} name="heartPalpation" render={({ field }) => (
                  <FormItem><FormLabel>Palpasi</FormLabel><FormControl><Textarea placeholder="Ictus cordis teraba di ICS V..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={control} name="heartPercussion" render={({ field }) => (
                  <FormItem><FormLabel>Perkusi</FormLabel><FormControl><Textarea placeholder="Batas jantung dalam batas normal..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={control} name="heartAuscultation" render={({ field }) => (
                  <FormItem><FormLabel>Auskultasi</FormLabel><FormControl><Textarea placeholder="Bunyi jantung I-II reguler, murmur (-), gallop (-)..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="abdomen" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-medium">Abdomen (Perut)</AccordionTrigger>
            <AccordionContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={control} name="abdomenInspection" render={({ field }) => (
                    <FormItem><FormLabel>Inspeksi</FormLabel><FormControl><Textarea placeholder="Datar, tidak ada benjolan..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name="abdomenAuscultation" render={({ field }) => (
                    <FormItem><FormLabel>Auskultasi</FormLabel><FormControl><Textarea placeholder="Bising usus (+) normal..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name="abdomenPercussion" render={({ field }) => (
                    <FormItem><FormLabel>Perkusi</FormLabel><FormControl><Textarea placeholder="Timpani di seluruh lapang abdomen..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name="abdomenPalpation" render={({ field }) => (
                    <FormItem><FormLabel>Palpasi</FormLabel><FormControl><Textarea placeholder="Lemas, tidak ada nyeri tekan, hepar/lien tidak teraba..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="extremities" className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-medium">Ekstremitas & Neurologis</AccordionTrigger>
            <AccordionContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={control} name="extremities" render={({ field }) => (
                        <FormItem><FormLabel>Ekstremitas</FormLabel><FormControl><Textarea placeholder="Akral hangat, CRT < 2 detik, edema (-/-), tidak ada deformitas..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name="neurological" render={({ field }) => (
                        <FormItem><FormLabel>Pemeriksaan Neurologis</FormLabel><FormControl><Textarea placeholder="GCS 15 (E4V5M6), kekuatan motorik 5/5/5/5, refleks fisiologis normal..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
