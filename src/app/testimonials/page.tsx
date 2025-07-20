'use client'

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTestimonials } from "@/lib/data";
import { Testimonial } from "@/lib/types";
import { Star, StarHalf, MessageSquareQuote } from "lucide-react";
import { useEffect, useState } from "react";

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

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
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
            </CardContent>
        </Card>
    )
}


export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

    useEffect(() => {
        async function loadTestimonials() {
            const data = await getTestimonials();
            setTestimonials(data);
        }
        loadTestimonials();
    }, []);

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
