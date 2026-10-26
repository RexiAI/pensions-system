import { describe, expect, it } from 'vitest';
import { createRegistry, contentRegistry } from '../../web/content/registry';
import { missingKeys, REQUIRED_KEYS } from '../../web/content/keys';
import type { LocaleDocument } from '../../web/content/types';
import { LOCALES } from '../../web/content/types';
import { MetricPlate } from '../../web/components/metrics/MetricPlate';
import { content as esContent, dependencyFigure, renderComponent } from '../fixtures/figures';
import { jsxLiterals, listSourceFiles, readSource } from '../helpers/source-scan';

describe('content model keyed by country and locale', () => {
  it('AC-001-33: all five locales return complete content for Spain', () => {
    for (const locale of LOCALES) {
      const result = contentRegistry.get('ES', locale);
      expect(result.ok, `locale ${locale} must resolve`).toBe(true);
      if (!result.ok) continue;
      expect(missingKeys(result.content.strings)).toEqual([]);
      expect(Object.keys(result.content.strings).length).toBe(REQUIRED_KEYS.length);
      expect(result.content.editorial.agreement.length).toBeGreaterThan(0);
      expect(result.content.editorial.disputes.length).toBeGreaterThan(0);
      expect(result.content.editorial.disputes[0]?.positions.length).toBe(2);
      expect(result.content.editorial.thesis.statement.length).toBeGreaterThan(0);
    }
    expect(contentRegistry.locales('ES')).toEqual([...LOCALES]);
  });

  it('AC-001-34: an unsupported locale yields a defined error, never a fallback', () => {
    const result = contentRegistry.get('ES', 'pt');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('unsupported-locale');
    expect('content' in result).toBe(false);
  });

  it('AC-001-35: no user-facing string literal appears in a metric component', () => {
    const files = listSourceFiles('web/components');
    expect(files.length).toBeGreaterThan(10);
    const offenders: string[] = [];
    for (const file of files) {
      const source = readSource(file);
      for (const literal of jsxLiterals(source)) {
        offenders.push(`${file}: ${literal.kind} "${literal.value}"`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('AC-001-36: a second country is data, not code', () => {
    const esDocument = contentRegistry.get('ES', 'es');
    expect(esDocument.ok).toBe(true);
    if (!esDocument.ok) return;
    const secondCountry: LocaleDocument = {
      country: 'PT',
      locale: 'es',
      strings: { ...esDocument.content.strings, 'fig.01.title': 'Racio de dependencia' },
      editorial: esDocument.content.editorial,
    };
    const shippedDocument: LocaleDocument = {
      country: 'ES',
      locale: 'es',
      strings: esDocument.content.strings,
      editorial: esDocument.content.editorial,
    };
    const registry = createRegistry([shippedDocument, secondCountry]);
    const pt = registry.get('PT', 'es');
    expect(pt.ok).toBe(true);
    if (!pt.ok) return;

    const html = renderComponent(MetricPlate, {
      figureNumber: 1,
      figure: dependencyFigure(),
      content: pt.content,
      freshnessWindowDays: 45,
    });
    expect(html).toContain('Racio de dependencia');
    expect(registry.countries()).toEqual(['ES', 'PT']);
    expect(contentRegistry.get('PT', 'es').ok).toBe(false);
  });

  it('AC-001-33: a locale document missing a key is incomplete, not silently rendered', () => {
    const esDocument = contentRegistry.get('ES', 'es');
    if (!esDocument.ok) throw new Error('fixture locale missing');
    const broken: Record<string, string> = { ...esDocument.content.strings };
    delete broken['hero.statement'];
    const registry = createRegistry([
      { country: 'ES', locale: 'es', strings: broken, editorial: esDocument.content.editorial },
    ]);
    const result = registry.get('ES', 'es');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('incomplete-content');
    expect(result.error.detail).toContain('hero.statement');
  });

  it('AC-001-33: every locale resolves every interpolated template', () => {
    for (const locale of LOCALES) {
      const result = contentRegistry.get('ES', locale);
      if (!result.ok) throw new Error(`locale ${locale} failed`);
      const rendered = result.content.t('fig.tableSummary', { count: 12 });
      expect(rendered).toContain('12');
      expect(rendered).not.toContain('{count}');
      expect(result.content.t('nav.localeLabel', { language: 'x' })).not.toContain('{language}');
      expect(esContent(locale).strings['site.wordmark']).toBe(result.content.strings['site.wordmark']);
    }
  });
});
