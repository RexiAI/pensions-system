import type { ReactNode } from 'react';
import type { ChartBox } from '../../charts/geometry';

/**
 * Two server-rendered variants per chart (design §Chart strategy, D4 rule 5): a wide plot and
 * a compact one whose viewBox is exactly 320 wide (`--chart-compact-w`), so at the 320px floor
 * it renders 1:1 and a 12px axis label stays 12px instead of shrinking to 4px. CSS shows one
 * and hides the other; the hidden variant is out of the accessibility tree by `display: none`.
 */
export type ChartVariant = 'wide' | 'compact';

/**
 * The descriptions every chart frame requires. One interface owns the contract, so adding a
 * frame attribute is one declaration and one render site, not three parallel copies.
 */
export interface ChartFrameAttributes {
  title: string;
  ariaLabelledBy: string;
  ariaDescribedBy: string;
  variant: ChartVariant;
}

export interface ChartFrameProps extends ChartFrameAttributes {
  box: ChartBox;
  children: ReactNode;
}

export function ChartFrame({
  title,
  ariaLabelledBy,
  ariaDescribedBy,
  box,
  variant,
  children,
}: ChartFrameProps) {
  return (
    <svg
      className={`chart chart--${variant}`}
      viewBox={`0 0 ${box.width} ${box.height}`}
      role="img"
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    >
      <title>{title}</title>
      {children}
    </svg>
  );
}
