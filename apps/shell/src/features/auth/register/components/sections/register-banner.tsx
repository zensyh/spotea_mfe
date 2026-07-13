import React from 'react';
import { OrnamentGrid } from '@repo/ui/components/ornament-grid';

const RegisterBanner = () => {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden  px-12 py-14 text-foreground">
      <div
        className="pointer-events-none absolute inset-0 text-foreground"
        aria-hidden="true"
      >
        <OrnamentGrid
          variant="cells"
          cellSize={72}
          lineColor="currentColor"
          lineOpacity={0.06}
          maskVariant="TOP_LEFT"
        />
      </div>

      {/*-- corners --*/}
      <span
        className="pointer-events-none absolute size-4 border-foreground/75 left-6 top-6 border-l border-t"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute size-4 border-foreground/75 right-6 top-6 border-r border-t"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute size-4 border-foreground/75 bottom-6 left-6 border-b border-l"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute size-4 border-foreground/75 bottom-6 right-6 border-b border-r"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center justify-between">
        <div
          className="anim-reveal flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground"
          style={{ animationDelay: '0ms' }}
        >
          <span
            className="pulse-dot inline-block size-2 rounded-full bg-primary-foreground"
            aria-hidden="true"
          />
          Spotea · Welcome Buddy!
        </div>
        <div
          className="anim-reveal flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground"
          style={{ animationDelay: '40ms' }}
          aria-hidden="true"
        >
          <span>Registration</span>
        </div>
      </div>

      <div className="relative z-10 max-w-lg space-y-6">
        <h1
          className="anim-reveal font-sans font-bold leading-[1.05] tracking-[-0.02em] text-6xl"
          style={{ animationDelay: '80ms' }}
        >
          Every great day starts with the right cafe.
        </h1>

        <p
          className="anim-reveal max-w-sm font-sans text-base font-light leading-[1.7] text-muted-foreground"
          style={{ animationDelay: '160ms' }}
        >
          Find your favorite place with spotea
        </p>
      </div>

      <div
        className="anim-reveal font-light leading-[1.7] relative z-10 max-w-md"
        style={{ animationDelay: '260ms' }}
      >
        lorem ipsum
      </div>
    </div>
  );
};

export default RegisterBanner;
