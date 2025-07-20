import Link from 'next/link';
import { PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getPatients } from '@/lib/data';
import type { Patient } from '@/lib/types';
import { Input } from '@/components/ui/input';

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
            <CardDescription>{patient.medicalRecordNumber}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Tgl Lahir:</strong> {patient.dateOfBirth}</p>
            <p><strong>Jenis Kelamin:</strong> <Badge variant="secondary">{patient.gender}</Badge></p>
            <p><strong>Kontak:</strong> {patient.contact}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function SearchBar() {
  // This component would need to be a client component to handle state
  // For now, it's a server component and the search is handled by page query params
  return (
    <form className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        name="q"
        placeholder="Cari pasien (Nama, ID, No. RM)..."
        className="w-full bg-background pl-8"
      />
    </form>
  )
}

export default async function DashboardPage({ searchParams }: { searchParams?: { q?: string } }) {
  const query = searchParams?.q || '';
  const patients = await getPatients(query);

  return (
    <div className="animate-in fade-in-50">
      <PageHeader title="Dasbor Pasien">
        <div className="flex items-center gap-4">
          <SearchBar />
          <Button asChild>
            <Link href="/patients/new">
              <PlusCircle />
              Daftarkan Pasien
            </Link>
          </Button>
        </div>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {patients.map((patient) => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
        {patients.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center">
            Tidak ada pasien yang cocok dengan pencarian Anda.
          </p>
        )}
      </div>
    </div>
  );
}
