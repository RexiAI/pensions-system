import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ScopeMark } from '../../web/components/public/ScopeMark';
import { ProvenanceStrip } from '../../web/components/ProvenanceStrip';
import { PublicPage } from '../../web/components/PublicPage';
import { citationRegistry } from '../../web/content/citations';
import { contentRegistry, createRegistry } from '../../web/content/registry';
import { LOCALES } from '../../web/content/types';
import type { LocaleDocument } from '../../web/content/types';
import { pageMetadata } from '../../web/seo/metadata';
import { shareCard } from '../../web/seo/share-card';
import { PLATE_FIXTURES, content, renderComponent, renderPlate } from '../fixtures/figures';
import { listSourceFiles, readSource } from '../helpers/source-scan';

const ES = content('es');
const COUNTRY_NAMES = ['España', 'Spain', 'Espagne', 'Spanien', 'Spagna'];

function pageHtml(locale: string): string {
  const figures = PLATE_FIXTURES.map((fixture) => fixture());
  return renderComponent(PublicPage, {
    content: content(locale),
    figures,
    citations: citationRegistry,
    freshnessWindowDays: 45,
    stale: false,
  });
}

describe('AC-001-102: the scope mark renders from the country record in every locale', () => {
  it('AC-001-102: the first viewport carries the name and the scope clause from the record', () => {
    for (const locale of LOCALES) {
      const page = content(locale);
      const html = pageHtml(locale);
      expect(html, locale).toContain(page.country.name);
      expect(html, locale).toContain(page.country.scopeClause);
      expect(html, locale).toContain('data-scope="text"');
    }
  });

  it('AC-001-102: the headline names the country in every locale', () => {
    for (const locale of LOCALES) {
      const page = content(locale);
      expect(page.t('hero.statement'), locale).toContain(page.country.name);
      expect(pageHtml(locale), locale).toContain(page.country.name);
    }
  });

  it('AC-001-102: every figure strip renders Ámbito from the record, never empty', () => {
    for (const locale of LOCALES) {
      const page = content(locale);
      for (const fixture of PLATE_FIXTURES) {
        const html = renderComponent(ProvenanceStrip, {
          manifest: fixture().manifest,
          figureId: fixture().figureId,
          freshnessWindowDays: 45,
          content: page,
        });
        expect(html, `${locale}/${fixture().figureId}`).toContain(page.t('provenance.scope'));
        expect(html).toContain(page.country.name);
        expect(html).not.toContain('<dt>' + page.t('provenance.scope') + '</dt><dd><ul class="provenance__list"></ul>');
      }
    }
  });

  it('AC-001-102: the figure table caption names the scope', () => {
    for (const locale of LOCALES) {
      const page = content(locale);
      const html = renderPlate(PLATE_FIXTURES[0](), locale);
      const caption = html.slice(html.indexOf('<caption>'), html.indexOf('</caption>'));
      expect(caption, locale).toContain(page.country.name);
      expect(caption, locale).toContain(page.t('fig.01.title'));
    }
  });

  it('AC-001-102: the <title> and og:title take a scope suffix from the record', () => {
    for (const locale of LOCALES) {
      const page = content(locale);
      const meta = pageMetadata(locale);
      expect(meta.title, locale).toContain(page.country.name);
      expect(meta.ogTitle, locale).toContain(page.country.name);
      expect(meta.title).not.toMatch(/\d/);
    }
  });

  it('AC-001-102: the share card carries the scope line and no metric, number or date', () => {
    for (const locale of LOCALES) {
      const card = shareCard(locale);
      expect(card, locale).not.toBeNull();
      if (!card) return;
      const page = content(locale);
      expect(card.alt, locale).toContain(page.country.name);
      const html = renderToStaticMarkup(card.element);
      expect(html, locale).toContain(page.country.name);
      // The card's *text* carries no digit: no metric, no number, no date (D7).
      const text = html.replace(/<[^>]+>/g, ' ').replace(/&#?\w+;/g, ' ');
      expect(text, locale).not.toMatch(/\d/);
    }
  });

  it('AC-001-102: no component hardcodes a country name', () => {
    for (const file of listSourceFiles('web/components')) {
      const source = readSource(file);
      for (const name of COUNTRY_NAMES) {
        expect(source, `${file} hardcodes ${name}`).not.toContain(name);
      }
    }
  });
});

describe('AC-001-103: a hero statement that omits the country name fails the build', () => {
  const shipped = contentRegistry.get('ES', 'es');
  if (!shipped.ok) throw new Error('missing shipped content');
  const shippedContent = shipped.content;

  function documentWith(overrides: Partial<LocaleDocument>): LocaleDocument {
    return {
      country: 'ES',
      countryName: shippedContent.country.name,
      scopeClause: shippedContent.country.scopeClause,
      locale: 'es',
      strings: shippedContent.strings,
      editorial: shippedContent.editorial,
      ...overrides,
    };
  }

  it('AC-001-103: a statement without the country name is rejected', () => {
    const doc = documentWith({
      strings: { ...shippedContent.strings, 'hero.statement': 'La aritmética de las pensiones' },
    });
    const broken = contentRegistryFrom(doc);
    expect(broken.ok).toBe(false);
    if (broken.ok) return;
    expect(broken.error.code).toBe('incomplete-content');
    expect(broken.error.detail).toContain('scope-statement');
  });

  it('AC-001-103: a record missing name or scopeClause is rejected', () => {
    for (const override of [{ countryName: '' }, { scopeClause: '   ' }] as Partial<LocaleDocument>[]) {
      const broken = contentRegistryFrom(documentWith(override));
      expect(broken.ok).toBe(false);
      if (broken.ok) return;
      expect(broken.error.detail).toContain('country-record');
    }
  });

  it('AC-001-103: the build gate is wired into the build, not a review habit', () => {
    const pkg = JSON.parse(readSource('package.json')) as { scripts: Record<string, string> };
    expect(pkg.scripts.prebuild).toContain('check-content-scope.ts');
    expect(readSource('scripts/check-content-scope.ts')).toContain('validateDocument');
  });

  it('AC-001-103: every shipped locale passes the check', () => {
    for (const locale of LOCALES) {
      expect(contentRegistry.get('ES', locale).ok, locale).toBe(true);
    }
  });
});

describe('AC-001-104: one geo is text, two or more is the index, never a disabled control', () => {
  it('AC-001-104: a single published country renders as plain text', () => {
    const html = renderComponent(ScopeMark, {
      content: ES,
      countries: [{ geo: 'ES', name: ES.country.name, href: '/' }],
    });
    expect(html).toContain('data-scope="text"');
    expect(html).not.toContain('<details');
    expect(html).not.toContain('<select');
    expect(html).not.toContain('disabled');
  });

  it('AC-001-104: two published countries render as the country index', () => {
    const html = renderComponent(ScopeMark, {
      content: ES,
      countries: [
        { geo: 'ES', name: 'España', href: '/' },
        { geo: 'PT', name: 'Portugal', href: '/pt' },
      ],
    });
    expect(html).toContain('<details');
    expect(html).toContain('Portugal');
    expect(html).not.toContain('<select');
    expect(html).not.toContain('disabled');
    // No geo code reaches the page: the reader sees names, not `ES`/`PT`.
    expect(html).not.toContain('>ES<');
    expect(html).not.toContain('>PT<');
  });
});

/** The registry over one synthetic document, so a content bug can be exercised directly. */
function contentRegistryFrom(doc: LocaleDocument) {
  return createRegistry([doc]).get('ES', 'es');
}
