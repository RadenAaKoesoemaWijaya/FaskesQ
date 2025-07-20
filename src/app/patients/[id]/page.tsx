import { notFound } from 'next/navigation';
import { getPatientById } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExaminationForm } from '@/components/examination-form';
import type { Patient } from '@/lib/types';
import { FileText, Stethoscope, User } from 'lucide-react';

function PatientProfile({ patient }: { patient: Patient }) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Demografis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Nama Lengkap</p>
            <p>{patient.name}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">ID Pasien</p>
            <p>{patient.id}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Tanggal Lahir</p>
            <p>
              {patient.dateOfBirth} ({getAge(patient.dateOfBirth)} tahun)
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Jenis Kelamin</p>
            <p>
              <Badge variant="secondary">{patient.gender}</Badge>
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Kontak</p>
            <p>{patient.contact}</p>
          </div>
          <div className="md:col-span-2">
            <p className="font-medium text-muted-foreground">Alamat</p>
            <p>{patient.address}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function PatientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const patient = await getPatientById(params.id);

  if (!patient) {
    notFound();
  }

  return (
    <div className="animate-in fade-in-50">
      <PageHeader title={patient.name}>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={patient.avatarUrl} alt={patient.name} data-ai-hint="person face" />
            <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </PageHeader>
      <Tabs defaultValue="examination" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" /> Profil
          </TabsTrigger>
          <TabsTrigger value="examination">
            <Stethoscope className="mr-2 h-4 w-4" /> Pemeriksaan Baru
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <PatientProfile patient={patient} />
        </TabsContent>
        <TabsContent value="examination" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText /> Pemeriksaan & Perawatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExaminationForm patient={patient} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
