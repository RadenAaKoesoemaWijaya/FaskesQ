'use client'

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getTestimonials } from "@/lib/data";
import { Testimonial } from "@/lib/types";
import { Star, StarHalf, MessageSquareQuote, Bot, Loader2, ThumbsUp, ThumbsDown, Meh } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { runAnalyzeTestimonialSentiment } from "@/app/actions";
import type { AnalyzeTestimonialSentimentOutput } from "@/ai/flows/analyze-testimonial-sentiment";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function Rating({ rating }: { rating: number }) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="flex items-center text-yellow-500">
            {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="w-5 h-5 fill-current" />)}
            {halfStar && <StarHalf className="w-5 h-5 fill-current" />}
            {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="w-5 h-5" />)}
        </div>
    )
}

function SentimentDisplay({ sentiment }: { sentiment: AnalyzeTestimonialSentimentOutput['sentiment'] }) {
    const sentimentConfig = {
        Positif: { icon: ThumbsUp, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Positif' },
        Negatif: { icon: ThumbsDown, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Negatif' },
        Netral: { icon: Meh, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Netral' },
    };

    const config = sentimentConfig[sentiment];
    const Icon = config.icon;

    return (
        <Badge variant="outline" className={cn("gap-1.5 pl-1.5", config.bg, config.color)}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
        </Badge>
    );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
    const { toast } = useToast();
    const [analysis, setAnalysis] = useState<AnalyzeTestimonialSentimentOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        setIsLoading(true);
        const result = await runAnalyzeTestimonialSentiment({ testimonialText: testimonial.feedback });
        if (result.success && result.data) {
            setAnalysis(result.data);
        } else {
            toast({
                title: "Analisis Gagal",
                description: result.error,
                variant: 'destructive',
            });
        }
        setIsLoading(false);
    }


    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{testimonial.patientName}</CardTitle>
                        <CardDescription>{new Date(testimonial.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                    </div>
                    <Rating rating={testimonial.rating} />
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                 <p className="italic text-muted-foreground">"{testimonial.feedback}"</p>
                 {analysis && (
                    <Alert className={cn("mt-4 animate-in fade-in-50",
                        analysis.sentiment === 'Positif' && 'border-green-500/50',
                        analysis.sentiment === 'Negatif' && 'border-red-500/50',
                        analysis.sentiment === 'Netral' && 'border-yellow-500/50'
                    )}>
                        <div className="flex items-start gap-2">
                             <SentimentDisplay sentiment={analysis.sentiment} />
                        </div>
                        <AlertDescription className="mt-2 text-foreground">
                           <strong>Ringkasan AI:</strong> {analysis.summary}
                        </AlertDescription>
                    </Alert>
                 )}
            </CardContent>
            <CardFooter>
                 <Button onClick={handleAnalyze} disabled={isLoading} variant="outline" size="sm" className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                    {isLoading ? 'Menganalisis...' : 'Analisis Sentimen'}
                </Button>
            </CardFooter>
        </Card>
    )
}


export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        async function loadTestimonials() {
            try {
                const data = await getTestimonials();
                setTestimonials(data);
            } catch (error) {
                toast({
                    title: "Gagal Memuat Testimoni",
                    description: (error as Error).message,
                    variant: 'destructive',
                });
            }
        }
        loadTestimonials();
    }, [toast]);

    return (
        <div className="animate-in fade-in-50">
            <PageHeader title="Testimoni & Umpan Balik Pasien">
                <p className="text-muted-foreground max-w-2xl">
                    Berikut adalah kumpulan umpan balik yang telah diberikan oleh pasien kami. Kami menghargai setiap masukan untuk terus meningkatkan kualitas layanan.
                </p>
            </PageHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.length > 0 ? (
                    testimonials.map(testimonial => (
                        <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-10">
                        <MessageSquareQuote className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">Belum Ada Testimoni</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Minta umpan balik dari pasien setelah pemeriksaan untuk melihat hasilnya di sini.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
