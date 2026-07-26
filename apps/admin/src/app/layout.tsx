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
  title: 'Spotea Admin',
  description:
    'Administrasi platform: verifikasi merchant, moderasi konten, dan analitik bisnis.',
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

  if (session.user.role !== 'ADMIN') {
    redirect(APP_URL);
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar
          brand="ADMIN"
          items={[
            { label: 'Dashboard', href: '/admin' },
            { label: 'Merchants', href: '/admin/merchants' },
            { label: 'Reports', href: '/admin/reports' },
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
