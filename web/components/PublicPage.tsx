import { FIGURE_IDS } from '../ingest/types';
import type { DerivedFigure } from '../ingest/types';
import type { DerivedSeries } from '../ingest/series-types';
import type { CountdownValue } from '../series/countdown';
import type { ScopeEntry } from './public/ScopeMark';
import type { CitationRegistry } from '../content/citations';
import type { CountryLocaleContent } from '../content/types';
import { isLedgerState } from './metrics/figure-state';
import { MetricPlate } from './metrics/MetricPlate';
import { figureNumberOf, viewStateFor } from './metrics/views';
import { AgreementSection } from './registers/AgreementSection';
import { DisputeSection } from './registers/DisputeSection';
import { ThesisSection } from './registers/ThesisSection';
import { AssumptionsLedger } from './public/AssumptionsLedger';
import { FigureLedgerNote } from './FigureLedgerNote';
import { Hero } from './public/Hero';
import { RegisterKey } from './public/RegisterKey';
import { ReproduceBlock } from './public/ReproduceBlock';
import { SiteFooter } from './public/SiteFooter';
import { SiteHeader } from './public/SiteHeader';
import { SourceStrip } from './public/SourceStrip';
import { PyramidPlate } from './series/PyramidPlate';
import { findSeries } from '../derived/series-store';

export interface PublicPageProps {
  content: CountryLocaleContent;
  figures: readonly DerivedFigure[];
  citations: CitationRegistry;
  freshnessWindowDays: number;
  stale: boolean;
  /** The derived series (the pyramid, the countdown); absent means none is published. */
  series?: readonly DerivedSeries[];
  /** The published countries, resolved from the content model, for the scope mark. */
  countries?: readonly ScopeEntry[];
  /**
   * The render instant. The clock's server render is computed from it, so the page is
   * deterministic when a caller pins it (a test, or the static build's own instant).
   */
  now?: Date;
}

function orderedFigures(figures: readonly DerivedFigure[]): DerivedFigure[] {
  return FIGURE_IDS.map((figureId) => figures.find((figure) => figure.figureId === figureId)).filter(
    (figure): figure is DerivedFigure => figure !== undefined,
  );
}

function lifeExpectancyOf(figures: readonly DerivedFigure[]): number | null {
  const cohort = figures.find((figure) => figure.figureId === 'fig-03');
  const assumptions = cohort?.assumptions ?? {};
  const value = assumptions['lifeExpectancyAtRetirement'];
  return typeof value === 'number' ? value : null;
}

/**
 * The countdown is read from the committed series, never recomputed here: its value (and the
 * snapshot year inside it) is fixed at ingest, so a render-time clock cannot make the number
 * disagree with its own provenance (OQ19).
 */
function countdownOf(series: readonly DerivedSeries[]): CountdownValue | undefined {
  const entry = findSeries(series, 'countdown');
  if (entry === undefined || entry.availability !== 'computed' || entry.value === null) return undefined;
  return entry.value as CountdownValue;
}

function snapshotIsoOf(figures: readonly DerivedFigure[]): string {
  const first = figures[0];
  return first ? first.manifest.fetchedAt : '';
}

/**
 * The public document: instrument plates and unresolved rows in strict figure order, then the
 * three registers, then the audit trail. It is composed from data and content only, so it
 * renders without any admin configuration.
 */
export function PublicPage({
  content,
  figures,
  citations,
  freshnessWindowDays,
  stale,
  series = [],
  countries,
  now = new Date(),
}: PublicPageProps) {
  const ordered = orderedFigures(figures);
  const pyramid = findSeries(series, 'pyramid');
  const countdown = countdownOf(series);
  const scopes = countries ?? [{ geo: content.country.code, name: content.country.name, href: '#' }];
  const snapshotIso = snapshotIsoOf(ordered);
  const sources = ordered.flatMap((figure) => figure.manifest.sourceUrl);
  const firstLedger = ordered.find((figure) => isLedgerState(viewStateFor({ figure, content })));
  return (
    <div className="page">
      <a className="skip-link" href="#main">
        {content.t('site.skipLink')}
      </a>
      {stale ? <p className="banner">{content.t('banner.stale')}</p> : null}
      <SiteHeader content={content} snapshotIso={snapshotIso} />
      <main id="main">
        <Hero content={content} figures={ordered} countdown={countdown} countries={scopes} nowMs={now.getTime()} />
        <SourceStrip content={content} sources={sources} />
        {pyramid === undefined ? null : (
          <PyramidPlate content={content} series={pyramid} freshnessWindowDays={freshnessWindowDays} />
        )}
        <RegisterKey content={content} />
        <div id="figuras">
          {ordered.map((figure) => (
            <div className="figure-slot" key={figure.figureId}>
              {firstLedger && figure.figureId === firstLedger.figureId ? (
                <FigureLedgerNote content={content} />
              ) : null}
              <MetricPlate
                figureNumber={figureNumberOf(figure)}
                figure={figure}
                content={content}
                freshnessWindowDays={freshnessWindowDays}
              />
            </div>
          ))}
        </div>
        <div id="debate">
          <AgreementSection content={content} citations={citations} />
          <DisputeSection content={content} citations={citations} />
        </div>
        <div id="lectura">
          <ThesisSection content={content} />
        </div>
        <ReproduceBlock content={content} figures={ordered} series={series} />
        <AssumptionsLedger
          content={content}
          freshnessWindowDays={freshnessWindowDays}
          lifeExpectancy={lifeExpectancyOf(ordered)}
        />
      </main>
      <SiteFooter content={content} snapshotIso={snapshotIso} />
    </div>
  );
}
