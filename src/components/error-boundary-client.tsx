'use client';

import dynamic from 'next/dynamic';

const ErrorBoundary = dynamic(() => import('./error-boundary'), { 
  ssr: false,
  loading: () => <div>Loading error boundary...</div>
});

export default ErrorBoundary;