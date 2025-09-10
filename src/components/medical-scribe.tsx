
'use client';

import { useState, useTransition } from 'react';
import { medicalScribeFlow } from '@/ai/flows/medical-scribe-flow';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { runFlow } from '@genkit-ai/flow';

interface MedicalScribeProps {
  patientId: string; // Tambahkan prop patientId
  initialTranscript?: string;
}

export function MedicalScribe({ patientId, initialTranscript = '' }: MedicalScribeProps) {
  const [transcript, setTranscript] = useState(initialTranscript);
  const [structuredData, setStructuredData] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleProcessTranscript = () => {
    if (!transcript.trim()) {
      toast({ title: 'Error', description: 'Transcript cannot be empty.' });
      return;
    }

    startTransition(async () => {
      try {
        // Panggil flow dengan input yang sesuai dengan schema baru
        const result = await runFlow(medicalScribeFlow, { transcript, patientId });
        
        setStructuredData(result);

        toast({
          title: 'Extraction Successful',
          description: 'Medical data has been structured.',
        });

      } catch (error) {
        console.error('Flow execution error:', error);
        toast({
          title: 'Extraction Failed',
          description: 'Could not process the transcript. Please check the console.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Medical Transcript</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste or type the consultation transcript here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={15}
            className="w-full"
          />
          <Button onClick={handleProcessTranscript} disabled={isPending || !transcript.trim()}>
            {isPending ? 'Processing...' : 'Process Transcript'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Structured Medical Data (EHR Ready)</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending && <p>Extracting information...</p>}
          {structuredData && (
            <pre className="p-4 bg-gray-100 rounded-md overflow-x-auto">
              {JSON.stringify(structuredData, null, 2)}
            </pre>
          )}
          {!isPending && !structuredData && (
            <p className="text-gray-500">Structured data will appear here after processing.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
