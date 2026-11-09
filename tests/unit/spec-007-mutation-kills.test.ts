import { describe, expect, it } from 'vitest';
import { BRAND } from '../../web/brand/generated';
import { FigureStatusRow } from '../../web/components/FigureStatusRow';
import { FiguresRegion } from '../../web/components/public/FiguresRegion';
import { MethodRegion } from '../../web/components/public/MethodRegion';
import { MetodoPage } from '../../web/components/public/MetodoPage';
import { Pager } from '../../web/components/public/Pager';
import { SiteFooter } from '../../web/components/public/SiteFooter';
import { SiteHeader } from '../../web/components/public/SiteHeader';
import { formatDate } from '../../web/content/format';
import { PAGE_NAME_KEYS } from '../../web/content/keys';
import type { LocaleKey } from '../../web/content/keys';
import { CONTACT_EMAIL, canonicalUrl } from '../../web/content/site';
import { LOCALES, PAGE_KINDS } from '../../web/content/types';
import type { PageKind } from '../../web/content/types';
import { languageAlternates, pageMetadata } from '../../web/seo/metadata';
import { pagePathFor, publicPathFor } from '../../web/seo/routes';
import { SOURCE_DECLARATIONS } from '../../web/sources/types';
import { content, dependencyFigure, renderComponent } from '../fixtures/figures';
import { pyramidSeries, seriesFixtures } from '../fixtures/series';
import { pageOf } from '../helpers/story';

/**
 * Assertions written for survivors of stage 5a's scoped mutation run over the spec-007 surface.
 * Each block names one branch a mutant can flatten without a scenario noticing; the shape is the
 * one specs 003–006 established — one block per killed mutant cluster, asserted on rendered
 * output, never on a helper that rebuilds the component's own expectation.
 *
 * Not every survivor here is killed: the genuinely equivalent ones (a guard the caller or the
 * type system already enforces, a defensive label for data the ingest cannot produce) are named
 * with their reason in `specs/007-four-page-story/30-report.md` instead of being asserted around.
 */

const ES = content('es');
const NOW = Date.parse('2026-10-31T10:00:00Z');
const SNAPSHOT_ISO = '2026-10-25T09:00:00Z';

/** Visible text of a fragment: tags removed *without* inserting a space in their place. */
function bareText(markup: string): string {
  return markup.replace(/<[^>]*>/g, '').trim();
}

/** The substring from `open` to the first `close` after it, or `''` when `open` is absent. */
function between(html: string, open: string, close: string): string {
  const at = html.indexOf(open);
  if (at === -1) return '';
  const end = html.indexOf(close, at);
  return end === -1 ? html.slice(at) : html.slice(at, end);
}

function localeName(locale: string): string {
  return ES.t(`locale.${locale}` as LocaleKey);
}

describe('Pager: direction, destination and order are the link', () => {
  interface RenderedLink {
    direction: string;
    href: string;
    text: string;
  }

  function linksOf(html: string): RenderedLink[] {
    return [...html.matchAll(/<a class="pager__link pager__link--(prev|next)" href="([^"]*)">([\s\S]*?)<\/a>/g)].map(
      (match) => ({ direction: match[1] ?? '', href: match[2] ?? '', text: bareText(match[3] ?? '') }),
    );
  }

  it('walks the declared page order, each link naming its own direction and destination', () => {
    for (const [index, kind] of PAGE_KINDS.entries()) {
      const html = renderComponent(Pager, { content: ES, pageKind: kind });
      expect(html, kind).toContain(`aria-label="${ES.t('pager.label')}"`);
      const links = linksOf(html);
      const neighbours = { prev: PAGE_KINDS[index - 1], next: PAGE_KINDS[index + 1] };

      for (const link of links) {
        const direction = link.direction as 'prev' | 'next';
        const destination = neighbours[direction];
        expect(destination, `${kind} ${direction} must not exist`).toBeDefined();
        if (destination === undefined) continue;
        expect(link.href, `${kind} ${direction} href`).toBe(pagePathFor('es', destination));
        // The direction word and the destination name are two words, and each is its own word.
        const word = ES.t(direction === 'prev' ? 'pager.previous' : 'pager.next');
        expect(link.text, `${kind} ${direction} text`).toBe(`${word} ${ES.t(PAGE_NAME_KEYS[destination])}`);
      }

      const expected = Object.values(neighbours).filter((kindName) => kindName !== undefined).length;
      expect(links, `${kind} link count`).toHaveLength(expected);
    }
  });

  it('renders no link for a page kind the reading order does not contain', () => {
    // The guard behind `neighbour`: an unknown kind has no neighbour, so the pager is empty
    // rather than silently pointing at the first page.
    const html = renderComponent(Pager, { content: ES, pageKind: 'desconocida' as PageKind });
    expect(html).toContain(`aria-label="${ES.t('pager.label')}"`);
    expect(html).not.toContain('<a ');
  });
});

describe('metadata: a page without a committed year never invents one', () => {
  it('leads a sub-page with its own page name and Historia with the scope sentence alone', () => {
    const scope = `${BRAND.wordmark} · ${ES.country.name}`;
    const cifras = pageMetadata('es', null, 'cifras');
    expect(cifras.title).toBe(`${ES.t(PAGE_NAME_KEYS.cifras)} · ${scope}`);
    expect(cifras.ogTitle).toBe(cifras.title);

    expect(pageMetadata('es', null, 'historia').title).toBe(scope);
    expect(pageMetadata('es', null, 'metodo').title).toBe(`${ES.t(PAGE_NAME_KEYS.metodo)} · ${scope}`);
  });

  it('defaults the alternate set to Historia’s own routes', () => {
    const languages = languageAlternates();
    expect(Object.keys(languages).sort()).toEqual([...LOCALES, 'x-default'].sort());
    expect(languages['x-default']).toBe(canonicalUrl(pagePathFor('es', 'historia')));
    for (const locale of LOCALES) {
      expect(languages[locale], locale).toBe(canonicalUrl(pagePathFor(locale, 'historia')));
    }
  });
});

describe('FigureStatusRow: the unresolved row links to itself by name', () => {
  it('names the row from its own id, links the title to that anchor and labels the definition', () => {
    const html = renderComponent(FigureStatusRow, {
      figureNumber: 7,
      content: ES,
      state: 'unavailable',
      definition: 'The published definition.',
    });
    expect(html).toContain('<section class="figure-row" id="fig-07" aria-labelledby="fig-07-title" data-state="unavailable">');
    expect(html).toContain('<a href="#fig-07">');
    expect(html).toContain(`<span class="figure-row__definition-label">${ES.t('fig.definitionLabel')}</span> The published definition.`);
    // The method link points at the Método page, the page that now owns the method region.
    expect(html).toContain(`href="${pagePathFor('es', 'metodo')}"`);
  });

  it('states the withheld state’s own reason when no specific one is supplied', () => {
    const html = renderComponent(FigureStatusRow, { figureNumber: 7, content: ES, state: 'withheld' });
    expect(html).toContain(`<p class="figure-row__reason">${ES.t('figure.withheld.reason')}</p>`);
  });
});

describe('PublicPage: a countdown that is not computed renders no clock', () => {
  function countdownAsUnavailable() {
    return seriesFixtures().map((entry) =>
      entry.seriesId === 'countdown' ? { ...entry, availability: 'unavailable' as const } : entry,
    );
  }

  it('drops the clock when the series says it is not computed, even with a stale value attached', () => {
    const computed = pageOf('historia');
    expect(computed).toContain('class="clock"');

    const unavailable = pageOf('historia', 'es', { series: countdownAsUnavailable() });
    expect(unavailable).not.toContain('class="clock"');
    expect(unavailable).not.toContain('clock__value');
  });
});

describe('FiguresRegion: the region role exists only when the page h1 names it', () => {
  it('omits role and aria-labelledby when it is given no heading id', () => {
    const labelled = renderComponent(FiguresRegion, {
      content: ES,
      figures: [dependencyFigure()],
      freshnessWindowDays: 45,
      labelledBy: 'page-title-cifras',
    });
    expect(labelled).toContain('<div id="figuras" role="region" aria-labelledby="page-title-cifras">');

    const unlabelled = renderComponent(FiguresRegion, {
      content: ES,
      figures: [dependencyFigure()],
      freshnessWindowDays: 45,
    });
    // The opening element itself carries neither attribute; nested plates may still use `role`.
    expect(unlabelled.startsWith('<div id="figuras">')).toBe(true);
  });
});

describe('MethodRegion: a series is documented only when it is computed', () => {
  it('prints no provenance strip for an unavailable series that keeps a stale value', () => {
    const unavailable = renderComponent(MethodRegion, {
      content: ES,
      sources: { pyramid: { ...pyramidSeries(), availability: 'unavailable' as const } },
      freshnessWindowDays: 45,
      nowMs: NOW,
      countries: [],
      labelledBy: 'page-title-metodo',
    });
    expect(unavailable).not.toContain('class="provenance"');

    const computed = renderComponent(MethodRegion, {
      content: ES,
      sources: { pyramid: pyramidSeries() },
      freshnessWindowDays: 45,
      nowMs: NOW,
      countries: [],
      labelledBy: 'page-title-metodo',
    });
    expect(computed).toContain('class="provenance"');
  });
});

describe('MetodoPage: the heading id is the one the first region points at', () => {
  it('names the h1 and the method region from the same id', () => {
    const html = renderComponent(MetodoPage, {
      content: ES,
      sources: {},
      figures: [dependencyFigure()],
      series: seriesFixtures(),
      freshnessWindowDays: 45,
      nowMs: NOW,
      countries: [],
      lifeExpectancy: null,
    });
    expect(html).toContain('<h1 class="page-heading" id="page-title-metodo">');
    expect(html).toContain('aria-labelledby="page-title-metodo"');
  });
});

describe('SiteFooter: the citing half keeps its labels, links and the space between them', () => {
  const footer = renderComponent(SiteFooter, { content: ES, snapshotIso: SNAPSHOT_ISO, pageKind: 'cifras' });

  it('lists every declared source as a named link to its publisher', () => {
    expect(footer).toContain(`<h2>${ES.t('footer.sourcesHeading')}</h2>`);
    for (const source of SOURCE_DECLARATIONS) {
      // The renderer HTML-escapes the query string's `&`; the publisher and the target are the point.
      const href = source.publisherUrl.replaceAll('&', '&amp;');
      expect(footer, source.sourceId).toContain(
        `<a href="${href}" rel="noopener noreferrer">${source.publisher}</a>`,
      );
    }
    expect(footer).toContain(`<p>${ES.t('footer.licence')}</p>`);
  });

  it('offers the five locale routes, each with its own hrefLang', () => {
    for (const locale of LOCALES) {
      expect(footer, locale).toContain(`<a href="${publicPathFor(locale)}" hrefLang="${locale}">${locale}</a>`);
    }
    expect(footer.split('footer__locales').length - 1).toBe(1);
  });

  it('states the claims, the contact and the citation each with their own label', () => {
    expect(footer).toContain(`<h2>${ES.t('footer.doesNotClaimHeading')}</h2>`);
    expect(footer).toContain(`<p>${ES.t('footer.noTracking')}</p>`);
    expect(footer).toContain(
      `${ES.t('footer.contact')}: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>`,
    );
    expect(footer).toContain(
      `${ES.t('footer.canonical')}: <code>${canonicalUrl(pagePathFor('es', 'cifras'))}</code>`,
    );
    expect(footer).toContain(
      `${ES.t('footer.snapshot')}: <time dateTime="${SNAPSHOT_ISO}">${SNAPSHOT_ISO}</time>`,
    );
  });
});

describe('SiteHeader: the two density modes name everything a reader navigates by', () => {
  const long = formatDate(SNAPSHOT_ISO, 'es');
  const header = renderComponent(SiteHeader, { content: ES, snapshotIso: SNAPSHOT_ISO, pageKind: 'cifras' });

  it('renders the brand, the snapshot stamp and the four page links with one current page', () => {
    expect(header).toContain(
      `<a class="site-header__wordmark" href="${publicPathFor('es')}">${ES.t('site.wordmark')}</a>`,
    );
    expect(header).toContain(
      `<span class="site-header__iso" aria-label="${ES.t('hero.snapshotLabel')} ${long}" title="${long}">`,
    );

    const nav = between(header, '<nav class="site-header__nav"', '</nav>');
    expect(nav).toContain(`aria-label="${ES.t('nav.index')}"`);
    for (const kind of PAGE_KINDS) {
      expect(nav, kind).toContain(`href="${pagePathFor('es', kind)}"`);
      expect(nav, kind).toContain(`>${ES.t(PAGE_NAME_KEYS[kind])}</a>`);
    }
    expect(nav.split('aria-current="page"').length - 1).toBe(1);
    expect(nav).toContain(`href="${pagePathFor('es', 'cifras')}" aria-current="page"`);

    const stamp = between(header, '<p class="site-header__stamp">', '</p>');
    expect(bareText(stamp)).toBe(`${ES.t('hero.snapshotLabel')} ${long}`);
  });

  it('names each locale cell in the language’s own name and marks the current one', () => {
    const group = between(header, '<div class="locale-group"', '</div>');
    expect(group).toContain(`role="group" aria-label="${ES.t('locale.group')}"`);
    for (const locale of LOCALES) {
      expect(group, locale).toContain(`href="${publicPathFor(locale)}" hrefLang="${locale}"`);
      expect(group, locale).toContain(
        `aria-label="${ES.t('nav.localeLabel', { language: localeName(locale) })}"`,
      );
      expect(group, locale).toContain(`>${locale}</a>`);
    }
    expect(group.split('aria-current="page"').length - 1).toBe(1);
    expect(group.split('locale-group__cell').length - 1).toBe(5);
  });

  it('repeats the navigation and the locale list in the index panel, with one check mark', () => {
    const panel = between(header, '<details class="site-header__index"', '</details>');
    expect(panel).toContain(
      `<summary class="site-header__index-trigger" aria-label="${ES.t('nav.index')}">`,
    );

    const list = between(panel, '<ul class="index-panel__locales"', '</ul>');
    expect(list).toContain(`aria-label="${ES.t('locale.group')}"`);
    expect(list.split('<li>').length - 1).toBe(5);
    for (const locale of LOCALES) {
      expect(list, locale).toContain(`href="${publicPathFor(locale)}" hrefLang="${locale}"`);
      expect(list, locale).toContain(`<span>${localeName(locale)}</span>`);
    }
    expect(list.split('aria-current="page"').length - 1).toBe(1);
    // The check glyph is the one marker of the current locale: a mutant that drops or duplicates
    // it makes the list state a different fact.
    expect(list.split('<svg').length - 1).toBe(1);

    const stamp = between(panel, '<p class="index-panel__stamp">', '</p>');
    expect(bareText(stamp)).toBe(`${ES.t('hero.snapshotLabel')} ${long}`);
  });

  it('labels the theme controls from the content model', () => {
    const panel = between(header, '<details class="site-header__index"', '</details>');
    const group = between(panel, '<fieldset class="index-panel__theme">', '</fieldset>');
    expect(group).toContain(`<legend>${ES.t('theme.label')}</legend>`);
    expect(group.split('<span>').length - 1).toBe(3);
    for (const choice of ['system', 'light', 'dark'] as const) {
      expect(group, choice).toContain(`<span>${ES.t(`theme.${choice}` as LocaleKey)}</span>`);
    }

    // The 40px toggle states the current choice (system at first render) in both its name and title.
    expect(header).toContain(
      `aria-label="${ES.t('theme.label')}: ${ES.t('theme.system')}" title="${ES.t('theme.system')}"`,
    );
  });
});
