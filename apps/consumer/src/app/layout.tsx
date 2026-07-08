import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { redirect } from 'next/navigation';
import { verifySession } from '@spotea/auth';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost';

export const metadata: Metadata = {
  title: 'Spotea — Temukan Kafe Terbaik di Sekitarmu',
  description:
    'Cari, jelajahi, dan reservasi kafe favoritmu. Rating, menu, jam buka — semua dalam satu platform.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await verifySession();

  if (!session) {
    redirect(`${APP_URL}/login`);
  }

  if (session.user.role !== 'customer') {
    redirect(APP_URL);
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
