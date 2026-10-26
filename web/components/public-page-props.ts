import { citationRegistry } from '../content/citations';
import { contentRegistry } from '../content/registry';
import { SERIES_DIR, readDerivedSeries } from '../derived/series-store';
import { readDerivedFigures } from '../ingest/write-derived';
import { evaluateFreshness } from '../sources/freshness';
import type { ScopeEntry } from './public/ScopeMark';
import type { DerivedFigure } from '../ingest/types';
import type { PublicPageProps } from './PublicPage';

export const DEFAULT_FRESHNESS_DAYS = 45;

const DERIVED_DIR = 'data/derived';

function freshnessWindowDays(configured?: number): number {
  if (configured !== undefined) return configured;
  const parsed = Number.parseInt(process.env.ADMIN_FRESHNESS_WINDOW_DAYS ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_FRESHNESS_DAYS;
}

export interface PublicPageOptions {
  derivedDir?: string;
  seriesDir?: string;
  now?: Date;
  freshnessWindowDays?: number;
}

/**
 * The props of one locale of the public site, from committed data only. There is no admin
 * dependency here: an unconfigured deployment still builds the public page. Returns `null`
 * for a locale with no complete content, which the route turns into a 404.
 */
interface ResolvedOptions {
  derivedDir: string;
  seriesDir: string;
  now: Date;
  window: number;
}

function resolveOptions(options: PublicPageOptions): ResolvedOptions {
  return {
    derivedDir: options.derivedDir ?? DERIVED_DIR,
    seriesDir: options.seriesDir ?? SERIES_DIR,
    now: options.now ?? new Date(),
    window: freshnessWindowDays(options.freshnessWindowDays),
  };
}

export function publicPageProps(
  locale: string,
  options: PublicPageOptions = {},
): PublicPageProps | null {
  const result = contentRegistry.get('ES', locale);
  if (!result.ok) return null;
  const resolved = resolveOptions(options);
  const figures = readDerivedFigures(resolved.derivedDir);
  if (!hasFigures(figures)) return null;
  return {
    content: result.content,
    figures,
    series: readDerivedSeries(resolved.seriesDir),
    countries: publishedScope(result.content.locale),
    citations: citationRegistry,
    freshnessWindowDays: resolved.window,
    stale: anyStale(figures, resolved.window, resolved.now),
  };
}

/** A deployment with no published figure has no page to render. */
function hasFigures(figures: readonly DerivedFigure[]): boolean {
  return figures.length > 0;
}

/** One stale snapshot puts the page-level banner up; the freshness window is per deployment. */
function anyStale(figures: readonly DerivedFigure[], windowDays: number, now: Date): boolean {
  return figures.some((figure) => !evaluateFreshness(figure.manifest.fetchedAt, windowDays, now).fresh);
}

/**
 * The scope mark's data: every published country, each named by its own record in the reader's
 * locale. Resolved through the content model, so the component never sees a country code.
 */
export function publishedScope(locale: string): ScopeEntry[] {
  return contentRegistry.countries().flatMap((geo) => {
    const entry = contentRegistry.get(geo, locale);
    if (!entry.ok) return [];
    return [{ geo, name: entry.content.country.name, href: locale === 'es' ? '/' : `/${locale}` }];
  });
}
