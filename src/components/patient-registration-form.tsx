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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { addPatient } from '@/lib/data';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Nama harus terdiri dari minimal 2 karakter.',
  }),
  nik: z.string().length(16, {
    message: 'NIK harus terdiri dari 16 digit.',
  }),
  medicalRecordNumber: z.string().min(1, {
    message: 'Nomor rekam medis wajib diisi.',
  }),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Silakan masukkan tanggal yang valid dalam format YYYY-MM-DD.',
  }),
  gender: z.enum(['Pria', 'Wanita', 'Lainnya']),
  contact: z.string().email({
    message: 'Silakan masukkan alamat email yang valid.',
  }),
  address: z.string().min(5, {
    message: 'Alamat harus terdiri dari minimal 5 karakter.',
  }),
  paymentMethod: z.enum(['Tunai', 'Asuransi', 'BPJS']),
  insuranceNumber: z.string().optional(),
});

export function PatientRegistrationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      nik: '',
      medicalRecordNumber: '',
      dateOfBirth: '',
      contact: '',
      address: '',
      insuranceNumber: '',
    },
  });

  const paymentMethod = form.watch('paymentMethod');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // In a real app, you would handle the form submission to your backend here.
      // For this demo, we simulate it and get the new patient ID.
      const newPatientId = await addPatient(values);

      toast({
        title: 'Pasien Terdaftar',
        description: `${values.name} telah berhasil terdaftar. Mengalihkan ke halaman rekam medis...`,
      });
      
      // Redirect to the new patient's detail page
      router.push(`/patients/${newPatientId}`);

    } catch (error) {
      console.error("Failed to register patient:", error);
      toast({
        title: 'Pendaftaran Gagal',
        description: 'Terjadi kesalahan saat mendaftarkan pasien. Silakan coba lagi.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="nik"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Induk Kependudukan (NIK)</FormLabel>
                <FormControl>
                  <Input placeholder="16 digit NIK" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="medicalRecordNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Rekam Medis</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: MR005" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Lahir</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Kelamin</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Pria">Pria</SelectItem>
                    <SelectItem value="Wanita">Wanita</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Kontak</FormLabel>
                <FormControl>
                  <Input placeholder="pasien@contoh.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metode Pembayaran</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih metode pembayaran" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Tunai">Tunai</SelectItem>
                    <SelectItem value="Asuransi">Asuransi</SelectItem>
                    <SelectItem value="BPJS">BPJS</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {(paymentMethod === 'Asuransi' || paymentMethod === 'BPJS') && (
            <FormField
              control={form.control}
              name="insuranceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Asuransi/BPJS</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nomor kartu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Alamat</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Jl. Sehat 123, Kota Bugar"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Pasien'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
