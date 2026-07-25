'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '#lib/utils';

interface DropdownItem {
  label: string;
  href?: string;
  action?: string;
  method?: string;
}

interface NavDropdownProps {
  label: string;
  items: DropdownItem[];
  className?: string;
}

export function NavDropdown({
  label,
  items,
  className,
}: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="group relative flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      >
        {label}
        <ChevronDown
          className={cn(
            'size-3 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'z-50 border-0 sm:border sm:border-border bg-background',
            'relative mt-2 w-full',
            'sm:absolute sm:right-0 sm:top-full sm:mt-1 sm:w-44',
          )}
        >
          {items.map((item, i) => (
            <div key={item.label} className="group/menu">
              {i > 0 && <div className="h-px bg-border" />}
              {item.action ? (
                <form action={item.action} method={item.method || 'POST'}>
                  <button
                    type="submit"
                    role="menuitem"
                    className="w-full px-4 py-2.5 text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors group-hover/menu:text-foreground cursor-pointer"
                  >
                    {item.label}
                  </button>
                </form>
              ) : (
                <a
                  href={item.href}
                  role="menuitem"
                  className="block px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors group-hover/menu:text-foreground"
                >
                  {item.label}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
