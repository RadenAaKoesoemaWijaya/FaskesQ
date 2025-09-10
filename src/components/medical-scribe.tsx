'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Bot, Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from './ui/textarea';
import { runMedicalScribe, type MedicalScribeOutput } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface MedicalScribeProps {
  onScribeComplete: (data: MedicalScribeOutput) => void;
}

/**
 * A client-side component that provides a user interface for recording audio,
 * transcribing it using the Web Speech API, and sending it to an AI
 * for processing into a structured medical record.
 */
export function MedicalScribe({ onScribeComplete }: MedicalScribeProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to hold the SpeechRecognition instance
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support for the Web Speech API
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser. Please use Google Chrome.');
      return;
    }

    // Initialize the SpeechRecognition instance
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = true; // Keep listening even after a pause
    recognition.interimResults = true; // Get results as the user speaks
    recognition.lang = 'id-ID'; // Set language to Indonesian

    // Event handler for when speech is recognized
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + '. ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // Update transcript with final results
      setTranscript(prev => prev + finalTranscript);
    };

    // Event handler for recognition errors
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      toast({
        variant: "destructive",
        title: "Voice Recognition Error",
        description: `An error occurred: ${event.error}. Please ensure microphone permission is granted.`,
      });
      setIsRecording(false);
    };

    // Cleanup function to stop recognition when the component unmounts
    return () => {
      recognitionRef.current?.stop();
    };
  }, [toast]);

  // Toggles the recording state
  const handleToggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  // Resets the transcript and stops recording
  const handleReset = () => {
    setTranscript('');
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
  };

  // Processes the transcript with the AI scribe
  const handleProcessTranscript = async () => {
    if (!transcript.trim()) {
      toast({
        title: "Transcript is Empty",
        description: "There is no transcript to process.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const result = await runMedicalScribe({ transcript });
    setIsProcessing(false);

    if (result.success && result.data) {
      toast({
        title: "Processing Successful",
        description: "The form has been filled based on the transcript.",
      });
      onScribeComplete(result.data);
    } else {
      toast({
        title: "Processing Failed",
        description: result.error || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  // Render error alert if feature is not available
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Feature Not Available</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="bg-secondary/50 mb-6">
      <CardHeader className='pb-4'>
        <CardTitle className="flex items-center gap-2">
          <Bot className="text-primary" />
          AI Medical Scribe
        </CardTitle>
        <CardDescription>
          Record your conversation with the patient, and let the AI fill in the relevant fields automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button onClick={handleToggleRecording} size="lg" className="w-full sm:w-auto">
              {isRecording ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
              {isRecording ? 'Stop Recording' : transcript ? 'Resume Recording' : 'Start Recording'}
            </Button>
            <Button onClick={handleReset} size="lg" variant="outline" className="w-full sm:w-auto">
              <RotateCcw className="mr-2" />
              Reset
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1">
              {isRecording && <Loader2 className="animate-spin h-4 w-4" />}
              <span>{isRecording ? 'Listening...' : 'Click the button to start voice transcription.'}</span>
            </div>
          </div>

          <Textarea
            placeholder="The conversation transcript will appear here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={6}
            readOnly={isRecording} // Make textarea readonly while recording
          />

          <Button onClick={handleProcessTranscript} disabled={isProcessing || !transcript.trim()}>
            {isProcessing ? (
              <><Loader2 className="mr-2 animate-spin" /> Processing...</>
            ) : (
              'Process Transcript with AI'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
