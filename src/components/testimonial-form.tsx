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
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { addTestimonial } from '@/lib/data';
import { useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  patientName: z.string().min(2, {
    message: 'Nama harus minimal 2 karakter.',
  }),
  feedback: z.string().min(10, {
    message: 'Umpan balik harus minimal 10 karakter.',
  }),
  rating: z.number().min(1, 'Rating harus dipilih.').max(5),
});

export function TestimonialForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      feedback: '',
      rating: 0,
    },
  });

  const currentRating = form.watch('rating');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await addTestimonial(values);
      toast({
        title: 'Umpan Balik Terkirim',
        description: 'Terima kasih atas testimoni Anda!',
      });
      router.push('/testimonials');
      router.refresh();
    } catch (error) {
      console.error("Failed to submit testimonial:", error);
      toast({
        title: 'Gagal Mengirim',
        description: 'Terjadi kesalahan saat mengirim testimoni. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="patientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Anda</FormLabel>
              <FormControl>
                <Input placeholder="Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Umpan Balik Anda</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ceritakan tentang pengalaman Anda..."
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Rating Kepuasan</FormLabel>
                    <FormControl>
                       <div className="flex items-center gap-1" onMouseLeave={() => setHoveredRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={cn(
                                        "h-8 w-8 cursor-pointer transition-colors",
                                        (hoveredRating >= star || currentRating >= star) 
                                            ? "text-yellow-400 fill-yellow-400" 
                                            : "text-gray-300"
                                    )}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onClick={() => form.setValue('rating', star)}
                                />
                            ))}
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Mengirim...' : 'Kirim Umpan Balik'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
