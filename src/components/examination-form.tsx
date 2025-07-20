'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getTreatmentSuggestions } from '@/app/actions';
import type { Patient } from '@/lib/types';
import type { SuggestTreatmentOptionsOutput } from '@/ai/flows/suggest-treatment';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from './ui/badge';
import { Sparkles, LoaderCircle, Lightbulb } from 'lucide-react';

const formSchema = z.object({
  examinationFindings: z.string().min(10, {
    message: 'Examination findings must be at least 10 characters.',
  }),
  patientHistory: z.string().min(10, {
    message: 'Patient history must be at least 10 characters.',
  }),
});

export function ExaminationForm({ patient }: { patient: Patient }) {
  const { toast } = useToast();
  const [suggestions, setSuggestions] =
    useState<SuggestTreatmentOptionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAge = (dateString: string) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examinationFindings: '',
      patientHistory: '',
    },
  });

  async function onGetSuggestions(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestions(null);

    const result = await getTreatmentSuggestions({
      ...values,
      patientAge: getAge(patient.dateOfBirth),
      patientGender: patient.gender,
    });

    if (result.success && result.data) {
      setSuggestions(result.data);
      toast({
        title: 'AI Suggestions Ready',
        description: 'Review the generated treatment options below.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
    setIsLoading(false);
  }

  function onSaveRecord(values: z.infer<typeof formSchema>) {
    console.log('Saving record:', values);
    toast({
      title: 'Record Saved',
      description: `Examination record for ${patient.name} has been saved.`,
    });
    // Here you would typically save the full record to your database
    form.reset();
    setSuggestions(null);
  }

  const getEvidenceBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'default';
      case 'moderate':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSaveRecord)}
        className="space-y-8"
      >
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="examinationFindings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Examination Findings</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the patient's symptoms, vital signs, and physical examination results..."
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="patientHistory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relevant Patient History</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Include relevant medical history, allergies, and current medications..."
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This information will be used by the AI to suggest treatments.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-between items-center gap-4">
          <Button
            type="button"
            onClick={form.handleSubmit(onGetSuggestions)}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Get AI Suggestions
          </Button>
          <Button type="submit">Save Record</Button>
        </div>
      </form>

      {suggestions && (
        <div className="mt-8 space-y-6 animate-in fade-in-50">
          <h3 className="text-xl font-headline font-semibold flex items-center gap-2">
            <Lightbulb className="text-primary" /> AI-Generated Treatment Suggestions
          </h3>
          <Accordion type="single" collapsible className="w-full">
            {suggestions.treatmentSuggestions.map((suggestion, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-semibold text-primary">{suggestion.treatmentName}</span>
                    <Badge variant={getEvidenceBadgeVariant(suggestion.evidenceLevel)}>
                      {suggestion.evidenceLevel} Evidence
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">Description</h4>
                    <p className="text-muted-foreground">{suggestion.description}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Risks</h4>
                    <p className="text-muted-foreground">{suggestion.risks}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Alert>
            <AlertTitle>Additional Recommendations</AlertTitle>
            <AlertDescription>
              {suggestions.additionalRecommendations}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Form>
  );
}
