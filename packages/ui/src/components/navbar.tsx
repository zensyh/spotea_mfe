'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '#lib/utils';

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  items?: NavItem[];
  brand?: ReactNode;
  rightSlot?: ReactNode;
  className?: string;
}

function NavLink({ item }: { item: NavItem }) {
  return (
    <a
      href={item.href}
      className="group relative font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground py-3 sm:py-0"
    >
      {item.label}
      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
    </a>
  );
}

export function Navbar({ items, brand, rightSlot, className }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 640px)');

    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setMobileOpen(false);
      }
    };

    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-border bg-background',
        className,
      )}
    >
      <div className="mx-auto max-w-7xl flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          {brand && (
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {brand}
            </span>
          )}
        </div>

        {items && items.length > 0 && (
          <nav className="hidden sm:flex items-center gap-8">
            {items.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        )}

        <div className="hidden sm:flex items-center">{rightSlot}</div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          className="flex sm:hidden items-center justify-center text-muted-foreground"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 right-0 top-14 z-50 border-b border-border bg-background">
            {items && items.length > 0 && (
              <nav className="flex flex-col gap-1 px-4 py-4">
                {items.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </nav>
            )}
            {rightSlot && (
              <div className="border-t border-border px-4 py-4">
                {rightSlot}
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
}
