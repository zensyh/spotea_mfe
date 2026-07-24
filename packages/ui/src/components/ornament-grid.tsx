'use client';

import { cn } from '#lib/utils';

type OrnamentVariant = 'dots' | 'lines' | 'cells';
type MaskVariant = 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT' | 'TOP_LEFT' | 'NONE';

interface OrnamentGridProps {
  variant?: OrnamentVariant;
  cellSize?: number;
  lineColor?: string;
  lineOpacity?: number;
  className?: string;
  maskVariant?: MaskVariant;
}

const WAVE_KEYFRAMES = `
@keyframes ornament-grid-wave {
  0% { background-position: 0px 0px; }
  25% { background-position: 4px 2px; }
  50% { background-position: 0px 6px; }
  75% { background-position: -2px 3px; }
  100% { background-position: 0px 0px; }
}
`;

export const MASKS: Record<MaskVariant, string> = {
  NONE: 'none',
  TOP_RIGHT:
    'radial-gradient(ellipse 95% 85% at 12% 18%, black, transparent 82%)',
  TOP_LEFT:
    'radial-gradient(ellipse 95% 85% at 88% 22%, black, transparent 82%)',
  BOTTOM_RIGHT:
    'radial-gradient(ellipse 95% 85% at 12% 82%, black, transparent 82%)',
  BOTTOM_LEFT:
    'radial-gradient(ellipse 95% 85% at 88% 82%, black, transparent 82%)',
};

function gridPattern(
  variant: OrnamentVariant,
  cellSize: number,
  color: string,
) {
  const half = cellSize / 2;

  switch (variant) {
    case 'dots':
      return `
        radial-gradient(1px 1px at ${half}px ${half}px, ${color}, transparent),
        radial-gradient(1px 1px at 0 0, ${color}, transparent)
      `;
    case 'cells':
      return `
        linear-gradient(to right, ${color} 1px, transparent 1px),
        linear-gradient(to bottom, ${color} 1px, transparent 1px)
      `;
    case 'lines':
    default:
      return `
        repeating-linear-gradient(0deg, transparent, transparent ${cellSize - 1}px, ${color} ${cellSize - 1}px, ${color} ${cellSize}px),
        repeating-linear-gradient(90deg, transparent, transparent ${cellSize - 1}px, ${color} ${cellSize - 1}px, ${color} ${cellSize}px)
      `;
  }
}

export function OrnamentGrid({
  variant = 'lines',
  cellSize = 24,
  lineColor = '#D4D4D8',
  lineOpacity = 0.3,
  maskVariant = 'NONE',
  className,
}: OrnamentGridProps) {
  const pattern = gridPattern(variant, cellSize, lineColor);

  return (
    <>
      <style>{WAVE_KEYFRAMES}</style>
      <div
        className={cn('pointer-events-none absolute inset-0', className)}
        style={{
          opacity: lineOpacity,
          backgroundImage: pattern,
          backgroundSize: `${cellSize}px ${cellSize}px`,
          backgroundPosition: '0px 0px',
          animation: 'ornament-grid-wave 20s ease-in-out infinite',
          maskImage: MASKS[maskVariant],
          WebkitMaskImage: MASKS[maskVariant],
        }}
        aria-hidden="true"
      />
    </>
  );
}
