import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { sitemapProblems, repositoryCheck } from '../../scripts/check-sitemap';
import type { SitemapCheckInput } from '../../scripts/check-sitemap';
import { SITE_URL, canonicalUrl } from '../../web/content/site';
import { PUBLIC_ROUTE_PATHS, alternateLinks, publicPathFor } from '../../web/seo/routes';
import { LOCALES } from '../../web/content/types';

/**
 * `npm run sitemap:check` pointed at `scripts/check-sitemap.ts` for three pipeline stages while
 * that file did not exist: the command failed with `ERR_MODULE_NOT_FOUND`, and because nothing
 * ran it, the sitemap was never actually checked. A command that cannot run is worse than a
 * missing one — it reads as a passing gate.
 *
 * These tests are in two halves, and the second is the one that matters. The first half asserts
 * the check passes against the committed repository, so the script does real work rather than
 * printing a green line. The second half feeds it seeded defects — a foreign origin, a missing
 * locale, an advertised `unavailable` figure, a robots file with no `Sitemap:` line — and asserts
 * each one fails with a message that names it. A check that cannot fail is the same defect as a
 * check that cannot run.
 */
const EXPECTED_PATHS = LOCALES.map((locale) => publicPathFor(locale));
const EXPECTED_ALTERNATES = alternateLinks(SITE_URL);

function baseInput(): SitemapCheckInput {
  return {
    siteUrl: SITE_URL,
    canonical: (path) => canonicalUrl(path),
    entries: EXPECTED_PATHS.map((path) => ({
      url: canonicalUrl(path),
      languages: Object.fromEntries(EXPECTED_ALTERNATES.map((alternate) => [alternate.hreflang, alternate.href])),
    })),
    publishedPaths: EXPECTED_PATHS,
    alternates: EXPECTED_ALTERNATES,
    unavailable: [],
    unpublishedCountries: [],
    robotsSitemap: canonicalUrl('/sitemap.xml'),
    emitted: null,
  };
}

/** The problems a seeded defect produces, over an otherwise valid input. */
function problemsAfter(change: (input: SitemapCheckInput) => Partial<SitemapCheckInput>): string[] {
  return sitemapProblems({ ...baseInput(), ...change(baseInput()) });
}

describe('AC-001-52: the sitemap check runs, and the committed sitemap passes it', () => {
  it('AC-001-52: the committed sitemap, robots file and derived data produce no problem', () => {
    // The real route modules, the real content registry and the real committed figures: this is
    // the assertion that the command does work rather than exiting 0 on an empty list.
    expect(repositoryCheck()).toEqual([]);
    // Not a vacuous pass: the manifest the check compares against is the five published locales.
    expect(EXPECTED_PATHS).toEqual(['/', '/en', '/fr', '/de', '/it']);
    expect(PUBLIC_ROUTE_PATHS).toEqual(EXPECTED_PATHS);
  });

  it('AC-001-52: every `scripts/…` path package.json names resolves to a real file', () => {
    // The root cause, generalised: a broken npm script is a gate that silently does not run.
    const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts as Record<string, string>;
    const referenced = Object.entries(scripts).flatMap(([name, command]) => {
      const targets = [...command.matchAll(/(?:tsx|node)\s+(scripts\/[^\s&|]+)/g)].map((match) => match[1] ?? '');
      return targets.map((target) => ({ name, target }));
    });
    expect(referenced.length, 'package.json names at least one scripts/ entry point').toBeGreaterThan(5);
    for (const { name, target } of referenced) {
      expect(existsSync(target), `npm run ${name} → ${target}`).toBe(true);
    }
  });
});

describe('AC-001-52: a sitemap defect fails the check with a message that names it', () => {
  it('AC-001-52: a route outside the canonical origin is a failure', () => {
    const problems = problemsAfter((input) => ({
      entries: input.entries.map((entry, index) =>
        index === 1 ? { ...entry, url: 'https://pensiones.example/en' } : entry,
      ),
    }));
    expect(problems.join('\n')).toContain('https://pensiones.example/en is not on the canonical origin');
    expect(problems.join('\n')).toContain(`${canonicalUrl('/en')} is missing from the sitemap`);
  });

  it('AC-001-52: a published locale route missing from the sitemap is a failure', () => {
    const problems = problemsAfter((input) => ({
      entries: input.entries.filter((entry) => entry.url !== canonicalUrl('/fr')),
    }));
    expect(problems.join('\n')).toContain(`${canonicalUrl('/fr')} is missing`);
  });

  it('AC-001-52: a route the manifest does not publish is a failure', () => {
    const problems = problemsAfter((input) => ({
      entries: [...input.entries, { url: canonicalUrl('/admin'), languages: {} }],
    }));
    expect(problems.join('\n')).toContain(`${canonicalUrl('/admin')} is not a published route`);
  });

  it('AC-001-52: an `unavailable` figure advertised in the sitemap is a failure', () => {
    const problems = problemsAfter(() => ({
      unavailable: ['fig-03', 'cohort-return.national'],
      entries: [
        { url: canonicalUrl('/'), languages: {} },
        { url: canonicalUrl('/fig-03'), languages: {} },
      ],
      publishedPaths: ['/', '/fig-03'],
    }));
    expect(problems.join('\n')).toContain('unavailable');
    expect(problems.join('\n')).toContain('fig-03');
  });

  it('AC-001-52: an unpublished country advertised in the sitemap is a failure', () => {
    const problems = problemsAfter(() => ({
      entries: [
        { url: canonicalUrl('/'), languages: {} },
        { url: canonicalUrl('/PT'), languages: {} },
      ],
      publishedPaths: ['/', '/PT'],
      unpublishedCountries: ['PT'],
    }));
    expect(problems.join('\n')).toContain('unpublished country');
    expect(problems.join('\n')).toContain('PT');
  });

  it('AC-001-52: an incomplete or non-reciprocal alternate set is a failure', () => {
    const withoutGerman = problemsAfter((input) => ({
      entries: input.entries.map((entry) => {
        const languages = { ...entry.languages };
        delete languages.de;
        return { ...entry, languages };
      }),
    }));
    expect(withoutGerman.join('\n')).toContain('de');

    const wrongDefault = problemsAfter((input) => ({
      entries: input.entries.map((entry) => ({
        ...entry,
        languages: { ...entry.languages, 'x-default': canonicalUrl('/en') },
      })),
    }));
    expect(wrongDefault.join('\n')).toContain('x-default');
  });

  it('AC-001-52: a robots.txt that does not point at the sitemap is a failure', () => {
    const problems = problemsAfter(() => ({ robotsSitemap: canonicalUrl('/nope.xml') }));
    expect(problems.join('\n')).toContain(`${canonicalUrl('/nope.xml')} is not the sitemap URL`);

    const served = problemsAfter(() => ({
      emitted: { sitemapXml: '<urlset></urlset>', robotsTxt: 'User-Agent: *\nAllow: /\n' },
    }));
    expect(served.join('\n')).toContain('Sitemap:');
  });

  it('AC-001-52: the emitted sitemap.xml must agree with the route module, byte for byte per <loc>', () => {
    const problems = problemsAfter(() => ({
      emitted: {
        sitemapXml: `<urlset><url><loc>${canonicalUrl('/en')}</loc></url><url><loc>${canonicalUrl('/')}</loc></url></urlset>`,
        robotsTxt: `Sitemap: ${canonicalUrl('/sitemap.xml')}\n`,
      },
    }));
    expect(problems.join('\n')).toContain('emitted sitemap.xml');
  });
});
