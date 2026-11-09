import type { CountryLocaleContent } from '../../content/types';
import type { DerivedFigure } from '../../ingest/types';
import type { DerivedSeries } from '../../ingest/series-types';
import { AssumptionsLedger } from './AssumptionsLedger';
import { MethodRegion } from './MethodRegion';
import type { MethodSources } from './MethodRegion';
import { PageHeading } from './PageHeading';
import { ReproduceBlock } from './ReproduceBlock';
import { SourceStrip } from './SourceStrip';
import type { ScopeEntry } from './ScopeMark';

export interface MetodoPageProps {
  content: CountryLocaleContent;
  sources: MethodSources;
  figures: readonly DerivedFigure[];
  series: readonly DerivedSeries[];
  freshnessWindowDays: number;
  nowMs: number;
  countries: readonly ScopeEntry[];
  lifeExpectancy: number | null;
}

/**
 * Método (spec 007 T4): one `<h1>`, then four regions in two bands — instrument (method precision
 * plus the source strip), then reproduction (reproduce panel plus the assumptions ledger). One
 * hairline separates the bands; no heading is added to create them.
 */
export function MetodoPage({
  content,
  sources,
  figures,
  series,
  freshnessWindowDays,
  nowMs,
  countries,
  lifeExpectancy,
}: MetodoPageProps) {
  const headingId = 'page-title-metodo';
  return (
    <>
      <PageHeading content={content} pageKind="metodo" id={headingId} />
      <div className="method-bands">
        <div className="method-band">
          <MethodRegion
            content={content}
            sources={sources}
            freshnessWindowDays={freshnessWindowDays}
            nowMs={nowMs}
            countries={countries}
            labelledBy={headingId}
          />
          <SourceStrip content={content} sources={figures.flatMap((figure) => figure.manifest.sourceUrl)} />
        </div>
        <div className="method-band">
          <ReproduceBlock content={content} figures={figures} series={series} />
          <AssumptionsLedger
            content={content}
            freshnessWindowDays={freshnessWindowDays}
            lifeExpectancy={lifeExpectancy}
          />
        </div>
      </div>
    </>
  );
}
