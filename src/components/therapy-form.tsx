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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { Separator } from './ui/separator';

export function TherapyForm() {
  const { control, handleSubmit } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "prescriptions"
  });

  function onSubmit(values: any) {
    console.log('Therapy submitted:', values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
            <h3 className="text-lg font-medium mb-4">Peresepan Obat</h3>
            <div className="space-y-4">
            {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-end p-4 border rounded-lg relative">
                    <FormField
                        control={control}
                        name={`prescriptions.${index}.drugName`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Obat</FormLabel>
                                <FormControl><Input placeholder="Amoxicillin" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={control}
                        name={`prescriptions.${index}.preparation`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sediaan</FormLabel>
                                <FormControl><Input placeholder="500mg Tab" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={control}
                        name={`prescriptions.${index}.dose`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dosis</FormLabel>
                                <FormControl><Input placeholder="3 x 1" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`prescriptions.${index}.quantity`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Jumlah</FormLabel>
                                <FormControl><Input placeholder="15" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            </div>
             <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => append({ drugName: '', preparation: '', dose: '', quantity: '' })}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Obat
            </Button>
        </div>
        
        <Separator />

        <FormField
            control={control}
            name="actions"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Tindakan Medis & Edukasi</FormLabel>
                <FormControl>
                <Textarea
                    placeholder="Contoh: Dilakukan hecting 3 jahitan. Edukasi untuk menjaga luka tetap kering..."
                    rows={4}
                    {...field}
                />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <div className="flex justify-end pt-4 border-t mt-8">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Simpan Terapi & Rangkum
          </Button>
        </div>
      </form>
  );
}
