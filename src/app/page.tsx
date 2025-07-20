import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getPatients } from '@/lib/data';
import type { Patient } from '@/lib/types';

function PatientCard({ patient }: { patient: Patient }) {
  return (
    <Link href={`/patients/${patient.id}`} className="block hover:shadow-lg transition-shadow duration-200 rounded-lg">
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={patient.avatarUrl} alt={patient.name} data-ai-hint="person portrait" />
            <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-lg">{patient.name}</CardTitle>
            <CardDescription>{patient.id}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>DOB:</strong> {patient.dateOfBirth}</p>
            <p><strong>Gender:</strong> <Badge variant="secondary">{patient.gender}</Badge></p>
            <p><strong>Contact:</strong> {patient.contact}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function DashboardPage() {
  const patients = await getPatients();

  return (
    <div className="animate-in fade-in-50">
      <PageHeader title="Patient Dashboard">
        <Button asChild>
          <Link href="/patients/new">
            <PlusCircle />
            Register Patient
          </Link>
        </Button>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {patients.map((patient) => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>
    </div>
  );
}
