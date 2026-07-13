'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '#lib/utils';
import { OrnamentGrid } from '#components/ornament-grid';

const cardVariants = cva(
  'relative rounded-none border border-border bg-card text-card-foreground',
  {
    variants: {
      density: {
        comfortable: '',
        compact: '',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  },
);

interface EditorialCardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  showGrid?: boolean;
  showCornerMarks?: boolean;
  interactive?: boolean;
}

const CORNER_BASE = 'pointer-events-none absolute size-3 border-foreground';

const EditorialCard = React.forwardRef<HTMLDivElement, EditorialCardProps>(
  (
    {
      className,
      children,
      density,
      showGrid = true,
      showCornerMarks = true,
      interactive = false,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ density }),
          interactive &&
            'group/card transition-colors duration-300 hover:border-foreground',
          className,
        )}
        {...props}
      >
        {showGrid && (
          <div
            className="pointer-events-none absolute inset-0 text-foreground"
            aria-hidden="true"
            style={{
              maskImage:
                'radial-gradient(ellipse 90% 80% at 85% 15%, black, transparent 75%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 90% 80% at 85% 15%, black, transparent 75%)',
            }}
          >
            <OrnamentGrid
              variant="cells"
              cellSize={72}
              lineColor="currentColor"
              lineOpacity={0.075}
            />
          </div>
        )}

        {showCornerMarks && (
          <>
            <span
              className={cn(CORNER_BASE, 'left-0 top-0 border-l border-t')}
              aria-hidden="true"
            />
            <span
              className={cn(CORNER_BASE, 'right-0 top-0 border-r border-t')}
              aria-hidden="true"
            />
            <span
              className={cn(CORNER_BASE, 'bottom-0 left-0 border-b border-l')}
              aria-hidden="true"
            />
            <span
              className={cn(CORNER_BASE, 'bottom-0 right-0 border-b border-r')}
              aria-hidden="true"
            />
          </>
        )}

        <div className="relative z-10">{children}</div>
      </div>
    );
  },
);
EditorialCard.displayName = 'EditorialCard';

export { EditorialCard };
