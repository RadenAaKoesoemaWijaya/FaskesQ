'use client';

import { Search, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Halaman Tidak Ditemukan
          </CardTitle>
          <CardDescription className="text-gray-600">
            Maaf, halaman yang Anda cari tidak dapat ditemukan.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-300 mb-2">404</div>
            <p className="text-gray-600">
              Halaman yang Anda minta mungkin telah dipindahkan, dihapus, atau tidak pernah ada.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Coba halaman berikut:</h4>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>Dashboard utama</li>
              <li>Daftar pasien</li>
              <li>Pengaturan aplikasi</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3 justify-center">
          <Link href="/" passHref>
            <Button variant="default" className="gap-2">
              <Home className="w-4 h-4" />
              Ke Beranda
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}