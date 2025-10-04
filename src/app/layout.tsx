import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Suspense } from 'react';
import { LayoutClient } from '@/components/layout-client';
import ErrorBoundary from '@/components/error-boundary-client';

export const metadata: Metadata = {
  title: 'FaskesQ - Rekam Medis Elektronik',
  description: 'Aplikasi rekam medis elektronik yang komprehensif.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full" suppressHydrationWarning={true}>
        <ErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            <LayoutClient>{children}</LayoutClient>
          </Suspense>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
