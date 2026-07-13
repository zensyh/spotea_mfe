import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '#lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-none border font-mono text-[11px] uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        outline: 'border-border text-muted-foreground',
        solid: 'border-foreground bg-foreground text-background',
        brand: 'border-primary bg-primary text-primary-foreground',
        success: 'border-border text-foreground',
        warning: 'border-border text-foreground',
        destructive: 'border-destructive/40 bg-destructive/10 text-destructive',
      },
      size: {
        sm: 'h-6 px-2',
        default: 'h-7 px-3',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'default',
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
