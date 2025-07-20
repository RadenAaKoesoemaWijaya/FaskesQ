import { notFound } from 'next/navigation';
import { getPatientById } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExaminationForm } from '@/components/examination-form';
import type { Patient } from '@/lib/types';
import { FileText, Stethoscope, User, History } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
            <p className="font-medium text-muted-foreground">No. Rekam Medis</p>
            <p>{patient.medicalRecordNumber}</p>
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
           <div>
            <p className="font-medium text-muted-foreground">Metode Pembayaran</p>
            <p>{patient.paymentMethod} {patient.insuranceNumber && `(${patient.insuranceNumber})`}</p>
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

function MedicalHistory({ patient }: { patient: Patient }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Riwayat Pemeriksaan</CardTitle>
                <CardDescription>Daftar semua pemeriksaan yang telah dilakukan untuk pasien ini.</CardDescription>
            </CardHeader>
            <CardContent>
                {patient.history && patient.history.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Diagnosis</TableHead>
                                <TableHead className="hidden md:table-cell">Anamnesis</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patient.history.map(record => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">{record.date}</TableCell>
                                    <TableCell>{record.diagnosis}</TableCell>
                                    <TableCell className="hidden md:table-cell truncate max-w-sm">{record.anamnesis}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-sm text-muted-foreground">Belum ada riwayat pemeriksaan.</p>
                )}
            </CardContent>
        </Card>
    )
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
        <TabsList className="grid w-full grid-cols-3 md:w-[600px]">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" /> Profil
          </TabsTrigger>
          <TabsTrigger value="examination">
            <Stethoscope className="mr-2 h-4 w-4" /> Pemeriksaan Baru
          </TabsTrigger>
           <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" /> Riwayat Medis
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <PatientProfile patient={patient} />
        </TabsContent>
        <TabsContent value="examination" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText /> Catat Rekam Medis
              </CardTitle>
              <CardDescription>
                Isi formulir di bawah ini untuk mencatat hasil pemeriksaan pasien.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExaminationForm patient={patient} />
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="history" className="mt-6">
            <MedicalHistory patient={patient} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
