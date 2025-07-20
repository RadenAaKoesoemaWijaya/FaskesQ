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
      <PageHeader title="Submit a Testimonial" />
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareHeart />
            Share Your Experience
          </CardTitle>
          <CardDescription>
            Your feedback helps us improve our services. Please share your
            thoughts about the care you received.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestimonialForm />
        </CardContent>
      </Card>
    </div>
  );
}
