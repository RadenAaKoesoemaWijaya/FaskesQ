'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Route Error:', error);
    
    // In production, send to error tracking service
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Terjadi Kesalahan
          </CardTitle>
          <CardDescription className="text-gray-600">
            Maaf, terjadi kesalahan yang tidak terduga.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Detail Error (Development Only):</h3>
              <div className="space-y-1 text-sm text-red-700">
                <p><strong>Message:</strong> {error.message}</p>
                {error.digest && <p><strong>Digest:</strong> {error.digest}</p>}
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-2 text-xs overflow-auto max-h-32 bg-red-100 p-2 rounded">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Coba solusi berikut:</h4>
            <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
              <li>Muat ulang halaman</li>
              <li>Bersihkan cache browser</li>
              <li>Kembali ke halaman sebelumnya</li>
              <li>Coba lagi nanti</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3 justify-center">
          <Button onClick={() => reset()} variant="default" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline" className="gap-2">
            <Home className="w-4 h-4" />
            Ke Beranda
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}