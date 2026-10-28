/**
 * Build gate: the crawl surface — `sitemap.xml`, `robots.txt` and the locale alternate set.
 *
 * This script was named by `package.json` (`sitemap:check` → `tsx scripts/check-sitemap.ts`) for
 * three pipeline stages while the file did not exist, so the command failed with
 * `ERR_MODULE_NOT_FOUND` and the sitemap was never checked. A gate that cannot run reads exactly
 * like a gate that passed, which is why this one is written to fail loudly with a message that
 * names the offending URL rather than to print a green line.
 *
 *   tsx scripts/check-sitemap.ts
 *
 * It checks, in order:
 *
 *   1. the sitemap lists exactly the published locale routes — no more, no fewer;
 *   2. every `<loc>` is an absolute URL on the canonical origin, in the canonical spelling
 *      `canonicalUrl` produces (one origin, one spelling, no trailing-slash variant);
 *   3. every entry advertises the full reciprocal alternate set — the five locales plus
 *      `x-default` → Spanish — with those same canonical URLs;
 *   4. no route advertises a figure the derived data publishes as `unavailable`, and none
 *      advertises a country this deployment does not publish;
 *   5. `robots.txt` points at that sitemap, both in the route module and in the emitted bytes;
 *   6. when a build is present, the emitted `sitemap.xml` agrees with the route module — this is
 *      the half that reads real `<loc>` elements instead of the objects that should become them.
 *
 * Exit 0 = every check passes. Exit 1 = at least one problem, each printed with its URL.
 */
import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import sitemapRoute from '../app/sitemap';
import robotsRoute from '../app/robots';
import { canonicalUrl, SITE_URL } from '../web/content/site';
import { COUNTRY_CONFIGURATIONS, PUBLISHED_GEO, PUBLISHED_GEOS } from '../web/sources/countries';
import { contentRegistry } from '../web/content/registry';
import { readDerivedFigures } from '../web/ingest/write-derived';
import { PUBLIC_ROUTE_PATHS, alternateLinks, publicPathFor } from '../web/seo/routes';
import type { SitemapAlternate } from '../web/seo/routes';

const DERIVED_DIR = 'data/derived';
const EMITTED_SITEMAP = '.next/server/app/sitemap.xml.body';
const EMITTED_ROBOTS = '.next/server/app/robots.txt.body';

/** One sitemap entry as the route module defines it, past Next's own type. */
export interface SitemapEntryView {
  url: string;
  languages: Record<string, string>;
}

/** The built artefacts, when a build is present. Absent means "checked the route modules only". */
export interface EmittedSitemap {
  sitemapXml: string;
  robotsTxt: string;
}

export interface SitemapCheckInput {
  /** The deployment's canonical origin. */
  siteUrl: string;
  /** `canonicalUrl`, bound to that origin: the one function that builds an absolute URL. */
  canonical: (path: string) => string;
  entries: readonly SitemapEntryView[];
  /** The routes the site publishes, as paths: `['/', '/en', …]`. */
  publishedPaths: readonly string[];
  /** The reciprocal alternate set every entry must carry. */
  alternates: readonly SitemapAlternate[];
  /** Figure and definition ids the derived data publishes as `unavailable` (T1). */
  unavailable: readonly string[];
  /** Configured countries this deployment does not publish (T2). */
  unpublishedCountries: readonly string[];
  /** The sitemap URL `robotsPolicy` declares. */
  robotsSitemap: string;
  emitted: EmittedSitemap | null;
}

function pathOf(url: string): string {
  return new URL(url).pathname;
}

/** 2. Absolute, on the one origin, in the one spelling. */
function canonicalProblems(input: SitemapCheckInput): string[] {
  return input.entries.flatMap((entry) => {
    let origin: string;
    try {
      origin = new URL(entry.url).origin;
    } catch {
      return [`${entry.url} is not an absolute URL`];
    }
    if (origin !== input.siteUrl) {
      return [`${entry.url} is not on the canonical origin ${input.siteUrl}`];
    }
    const expected = input.canonical(pathOf(entry.url));
    return entry.url === expected ? [] : [`${entry.url} is not the canonical URL ${expected}`];
  });
}

/** 1. Exactly the published routes. */
function membershipProblems(input: SitemapCheckInput): string[] {
  const published = new Set(input.publishedPaths.map((path) => input.canonical(path)));
  const listed = new Set(input.entries.map((entry) => entry.url));
  const missing = [...published]
    .filter((url) => !listed.has(url))
    .map((url) => `${url} is missing from the sitemap`);
  const extra = [...listed]
    .filter((url) => !published.has(url))
    .map((url) => `${url} is not a published route`);
  return [...missing, ...extra];
}

/** 3. The same reciprocal set on every entry, with `x-default` on Spanish. */
function alternateProblems(input: SitemapCheckInput): string[] {
  const expected = new Map(input.alternates.map((alternate) => [alternate.hreflang, alternate.href]));
  return input.entries.flatMap((entry) => {
    const wrong = [...expected.keys()]
      .filter((hreflang) => entry.languages[hreflang] !== expected.get(hreflang))
      .map(
        (hreflang) =>
          `${entry.url}: hreflang ${hreflang} is ${entry.languages[hreflang] ?? 'missing'}, expected ${expected.get(hreflang) ?? ''}`,
      );
    const unknown = Object.keys(entry.languages)
      .filter((hreflang) => !expected.has(hreflang))
      .map((hreflang) => `${entry.url}: hreflang ${hreflang} is not in the published locale set`);
    return [...wrong, ...unknown];
  });
}

/** 4. Nothing the site does not publish, and nothing it publishes as absent. */
function advertisementProblems(input: SitemapCheckInput): string[] {
  return input.entries.flatMap((entry) => {
    const segments = pathOf(entry.url).split('/').filter(Boolean);
    const absent = input.unavailable.find((token) => segments.includes(token));
    const country = segments.find((segment) =>
      input.unpublishedCountries.some((geo) => geo.toLowerCase() === segment.toLowerCase()),
    );
    const problems: string[] = [];
    if (absent) {
      problems.push(`${entry.url} advertises ${absent}, which the derived data publishes as unavailable`);
    }
    if (country) problems.push(`${entry.url} advertises the unpublished country ${country}`);
    return problems;
  });
}

/** 5. `robots.txt` points at the sitemap, in the route and in the emitted bytes. */
function robotsProblems(input: SitemapCheckInput): string[] {
  const expected = input.canonical('/sitemap.xml');
  const problems =
    input.robotsSitemap === expected ? [] : [`${input.robotsSitemap} is not the sitemap URL ${expected}`];
  if (input.emitted === null) return problems;
  const declared = /^\s*Sitemap:\s*(\S+)\s*$/im.exec(input.emitted.robotsTxt)?.[1];
  if (declared === expected) return problems;
  return [...problems, `robots.txt declares ${declared ?? 'no Sitemap: line'} — expected Sitemap: ${expected}`];
}

/** 6. The emitted XML agrees with the route module, `<loc>` for `<loc>`, in order. */
function emittedProblems(input: SitemapCheckInput): string[] {
  if (input.emitted === null) return [];
  const locs = [...input.emitted.sitemapXml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) =>
    (match[1] ?? '').trim(),
  );
  const listed = input.entries.map((entry) => entry.url);
  const agrees = locs.length === listed.length && locs.every((loc, index) => loc === listed[index]);
  return agrees ? [] : [`emitted sitemap.xml lists [${locs.join(', ')}], expected [${listed.join(', ')}]`];
}

/** Every problem the crawl surface has. Empty means the check passed. */
export function sitemapProblems(input: SitemapCheckInput): string[] {
  return [
    ...membershipProblems(input),
    ...canonicalProblems(input),
    ...alternateProblems(input),
    ...advertisementProblems(input),
    ...robotsProblems(input),
    ...emittedProblems(input),
  ];
}

function emittedArtefacts(): EmittedSitemap | null {
  if (!existsSync(EMITTED_SITEMAP) || !existsSync(EMITTED_ROBOTS)) return null;
  return {
    sitemapXml: readFileSync(EMITTED_SITEMAP, 'utf8'),
    robotsTxt: readFileSync(EMITTED_ROBOTS, 'utf8'),
  };
}

/** The real sitemap, as Next will serialise it: the route module's own return value. */
function routeEntries(): SitemapEntryView[] {
  return sitemapRoute().map((entry) => ({
    url: entry.url,
    languages: (entry.alternates?.languages ?? {}) as Record<string, string>,
  }));
}

/**
 * The routes this deployment publishes, resolved from the content model rather than from the
 * manifest that is being checked: `publishedLocales × publicPathFor` must equal the route
 * manifest, and the sitemap must then list exactly that set.
 */
function publishedPaths(): string[] {
  return contentRegistry.locales(PUBLISHED_GEO).map((locale) => publicPathFor(locale));
}

function repositoryInput(): SitemapCheckInput {
  return {
    siteUrl: SITE_URL,
    canonical: (path) => canonicalUrl(path),
    entries: routeEntries(),
    publishedPaths: publishedPaths(),
    alternates: alternateLinks(SITE_URL),
    unavailable: readDerivedFigures(DERIVED_DIR)
      .filter((figure) => figure.availability !== 'computed')
      .flatMap((figure) => [figure.figureId, figure.definitionId]),
    unpublishedCountries: COUNTRY_CONFIGURATIONS.map((configuration) => configuration.geo).filter(
      (geo) => !PUBLISHED_GEOS.includes(geo),
    ),
    robotsSitemap: robotsRoute().sitemap as string,
    emitted: emittedArtefacts(),
  };
}

/** The content model and the route manifest must name the same five routes. */
function manifestProblems(): string[] {
  const fromContent = publishedPaths().slice().sort();
  const fromManifest = [...PUBLIC_ROUTE_PATHS].sort();
  if (fromContent.join('|') === fromManifest.join('|')) return [];
  return [
    `the content model publishes [${fromContent.join(', ')}] but the route manifest names [${fromManifest.join(', ')}]`,
  ];
}

function repository(): { problems: string[]; input: SitemapCheckInput } {
  const input = repositoryInput();
  return { problems: [...manifestProblems(), ...sitemapProblems(input)], input };
}

/** The whole check against this repository. Empty means it passes. */
export function repositoryCheck(): string[] {
  return repository().problems;
}

function main(): number {
  const { problems, input } = repository();
  for (const problem of problems) console.error(`sitemap gate: ${problem}`);
  if (problems.length > 0) {
    console.error(`sitemap gate: ${problems.length} problem(s)`);
    return 1;
  }
  console.log(
    `sitemap gate: ${input.entries.length} routes, ${input.alternates.length} alternates each, origin ${input.siteUrl}`,
  );
  console.log(
    input.emitted === null
      ? 'sitemap gate: no build present — checked the route modules only'
      : `sitemap gate: emitted ${EMITTED_SITEMAP} and ${EMITTED_ROBOTS} agree`,
  );
  return 0;
}

/**
 * Runs as a gate when executed, and stays importable when a test wants its report instead of
 * its exit code — importing a module must not exit the importer.
 */
const invokedAsScript =
  process.argv[1] !== undefined && pathToFileURL(process.argv[1]).href === import.meta.url;

if (invokedAsScript) process.exit(main());
