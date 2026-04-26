import type { Metadata } from 'next';
import { ReactNode } from 'react';

import AppProviders from '@/components/providers/AppProviders';

import './globals.css';

export const metadata: Metadata = {
  title: 'Linkiving Extension',
  description: 'Save links to Linkiving from your browser popup.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
