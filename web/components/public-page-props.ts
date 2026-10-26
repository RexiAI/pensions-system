import { citationRegistry } from '../content/citations';
import { contentRegistry } from '../content/registry';
import { readDerivedFigures } from '../ingest/write-derived';
import { evaluateFreshness } from '../sources/freshness';
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
  now?: Date;
  freshnessWindowDays?: number;
}

/**
 * The props of one locale of the public site, from committed data only. There is no admin
 * dependency here: an unconfigured deployment still builds the public page. Returns `null`
 * for a locale with no complete content, which the route turns into a 404.
 */
export function publicPageProps(
  locale: string,
  options: PublicPageOptions = {},
): PublicPageProps | null {
  const result = contentRegistry.get('ES', locale);
  if (!result.ok) return null;
  const figures = readDerivedFigures(options.derivedDir ?? DERIVED_DIR);
  if (figures.length === 0) return null;
  const window = freshnessWindowDays(options.freshnessWindowDays);
  const now = options.now ?? new Date();
  const stale = figures.some((figure) => !evaluateFreshness(figure.manifest.fetchedAt, window, now).fresh);
  return {
    content: result.content,
    figures,
    citations: citationRegistry,
    freshnessWindowDays: window,
    stale,
  };
}
