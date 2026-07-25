import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter, IBM_Plex_Mono } from 'next/font/google';
import { Navbar } from '@repo/ui/components/navbar';
import { NavDropdown } from '@repo/ui/components/nav-dropdown';
import { verifySession } from '@repo/auth';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  variable: '--font-mono',
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
});

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

  const rightSlot = session ? (
    <NavDropdown
      label="Account"
      items={[
        { label: 'Profile', href: '/account' },
        { label: 'Logout', action: '/api/auth/logout', method: 'POST' },
      ]}
    />
  ) : (
    <div className="flex items-center gap-6">
      <Link
        href="/login"
        className="group relative font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      >
        Login
        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
      </Link>
      <Link
        href="/register"
        className="group relative font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      >
        Register
        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
      </Link>
    </div>
  );

  return (
    <html
      lang="en"
      className={`${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar
          brand="SPOTEA"
          items={[
            { label: 'Consumer', href: '/consumer' },
            { label: 'Merchant', href: '/merchant' },
            { label: 'Admin', href: '/admin' },
            { label: 'Account', href: '/account' },
          ]}
          rightSlot={rightSlot}
        />
        {children}
      </body>
    </html>
  );
}
