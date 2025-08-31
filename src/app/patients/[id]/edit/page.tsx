'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { getPatientById } from '@/lib/data';
import type { Patient } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { PatientRegistrationForm } from '@/components/patient-registration-form';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function EditPatientPageContent() {
    const { id } = useParams();
    const router = useRouter();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof id !== 'string') {
            return;
        }
        async function loadPatient() {
            setLoading(true);
            const fetchedPatient = await getPatientById(id);
            if (fetchedPatient) {
                setPatient(fetchedPatient);
            } else {
                notFound();
            }
            setLoading(false);
        }
        loadPatient();
    }, [id]);

    if (loading) {
        return (
            <div>
                <PageHeader title="Edit Pasien" />
                <Card>
                    <CardContent className="pt-6 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-24 w-full" />
                         <div className="flex justify-end">
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!patient) {
        return notFound();
    }

    return (
         <div className="animate-in fade-in-50">
            <PageHeader title="Edit Pasien" subtitle={`Mengubah data untuk ${patient.name}`} />
            <Card>
                <CardContent className="pt-6">
                    <PatientRegistrationForm mode="edit" patient={patient} />
                </CardContent>
            </Card>
        </div>
    )
}


export default function EditPatientPage() {
    return <EditPatientPageContent />;
}
