'use client'

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";


export default function LoginizerPage() {

    return (
        <div className="animate-in fade-in-50">
            <PageHeader 
                title="Loginizer - Manajemen Akses"
                subtitle="Atur peran dan hak akses untuk setiap pengguna di sistem Anda."
            />
            
            <Card>
                <CardHeader>
                    <CardTitle>Fitur Dalam Pengembangan</CardTitle>
                    <CardDescription>
                        Halaman ini ditujukan untuk manajemen hak akses pengguna (administrator, dokter, perawat, dll.).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Segera Hadir!</AlertTitle>
                        <AlertDescription>
                            Fungsionalitas penuh untuk menambah, mengedit, dan menghapus peran pengguna serta mengatur hak akses spesifik untuk setiap peran sedang dalam tahap pengembangan aktif.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    )
}
