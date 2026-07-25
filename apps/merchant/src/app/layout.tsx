import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { redirect } from 'next/navigation';
import { verifySession } from '@repo/auth';
import { Navbar } from '@repo/ui/components/navbar';
import { NavDropdown } from '@repo/ui/components/nav-dropdown';
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
  title: 'Spotea Merchant — Kelola Kafe Kamu',
  description:
    'Dashboard untuk pemilik kafe: atur profil, menu, jam buka, dan pantau reservasi pelanggan.',
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

  if (session.user.role !== 'MERCHANT') {
    redirect(APP_URL);
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar
          brand="MERCHANT"
          items={[
            { label: 'Dashboard', href: '/merchant' },
            { label: 'Profile', href: '/merchant/profile' },
            { label: 'Menu', href: '/merchant/menu' },
            { label: 'Consumer', href: '/consumer' },
            { label: 'Account', href: '/account' },
          ]}
          rightSlot={
            <NavDropdown
              label="Account"
              items={[
                { label: 'Profile', href: '/account' },
                { label: 'Logout', action: '/api/auth/logout', method: 'POST' },
              ]}
            />
          }
        />
        {children}
      </body>
    </html>
  );
}
