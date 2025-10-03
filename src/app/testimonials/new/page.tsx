import { PageHeader } from '@/components/page-header';
import { TestimonialForm } from '@/components/testimonial-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MessageSquareHeart } from 'lucide-react';

export default function NewTestimonialPage() {
  return (
    <div className="animate-in fade-in-50">
      <PageHeader title="Kirim Testimoni" />
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareHeart />
            Bagikan Pengalaman Anda
          </CardTitle>
          <CardDescription>
            Umpan balik Anda membantu kami meningkatkan layanan kami. Silakan bagikan
            pemikiran Anda tentang perawatan yang Anda terima.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestimonialForm />
        </CardContent>
      </Card>
    </div>
  );
}
