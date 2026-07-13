import * as React from 'react';

import { cn } from '#lib/utils';

interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'open' | 'closed' | 'busy';
  pulse?: boolean;
}

const TONE_MAP: Record<NonNullable<StatusDotProps['tone']>, string> = {
  open: 'bg-primary',
  closed: 'bg-muted-foreground',
  busy: 'bg-muted-foreground',
};

function StatusDot({
  tone = 'open',
  pulse = true,
  className,
  ...props
}: StatusDotProps) {
  return (
    <span
      className={cn(
        'inline-block size-2 rounded-full',
        TONE_MAP[tone],
        pulse && tone === 'open' && 'pulse-dot',
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export { StatusDot };
