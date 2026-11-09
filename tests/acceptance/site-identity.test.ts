import { afterEach, describe, expect, it, vi } from 'vitest';
import { PublicPage } from '../../web/components/PublicPage';
import { SiteFooter } from '../../web/components/public/SiteFooter';
import {
  canonicalUrl,
  CONTACT_EMAIL,
  COOKIELESS_COUNTER_ENABLED,
  SITE_URL,
} from '../../web/content/site';
import { citationRegistry } from '../../web/content/citations';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import { metadataFor } from '../../web/seo/metadata';
import { pageKindOfPath, pagePathFor, publicPathFor, sitemapEntries } from '../../web/seo/routes';
import { siteMetadata } from '../../web/seo/site-metadata';
import { content, PLATE_FIXTURES, renderComponent } from '../fixtures/figures';
import { seriesFixtures } from '../fixtures/series';
import { countOccurrences, listSourceFiles, readSource } from '../helpers/source-scan';

/**
 * The site's own identity — its canonical origin and its contact address — is configuration,
 * not prose, and the three places that publish the origin (the canonical `<link>`, `og:url` and
 * the footer's citation line) all derive from one value. They used to be an RFC-2606 reserved
 * domain (`pensiones.example`), which can never receive mail and never resolves: a placeholder
 * that shipped.
 *
 * Measured against the built app (`npm run build`, `next start`) as well as against the
 * rendering layer, so a metadata helper that is correct in isolation but never wired into a
 * route is still caught — see `tests/acceptance/served-document.test.ts`.
 */
/**
 * The origin the site is actually served from. Spec 006 T13 corrects the committed default from a
 * Vercel project alias to this origin: the criterion ("the defaults are the deployed origin") is
 * unchanged, the deployed origin moved (AC-006-34, AC-006-35).
 */
const DEPLOYED_ORIGIN = 'https://pensions-system-delta.vercel.app';
const DEPLOYED_INBOX = 'info@rexi-ai.com';

const ENV_KEYS = ['SITE_URL', 'CONTACT_EMAIL'] as const;

/** Reloads `web/content/site` at module scope, which is where the environment is read. */
async function reloadedSite(): Promise<typeof import('../../web/content/site')> {
  vi.resetModules();
  return import('../../web/content/site');
}

afterEach(() => {
  for (const key of ENV_KEYS) delete process.env[key];
  vi.resetModules();
});

describe('AC-001-35: the canonical origin and the contact address are configuration, not prose', () => {
  it('AC-001-35: the committed defaults are the deployed origin and the real inbox', () => {
    expect(SITE_URL).toBe(DEPLOYED_ORIGIN);
    expect(CONTACT_EMAIL).toBe(DEPLOYED_INBOX);
    // A reserved domain is the defect this pins: it can never resolve and never receive mail.
    expect(SITE_URL).not.toMatch(/\.(example|invalid|test|localhost)\b/);
    expect(CONTACT_EMAIL.split('@')[1]).toBe('rexi-ai.com');
  });

  it('AC-001-35: SITE_URL and CONTACT_EMAIL override the defaults, and a blank value does not', async () => {
    process.env.SITE_URL = 'https://pensions-custom.es/';
    process.env.CONTACT_EMAIL = 'hola@pensions-custom.es';
    const overridden = await reloadedSite();
    // A canonical origin never carries a trailing slash; every URL is built with `new URL`.
    expect(overridden.SITE_URL).toBe('https://pensions-custom.es');
    expect(overridden.CONTACT_EMAIL).toBe('hola@pensions-custom.es');
    expect(overridden.canonicalUrl('/en')).toBe('https://pensions-custom.es/en');

    process.env.SITE_URL = '   ';
    process.env.CONTACT_EMAIL = '';
    const blank = await reloadedSite();
    expect(blank.SITE_URL).toBe(DEPLOYED_ORIGIN);
    expect(blank.CONTACT_EMAIL).toBe(DEPLOYED_INBOX);
  });

  it('AC-001-35: a malformed origin or inbox fails the build instead of shipping', async () => {
    process.env.SITE_URL = 'not-an-origin';
    await expect(reloadedSite()).rejects.toThrow(/SITE_URL/);

    delete process.env.SITE_URL;
    process.env.CONTACT_EMAIL = 'info@rexi-ai.com <script>';
    await expect(reloadedSite()).rejects.toThrow(/CONTACT_EMAIL/);
  });

  it('AC-001-35: canonicalUrl applies the one origin to a public path', () => {
    // A root URL is its origin, without the empty path's slash.
    expect(canonicalUrl('/')).toBe(SITE_URL);
    expect(canonicalUrl('/en')).toBe(`${SITE_URL}/en`);
    expect(new URL(canonicalUrl('/fr')).origin).toBe(SITE_URL);
    // The path the canonical link, `og:url` and the footer share comes from one helper too.
    expect(LOCALES.map((locale) => publicPathFor(locale))).toEqual(['/', '/en', '/fr', '/de', '/it']);
  });
});

/**
 * The configuration's own edge cases. The shipped defaults and a single-slash override exercise
 * the happy path only: every branch in `site.ts` that reads a value the deployment happens not to
 * use is invisible to the assertions above, so a mutant can flatten it without turning the suite
 * red. These are the inputs that reach each branch directly.
 */
describe('AC-001-35: the configuration branches the shipped defaults never reach', () => {
  it('AC-001-35: every trailing slash is stripped, not only the last one', async () => {
    process.env.SITE_URL = 'https://pensions-custom.es///';
    const stripped = await reloadedSite();
    expect(stripped.SITE_URL).toBe('https://pensions-custom.es');
  });

  it('AC-001-35: the inbox pattern is anchored at both ends and accepts a multi-label domain', async () => {
    // A string that *contains* an address is not an address: the footer prints it as the mailto
    // href and as visible text, so an unanchored match would ship surrounding prose.
    process.env.CONTACT_EMAIL = 'write to info@rexi-ai.com';
    await expect(reloadedSite()).rejects.toThrow(/CONTACT_EMAIL/);

    process.env.CONTACT_EMAIL = 'info@mail.rexi-ai.com';
    const multiLabel = await reloadedSite();
    expect(multiLabel.CONTACT_EMAIL).toBe('info@mail.rexi-ai.com');
  });

  it('AC-001-35: the address length cap is 254, inclusive', async () => {
    // 249 + '@x.co' = 254 characters: at the cap, accepted.
    process.env.CONTACT_EMAIL = `${'a'.repeat(249)}@x.co`;
    const atCap = await reloadedSite();
    expect(atCap.CONTACT_EMAIL).toHaveLength(254);

    // 250 + '@x.co' = 255: over the cap, rejected before it can reach a mail client.
    process.env.CONTACT_EMAIL = `${'a'.repeat(250)}@x.co`;
    await expect(reloadedSite()).rejects.toThrow(/CONTACT_EMAIL/);
  });

  it('AC-001-35: only a bare root collapses to the origin; a query or fragment is kept', () => {
    expect(canonicalUrl('/?ref=share')).toBe(`${SITE_URL}/?ref=share`);
    expect(canonicalUrl('/#empieza')).toBe(`${SITE_URL}/#empieza`);
    expect(canonicalUrl('/en?ref=share')).toBe(`${SITE_URL}/en?ref=share`);
  });

  it('AC-001-35: the deployment ships no cookie-setting counter', () => {
    // A counter that sets a cookie is a consent surface this site deliberately does not have.
    expect(COOKIELESS_COUNTER_ENABLED).toBe(false);
  });
});

describe('AC-001-35: the canonical link, og:url and the footer line cannot drift', () => {
  it('AC-001-35: every route publishes the same absolute URL in all three places', () => {
    for (const locale of LOCALES) {
      const canonical = canonicalUrl(publicPathFor(locale));
      const meta = metadataFor(locale);
      expect(String(meta.alternates?.canonical), `${locale} rel=canonical`).toBe(canonical);
      expect(String(meta.openGraph?.url), `${locale} og:url`).toBe(canonical);

      const footer = renderComponent(SiteFooter, { content: content(locale), snapshotIso: '2026-10-25T22:26:02Z' });
      expect(footer, `${locale} footer line`).toContain(`<code>${canonical}</code>`);
      // Never the bare path: `/` is not a canonical URL.
      expect(footer, `${locale}`).not.toContain('<code>/</code>');
    }
  });

  it('AC-001-35: metadataBase is the same origin, so a relative og:image cannot point elsewhere', () => {
    expect(siteMetadata.metadataBase?.toString()).toBe(`${SITE_URL}/`);
    for (const locale of LOCALES) {
      expect(new URL(String(metadataFor(locale).alternates?.canonical)).origin).toBe(SITE_URL);
    }
  });

  it('AC-001-35: the contact renders as a real mailto link with the address as visible text', () => {
    for (const locale of LOCALES as readonly Locale[]) {
      const footer = renderComponent(SiteFooter, { content: content(locale), snapshotIso: '2026-10-25T22:26:02Z' });
      expect(footer, `${locale}`).toContain(`<a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>`);
      // Exactly twice — the href and the visible text — and never obfuscated into an image.
      expect(countOccurrences(footer, CONTACT_EMAIL), `${locale}: one address, twice`).toBe(2);
      expect(footer, `${locale}`).not.toMatch(/&#64;|\(at\)|<img[^>]*mail/i);
    }
  });

  it('AC-001-35: the snapshot stamp is still the manifest value, not a literal in the footer', () => {
    const figures = PLATE_FIXTURES.map((fixture) => fixture());
    const fromManifest = figures.find((figure) => figure.figureId === 'fig-01')?.manifest.fetchedAt ?? '';
    expect(fromManifest).not.toBe('');
    const page = renderComponent(PublicPage, {
      content: content('es'),
      figures,
      series: seriesFixtures(),
      citations: citationRegistry,
      freshnessWindowDays: 45,
      stale: false,
      pageKind: 'historia',
    });
    // `PublicPage` takes the stamp from the first figure's manifest, and the footer prints it.
    expect(page).toContain(`<time dateTime="${fromManifest}">${fromManifest}</time>`);
    // A second, different instant proves the line reads its prop rather than a fixed date.
    const other = '2025-01-02T03:04:05Z';
    const footer = renderComponent(SiteFooter, { content: content('es'), snapshotIso: other });
    expect(footer).toContain(`<time dateTime="${other}">${other}</time>`);
    expect(footer).not.toContain(fromManifest);
  });
});

describe('AC-001-35: no shipped surface carries a reserved-domain placeholder', () => {
  it('AC-001-35: no source, content or generated file names a `.example` host or a placeholder inbox', () => {
    // Comment prose is scanned too: a stale URL in a comment is the thing the next reader copies.
    const files = [...listSourceFiles('web'), ...listSourceFiles('app'), ...listSourceFiles('scripts')];
    expect(files.length).toBeGreaterThan(100);

    for (const file of files) {
      const source = readSource(file);
      expect(source, `${file} carries a reserved-domain host`).not.toMatch(/\.(example|invalid)\b/i);
      expect(source, `${file} carries a placeholder inbox`).not.toMatch(/@pensiones\./i);
    }

    // The shipped copy is checked the same way: a placeholder address in a locale file is a
    // placeholder that reaches the page even if every component is clean.
    for (const locale of [...LOCALES, 'citations', 'admin']) {
      const path =
        locale === 'citations'
          ? 'web/content/data/citations.json'
          : locale === 'admin'
            ? 'web/content/data/admin/es.json'
            : `web/content/data/ES/${locale}.json`;
      expect(readSource(path), path).not.toMatch(/\.(example|invalid)\b|@pensiones\./i);
    }
  });
});

/**
 * The design's locale contract (`15-design.md` §i18n): five static routes per locale, with
 * `hreflang` alternates and `x-default` pointing at Spanish. Nothing emitted it — the served
 * `<head>` carried no `<link rel="alternate" hreflang="…">` and zero `x-default` occurrences —
 * so the site told a crawler that five near-identical pages were five unrelated pages.
 *
 * The set lives in the shared metadata (`metadataFor`), which both route branches call, so a
 * route cannot emit a partial set by forgetting to pass something. Its URLs come from
 * `canonicalUrl`, the same function the canonical `<link>` and `og:url` use, so the alternate
 * for `es` *is* the canonical URL rather than a second spelling of it.
 */
/** The sitemap's per-page alternate set equals the page metadata's, and names five distinct pages. */
function assertPageAlternates(entry: ReturnType<typeof sitemapEntries>[number]): void {
  const path = new URL(entry.url).pathname;
  const kind = pageKindOfPath(path);
  const fromSitemap = Object.fromEntries(entry.alternates.map((alternate) => [alternate.hreflang, alternate.href]));
  const fromPage = (metadataFor('es', kind).alternates?.languages ?? {}) as Record<string, string>;
  expect(fromSitemap, `sitemap ${entry.url}`).toEqual(fromPage);
  expect(new Set(Object.values(fromSitemap)).size, `${path}: distinct pages`).toBe(LOCALES.length);
}

describe('AC-001-52: every route advertises the reciprocal locale alternate set', () => {
  /** The six entries the design requires: five locales plus `x-default`, which names Spanish. */
  const EXPECTED: Record<string, string> = {
    es: canonicalUrl('/'),
    en: canonicalUrl('/en'),
    fr: canonicalUrl('/fr'),
    de: canonicalUrl('/de'),
    it: canonicalUrl('/it'),
    'x-default': canonicalUrl('/'),
  };

  it('AC-001-52: all five locales plus x-default, on every locale route', () => {
    for (const locale of LOCALES) {
      const languages = metadataFor(locale).alternates?.languages;
      expect(languages, `${locale}: alternates.languages`).toBeTruthy();
      // Sets, not order: `Record` iteration order is a Next serialisation detail.
      expect(Object.keys(languages ?? {}).sort(), `${locale}: hreflang set`).toEqual(
        Object.keys(EXPECTED).sort(),
      );
      expect(languages, `${locale}: hrefs`).toEqual(EXPECTED);
    }
  });

  it('AC-001-52: x-default names the Spanish route, and every href is an absolute canonical URL', () => {
    for (const locale of LOCALES) {
      const languages = (metadataFor(locale).alternates?.languages ?? {}) as Record<string, string>;
      expect(languages['x-default'], `${locale}: x-default`).toBe(canonicalUrl(publicPathFor('es')));
      for (const [hreflang, href] of Object.entries(languages)) {
        expect(new URL(href).origin, `${locale}: ${hreflang} origin`).toBe(SITE_URL);
        // Never a relative href and never a trailing-slash variant of `/`: both would be a
        // second spelling of the URL the canonical link already publishes.
        expect(href, `${locale}: ${hreflang} is canonical`).toBe(canonicalUrl(new URL(href).pathname));
      }
      // Five distinct routes: `x-default` shares Spanish's URL, every other entry is its own.
      expect(new Set(Object.values(languages)).size, `${locale}: distinct locales`).toBe(LOCALES.length);
    }
  });

  it('AC-001-52: the sitemap advertises the same per-page set as the pages do', () => {
    // One source, two surfaces: a page whose alternates disagree with the sitemap's is a crawler
    // reading two different stories about which URLs are translations of each other. Spec 007
    // extends this from the five home routes to all twenty public routes.
    const entries = sitemapEntries(SITE_URL);
    expect(entries).toHaveLength(20);
    for (const entry of entries) assertPageAlternates(entry);
    // Every page kind's set names that page kind, never the home URL for a sub-page.
    for (const kind of ['cifras', 'metodo', 'debate'] as const) {
      const hrefs = Object.values((metadataFor('es', kind).alternates?.languages ?? {}) as Record<string, string>);
      expect(hrefs, kind).toContain(canonicalUrl(pagePathFor('es', kind)));
      expect(hrefs, kind).not.toContain(canonicalUrl('/'));
    }
  });
});
