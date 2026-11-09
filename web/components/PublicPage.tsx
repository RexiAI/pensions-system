import type { ReactNode } from 'react';
import type { DerivedSeries } from '../ingest/series-types';
import type { CountdownValue } from '../series/countdown';
import type { CitationRegistry, ClaimVariables } from '../content/citations';
import type { CountryLocaleContent, PageKind } from '../content/types';
import { formatValue } from '../content/format';
import type { DependencyRatioSeriesValue } from '../metrics/dependency-ratio';
import type { DerivedFigure } from '../ingest/types';
import type { ScopeEntry } from './public/ScopeMark';
import { CifrasPage } from './public/CifrasPage';
import { DebatePage } from './public/DebatePage';
import { HistoriaPage } from './public/HistoriaPage';
import { MetodoPage } from './public/MetodoPage';
import { Pager } from './public/Pager';
import { SiteFooter } from './public/SiteFooter';
import { SiteHeader } from './public/SiteHeader';
import { findSeries } from '../derived/series-store';

export interface PublicPageData {
  content: CountryLocaleContent;
  figures: readonly DerivedFigure[];
  citations: CitationRegistry;
  freshnessWindowDays: number;
  stale: boolean;
  /** The derived series (the pyramid, the countdown, the fuse); absent means none is published. */
  series?: readonly DerivedSeries[];
  /** The published countries, resolved from the content model, for the scope mark. */
  countries?: readonly ScopeEntry[];
  /**
   * The render instant. The clock's server render is computed from it, so the page is
   * deterministic when a caller pins it (a test, or the static build's own instant).
   */
  now?: Date;
}

export interface PublicPageProps extends PublicPageData {
  /** The page to render: Historia, Cifras, Método or Debate (spec 007 T1). */
  pageKind: PageKind;
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
 * The mechanism claim states fig-01's first and latest ratio; both numerals are formatted from
 * the committed value here, so the sentence cannot drift from the plate it describes. A figure
 * that is absent or publishes no value yields no variables: the claim then keeps its
 * placeholders visible rather than printing an empty string in their place.
 */
function claimVariables(figures: readonly DerivedFigure[], locale: CountryLocaleContent['locale']): ClaimVariables {
  const figure = figures.find((entry) => entry.figureId === 'fig-01');
  if (figure === undefined || figure.value === null) return {};
  const { first, latest } = figure.value as DependencyRatioSeriesValue;
  if (first === null || latest === null) return {};
  return {
    first: formatValue(first.ratio, 'ratio', locale, ''),
    latest: formatValue(latest.ratio, 'ratio', locale, ''),
  };
}

/**
 * The public document shell (re-composed by spec 007 T1/T2): one page kind per route, with the
 * shared header, skip link, banner and footer. Each body owns exactly the regions its task names,
 * and the pager closes the page inside `<main>`.
 *
 * The page is composed from data and content only, so it renders without any admin configuration.
 */
export function PublicPage({
  content,
  figures,
  citations,
  freshnessWindowDays,
  stale,
  pageKind,
  series = [],
  countries,
  now = new Date(),
}: PublicPageProps) {
  const countdown = countdownOf(series);
  const pyramid = findSeries(series, 'pyramid');
  const fuse = findSeries(series, 'fuse');
  const scopes = countries ?? [{ geo: content.country.code, name: content.country.name, href: '#' }];
  const snapshotIso = snapshotIsoOf(figures);
  const bodies: Record<PageKind, ReactNode> = {
    historia: (
      <HistoriaPage
        content={content}
        countdown={countdown}
        pyramid={pyramid}
        fuse={fuse}
        nowMs={now.getTime()}
        freshnessWindowDays={freshnessWindowDays}
      />
    ),
    cifras: <CifrasPage content={content} figures={figures} freshnessWindowDays={freshnessWindowDays} />,
    metodo: (
      <MetodoPage
        content={content}
        sources={{ countdown, pyramid, fuse }}
        figures={figures}
        series={series}
        freshnessWindowDays={freshnessWindowDays}
        nowMs={now.getTime()}
        countries={scopes}
        lifeExpectancy={lifeExpectancyOf(figures)}
      />
    ),
    debate: <DebatePage content={content} citations={citations} vars={claimVariables(figures, content.locale)} />,
  };
  return (
    <div className="page">
      <a className="skip-link" href="#main">
        {content.t('site.skipLink')}
      </a>
      {stale ? <p className="banner">{content.t('banner.stale')}</p> : null}
      <SiteHeader content={content} snapshotIso={snapshotIso} pageKind={pageKind} />
      <main id="main">
        {bodies[pageKind]}
        <Pager content={content} pageKind={pageKind} />
      </main>
      <SiteFooter content={content} snapshotIso={snapshotIso} pageKind={pageKind} />
    </div>
  );
}
