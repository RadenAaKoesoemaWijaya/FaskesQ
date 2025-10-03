
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

export function PhysicalExamForm() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium">Tanda-Tanda Vital & Kesadaran</h3>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               <FormField
                    control={control}
                    name="consciousness"
                    render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-5">
                            <FormLabel>Tingkat Kesadaran</FormLabel>
                            <FormControl><Input placeholder="Contoh: Compos Mentis, GCS 15" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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

       <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Pemeriksaan Kepala & Leher</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
       </div>

       <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Pemeriksaan Dada (Jantung & Paru)</h3>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold mb-2">Jantung</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField control={control} name="heartInspection" render={({ field }) => (
                        <FormItem><FormLabel>Inspeksi</FormLabel><FormControl><Textarea placeholder="Ictus cordis tidak terlihat..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="heartPalpation" render={({ field }) => (
                        <FormItem><FormLabel>Palpasi</FormLabel><FormControl><Textarea placeholder="Ictus cordis teraba..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="heartPercussion" render={({ field }) => (
                        <FormItem><FormLabel>Perkusi</FormLabel><FormControl><Textarea placeholder="Batas jantung normal..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="heartAuscultation" render={({ field }) => (
                        <FormItem><FormLabel>Auskultasi</FormLabel><FormControl><Textarea placeholder="BJ I-II reguler, murmur (-)..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2">Paru-paru</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField control={control} name="lungsInspection" render={({ field }) => (
                        <FormItem><FormLabel>Inspeksi</FormLabel><FormControl><Textarea placeholder="Simetris statis dinamis..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="lungsPalpation" render={({ field }) => (
                        <FormItem><FormLabel>Palpasi</FormLabel><FormControl><Textarea placeholder="Stem fremitus normal..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="lungsPercussion" render={({ field }) => (
                        <FormItem><FormLabel>Perkusi</FormLabel><FormControl><Textarea placeholder="Sonor kedua lapang..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="lungsAuscultation" render={({ field }) => (
                        <FormItem><FormLabel>Auskultasi</FormLabel><FormControl><Textarea placeholder="Vesikuler, rhonki (-), wheezing (-)..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>
            </div>
       </div>
       
       <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Pemeriksaan Abdomen</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField control={control} name="abdomenInspection" render={({ field }) => (
                <FormItem><FormLabel>Inspeksi</FormLabel><FormControl><Textarea placeholder="Datar, tidak ada benjolan..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name="abdomenAuscultation" render={({ field }) => (
                <FormItem><FormLabel>Auskultasi</FormLabel><FormControl><Textarea placeholder="Bising usus (+) normal..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name="abdomenPercussion" render={({ field }) => (
                <FormItem><FormLabel>Perkusi</FormLabel><FormControl><Textarea placeholder="Timpani..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name="abdomenPalpation" render={({ field }) => (
                <FormItem><FormLabel>Palpasi</FormLabel><FormControl><Textarea placeholder="Lemas, tidak ada nyeri tekan..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
       </div>

       <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Pemeriksaan Ekstremitas & Neurologis</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={control} name="extremities" render={({ field }) => (
                    <FormItem><FormLabel>Ekstremitas</FormLabel><FormControl><Textarea placeholder="Akral hangat, CRT < 2 detik, edema (-/-)..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name="neurological" render={({ field }) => (
                    <FormItem><FormLabel>Pemeriksaan Neurologis</FormLabel><FormControl><Textarea placeholder="Kekuatan motorik 5/5/5/5, refleks fisiologis normal..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
       </div>
    </div>
  );
}
