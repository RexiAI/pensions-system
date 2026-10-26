import { describe, expect, it } from 'vitest';
import { AgreementSection } from '../../web/components/registers/AgreementSection';
import { DisputeSection } from '../../web/components/registers/DisputeSection';
import { ThesisSection } from '../../web/components/registers/ThesisSection';
import { citationRegistry } from '../../web/content/citations';
import {
  REGISTER_ROWS,
  findThesisTerms,
  headingCountProblem,
  statedCount,
  thesisVocabularyLocations,
  thesisVocabularyOutsideThesis,
} from '../../web/content/registers';
import { RegisterKey } from '../../web/components/public/RegisterKey';
import { createRegistry } from '../../web/content/registry';
import type { LocaleDocument } from '../../web/content/types';
import esDocument from '../../web/content/data/ES/es.json';
import { LOCALES } from '../../web/content/types';
import { contentRegistry } from '../../web/content/registry';
import { PLATE_FIXTURES, content, renderComponent, renderPlate } from '../fixtures/figures';
import { listSourceFiles, readSource, stripComments } from '../helpers/source-scan';

const THESIS_TERMS = ['pirámide', 'piramide', 'pyramid', 'pyramide', 'fraude', 'fraud', 'estafa', 'betrug'];

function containsThesisTerm(html: string): string | null {
  const lower = html.toLowerCase();
  return THESIS_TERMS.find((term) => lower.includes(term)) ?? null;
}

describe('thesis / dispute / agreement structure', () => {
  it('AC-001-41: the fraud reading appears only in the thesis section', () => {
    const html = renderComponent(ThesisSection, { content: content('es') });

    expect(containsThesisTerm(html)).not.toBeNull();
    for (const fixture of PLATE_FIXTURES) {
      const plate = renderPlate(fixture());
      expect(containsThesisTerm(plate)).toBeNull();
    }
    const agreement = renderComponent(AgreementSection, { content: content('es'), citations: citationRegistry });
    const dispute = renderComponent(DisputeSection, { content: content('es'), citations: citationRegistry });
    expect(containsThesisTerm(agreement)).toBeNull();
    expect(containsThesisTerm(dispute)).toBeNull();
    for (const locale of LOCALES) {
      const result = contentRegistry.get('ES', locale);
      if (!result.ok) throw new Error(`locale ${locale} failed`);
      expect(thesisVocabularyOutsideThesis(result.content.strings, result.content.editorial)).toEqual([]);
      expect(thesisVocabularyLocations(result.content.editorial).length).toBeGreaterThan(0);
    }
  });

  it('AC-001-42: metric components do not reference thesis content', () => {
    const files = [
      ...listSourceFiles('web/components/metrics'),
      ...listSourceFiles('web/components/charts'),
      'web/components/FigureFrame.tsx',
      'web/components/DataTable.tsx',
      'web/components/ReadoutStrip.tsx',
      'web/components/ProvenanceStrip.tsx',
    ];
    expect(files.length).toBeGreaterThan(3);
    const offenders: string[] = [];
    for (const file of files) {
      const source = stripComments(readSource(file)).toLowerCase();
      for (const needle of ['thesis', 'registers/', 'pirámide', 'piramide', 'pyramid', 'fraude', 'estafa']) {
        if (source.includes(needle)) offenders.push(`${file}: ${needle}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('AC-001-43: agreement, dispute and thesis are three distinct sections', () => {
    const agreement = renderComponent(AgreementSection, { content: content('es'), citations: citationRegistry });
    const dispute = renderComponent(DisputeSection, { content: content('es'), citations: citationRegistry });
    const thesis = renderComponent(ThesisSection, { content: content('es') });

    expect(agreement).toContain('data-register="agreement"');
    expect(dispute).toContain('data-register="dispute"');
    expect(thesis).toContain('data-register="thesis"');
    expect(agreement).not.toContain('data-register="thesis"');
    expect(dispute).not.toContain('class="claim"');
    expect(thesis).toContain('thesis__statement');
    expect(thesis).toContain('thesis__disclaimer');
    expect(agreement).not.toContain('dossier__position');
    // Three components, three modules, three content types (T10).
    expect(findThesisTerms('una pirámide de pagos')).toContain('pirámide');
    expect(findThesisTerms('aritmética sin opinión')).toEqual([]);
  });

  it('AC-001-91: a heading count matches the registers actually rendered', () => {
    for (const locale of LOCALES) {
      const page = renderComponent(RegisterKey, { content: content(locale) });
      const rendered = page.split('class="register-key__row"').length - 1;
      const heading = page.slice(page.indexOf('register-key-heading'), page.indexOf('</h2>'));
      const strings = content(locale).strings;

      expect(rendered, locale).toBe(REGISTER_ROWS.length);
      // The heading carries a count slot filled from the rendered rows, not authored prose.
      expect(strings['register.key.heading'], locale).toContain('{count}');
      expect(heading, locale).toContain(String(rendered));
      expect(heading, locale).not.toContain('{count}');
      expect(statedCount(strings['register.key.heading'].replace('{count}', String(rendered)), locale)).toBe(
        rendered,
      );
      expect(headingCountProblem(strings, locale), locale).toBeNull();
    }
  });

  it('AC-001-91: a prose count that contradicts the rendered registers is rejected', () => {
    const document = esDocument as unknown as LocaleDocument;
    const stale = { ...document.strings, 'register.key.heading': 'Las tres voces de esta página' };
    const registry = createRegistry([{ ...document, strings: stale }]);
    const result = registry.get('ES', 'es');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('incomplete-content');
    expect(result.error.detail).toContain('heading-count');
    expect(result.error.detail).toContain('states 3');
  });
});
