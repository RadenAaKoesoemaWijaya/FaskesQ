'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { PlusCircle, Search, Users, Clock, DollarSign, BarChart, Trash2, Edit, MoreVertical, User, Venus, Mars, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getPatients, getTopDiseases } from '@/lib/data';
import type { Patient, TopDisease } from '@/lib/types';
import { Input } from '@/components/ui/input';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deletePatientAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const chartData = [
  { month: 'Jan', visits: 186 },
  { month: 'Feb', visits: 205 },
  { month: 'Mar', visits: 207 },
  { month: 'Apr', visits: 173 },
  { month: 'Mei', visits: 209 },
  { month: 'Jun', visits: 214 },
];

const chartConfig = {
  visits: {
    label: 'Kunjungan',
    color: 'hsl(var(--primary))',
  },
  count: {
      label: 'Jumlah Kasus',
      color: 'hsl(var(--chart-2))'
  }
};

function PatientCard({ patient, onDelete }: { patient: Patient, onDelete: (id: string, name: string) => void }) {
  const router = useRouter();

  const GenderIcon = patient.gender === 'Pria' ? Mars : patient.gender === 'Wanita' ? Venus : User;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <Link href={`/patients/${patient.id}`} className="flex items-center gap-4 group">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              <GenderIcon className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-lg group-hover:underline">{patient.name}</CardTitle>
            <CardDescription>{patient.medicalRecordNumber}</CardDescription>
          </div>
        </Link>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/patients/${patient.id}/edit`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(patient.id, patient.name)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Hapus</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Tgl Lahir:</strong> {patient.dateOfBirth}</p>
          <p><strong>Jenis Kelamin:</strong> <Badge variant="secondary">{patient.gender}</Badge></p>
          <p><strong>Kontak:</strong> {patient.contact}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <Button variant="outline" size="sm" asChild className="w-full">
            <Link href={`/patients/${patient.id}`}>Lihat Rekam Medis</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get('q') as string;
    router.push(`/?q=${searchQuery}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        name="q"
        placeholder="Cari pasien (Nama, No. RM)..."
        className="w-full bg-background pl-8"
        defaultValue={searchParams.get('q') || ''}
      />
    </form>
  )
}

function StatsCard({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [topDiseases, setTopDiseases] = useState<TopDisease[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientToDelete, setPatientToDelete] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [fetchedPatients, fetchedTopDiseases] = await Promise.all([
            getPatients(query),
            getTopDiseases()
        ]);
        setPatients(fetchedPatients);
        setTopDiseases(fetchedTopDiseases);
      } catch (error) {
         toast({
            variant: 'destructive',
            title: "Gagal Mengambil Data",
            description: (error as Error).message,
         });
      }
      setLoading(false);
    }
    fetchData();
  }, [query, toast]);

  const handleDeleteRequest = (id: string, name: string) => {
    setPatientToDelete({ id, name });
  }

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;
    
    const result = await deletePatientAction(patientToDelete.id);
    
    if (result.success) {
      setPatients(patients.filter(p => p.id !== patientToDelete.id));
      toast({
        title: "Pasien Dihapus",
        description: `Data untuk ${patientToDelete.name} telah berhasil dihapus.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: "Gagal Menghapus",
        description: result.error,
      });
    }
    setPatientToDelete(null);
  }

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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard title="Total Pasien Terlayani" value="1,250" icon={<Users className="h-4 w-4 text-muted-foreground" />} description="+20.1% dari bulan lalu" />
        <StatsCard title="Rata-rata Waktu Konsultasi" value="12m 30s" icon={<Clock className="h-4 w-4 text-muted-foreground" />} description="Turun 5% dari minggu lalu" />
        <StatsCard title="Pendapatan (Pasien Umum)" value="Rp 25.4Jt" icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} description="+15.3% dari bulan lalu" />
        <StatsCard title="Pasien Baru Bulan Ini" value="+85" icon={<Users className="h-4 w-4 text-muted-foreground" />} description="Naik 10% dari bulan lalu" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BarChart />
                Grafik Kunjungan Pasien
            </CardTitle>
            <CardDescription>Kunjungan pasien selama 6 bulan terakhir.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
              <RechartsBarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="visits" fill="var(--color-visits)" radius={4} />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
             <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity />
                    10 Penyakit Terbanyak
                </CardTitle>
                <CardDescription>Berdasarkan diagnosis yang tercatat.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                   <RechartsBarChart layout="vertical" data={topDiseases} margin={{ right: 20, left: 10 }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis 
                            dataKey="name" 
                            type="category" 
                            tickLine={false} 
                            axisLine={false} 
                            tickMargin={10}
                            width={120}
                            style={{ fontSize: '12px' }}
                        />
                        <XAxis dataKey="count" type="number" />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))' }}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                    </RechartsBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold font-headline mb-4">Daftar Semua Pasien</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
             <Card key={i}>
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted animate-pulse"></div>
                    <div className="space-y-2">
                         <div className="h-4 w-32 rounded bg-muted animate-pulse"></div>
                         <div className="h-3 w-24 rounded bg-muted animate-pulse"></div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="h-3 w-4/5 rounded bg-muted animate-pulse"></div>
                    <div className="h-3 w-3/5 rounded bg-muted animate-pulse"></div>
                    <div className="h-3 w-4/6 rounded bg-muted animate-pulse"></div>
                </CardContent>
            </Card>
          ))
        ) : patients.length > 0 ? (
          patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} onDelete={handleDeleteRequest} />
          ))
        ) : (
          <p className="text-muted-foreground col-span-full text-center">
            Tidak ada pasien yang cocok dengan pencarian Anda.
          </p>
        )}
      </div>

      <AlertDialog open={!!patientToDelete} onOpenChange={(open) => !open && setPatientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data pasien <strong className='text-foreground'>{patientToDelete?.name}</strong> secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPatientToDelete(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
