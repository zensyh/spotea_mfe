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

const triggerClass =
  'group relative font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground';

const itemClass =
  'block w-full px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';

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
        className={cn(triggerClass, 'flex items-center gap-1')}
      >
        {label}
        <ChevronDown
          className={cn(
            'size-3 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-40 border border-border bg-background"
        >
          {items.map((item) => {
            if (item.action) {
              return (
                <form
                  key={item.label}
                  action={item.action}
                  method={item.method || 'POST'}
                >
                  <button
                    type="submit"
                    role="menuitem"
                    className={cn(itemClass, 'cursor-pointer')}
                  >
                    {item.label}
                  </button>
                </form>
              );
            }

            return (
              <a
                key={item.label}
                href={item.href}
                role="menuitem"
                className={itemClass}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
