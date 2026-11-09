import type { CountryLocaleContent } from '../../content/types';
import type { DerivedFigure } from '../../ingest/types';
import { FiguresRegion } from './FiguresRegion';
import { PageHeading } from './PageHeading';

export interface CifrasPageProps {
  content: CountryLocaleContent;
  figures: readonly DerivedFigure[];
  freshnessWindowDays: number;
}

/**
 * Cifras (spec 007 T3): one `<h1>`, then the seven computed plates inside `#figuras`. The page
 * title names the region through `aria-labelledby`, so the plate list is not re-headed.
 */
export function CifrasPage({ content, figures, freshnessWindowDays }: CifrasPageProps) {
  return (
    <>
      <PageHeading content={content} pageKind="cifras" id="page-title-cifras" />
      <FiguresRegion
        content={content}
        figures={figures}
        freshnessWindowDays={freshnessWindowDays}
        labelledBy="page-title-cifras"
      />
    </>
  );
}
