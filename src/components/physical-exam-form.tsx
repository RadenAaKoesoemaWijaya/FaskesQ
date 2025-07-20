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
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </div>
      </div>

      <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium">Pemeriksaan Organ</h3>
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
              <FormField control={control} name="chest" render={({ field }) => (
                  <FormItem><FormLabel>Dada (Inspeksi & Palpasi)</FormLabel><FormControl><Textarea placeholder="Bentuk normochest, pergerakan simetris..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={control} name="lungs" render={({ field }) => (
                  <FormItem><FormLabel>Paru-paru (Perkusi & Auskultasi)</FormLabel><FormControl><Textarea placeholder="Sonor di kedua lapang paru, vesikuler (+/+), rhonki (-/-)..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={control} name="heart" render={({ field }) => (
                  <FormItem><FormLabel>Jantung</FormLabel><FormControl><Textarea placeholder="Batas jantung normal, BJ I-II reguler, murmur (-), gallop (-)..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={control} name="abdomen" render={({ field }) => (
                  <FormItem><FormLabel>Perut</FormLabel><FormControl><Textarea placeholder="Datar, lemas, nyeri tekan (-), bising usus (+) normal..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={control} name="extremities" render={({ field }) => (
                  <FormItem><FormLabel>Ekstremitas</FormLabel><FormControl><Textarea placeholder="Akral hangat, CRT < 2 detik, edema (-/-)..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
          </div>
      </div>
    </div>
  );
}
