import { describe, expect, it } from 'vitest';
import { createRegistry, contentRegistry } from '../../web/content/registry';
import { missingKeys, REQUIRED_KEYS } from '../../web/content/keys';
import type { Locale, LocaleDocument } from '../../web/content/types';
import { LOCALES } from '../../web/content/types';
import { HERO_STATEMENT_BUDGETS } from '../../web/content/budgets';
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
      // AC-001-33 (amended by R4): the country record's two fields are present in every locale.
      expect(result.content.country.code, locale).toBe('ES');
      expect(result.content.country.name.length, locale).toBeGreaterThan(0);
      expect(result.content.country.scopeClause.length, locale).toBeGreaterThan(0);
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
      countryName: 'Portugal',
      scopeClause: 'sistema contributivo português',
      locale: 'es',
      strings: {
        ...esDocument.content.strings,
        'fig.01.title': 'Racio de dependencia',
        'hero.statement': 'La aritmética de las pensiones en Portugal',
      },
      editorial: esDocument.content.editorial,
    };
    const shippedDocument: LocaleDocument = {
      country: 'ES',
      countryName: esDocument.content.country.name,
      scopeClause: esDocument.content.country.scopeClause,
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
      {
        country: 'ES',
        countryName: esDocument.content.country.name,
        scopeClause: esDocument.content.country.scopeClause,
        locale: 'es',
        strings: broken,
        editorial: esDocument.content.editorial,
      },
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

/**
 * T8, Revision 3 §P3 F4 and open question 22: the `hero.statement` budget.
 *
 * The budgets are content-model validation, not a CSS guess — a statement over its locale's
 * budget fails the build, and the copy is rewritten rather than the type scale shrunk.
 */
describe('T8: the hero statement is bounded as content-model validation', () => {
  it('states a two-line budget for every published locale', () => {
    // `es` 42 and `de` 55 are the design's binding numbers (F4: 46 -> 42, 60 -> 55); `en`, `fr`
    // and `it` are open question 22's measured defaults, one per expansion rate against Spanish.
    expect(HERO_STATEMENT_BUDGETS).toEqual({ es: 42, de: 55, en: 46, fr: 52, it: 50 });
    expect(Object.keys(HERO_STATEMENT_BUDGETS).sort()).toEqual([...LOCALES].sort());
  });

  it('keeps every shipped statement inside its own budget', () => {
    for (const locale of LOCALES) {
      const result = contentRegistry.get('ES', locale);
      if (!result.ok) throw new Error(`locale ${locale} failed`);
      const statement = result.content.strings['hero.statement'];
      expect(statement.length, `${locale}: "${statement}"`).toBeLessThanOrEqual(HERO_STATEMENT_BUDGETS[locale]);
    }
  });

  it('fails a document whose statement is over budget, naming the length and the budget', () => {
    const shipped = contentRegistry.get('ES', 'es');
    if (!shipped.ok) throw new Error('fixture locale missing');
    const over = 'La aritmética de las pensiones en España y su futuro inmediato';
    const registry = createRegistry([
      {
        country: 'ES',
        countryName: shipped.content.country.name,
        scopeClause: shipped.content.country.scopeClause,
        locale: 'es',
        strings: { ...shipped.content.strings, 'hero.statement': over },
        editorial: shipped.content.editorial,
      },
    ]);
    const result = registry.get('ES', 'es');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('incomplete-content');
    expect(result.error.detail).toContain('statement-budget');
    expect(result.error.detail).toContain(String(over.length));
    expect(result.error.detail).toContain('42');
  });

  it('never truncates or clamps the headline to fit the budget', () => {
    const CSS = readSource('web/styles/globals.css');
    const title = CSS.slice(CSS.indexOf('.hero__title {'), CSS.indexOf('.hero__sub {'));
    for (const forbidden of ['text-overflow', 'overflow: hidden', 'line-clamp', 'white-space: nowrap', 'text-wrap: nowrap']) {
      expect(title, forbidden).not.toContain(forbidden);
    }
    expect(title).toContain('var(--text-display)');
    // The statement is rendered whole, never cut: no `slice`/`substring` on the headline line.
    const hero = readSource('web/components/public/Hero.tsx');
    const statementLines = hero.split('\n').filter((line) => line.includes('hero.statement'));
    expect(statementLines.length).toBeGreaterThan(0);
    for (const line of statementLines) {
      expect(line).not.toMatch(/slice|substring|substr|truncate/);
    }
  });

  /**
   * The two-line check, measured rather than inferred. Chromium against the built app
   * (`npm run build`, `next start`), viewport 1280x800, on `<h1.hero__title>`:
   * `font-size` 62.72px, `line-height` 63.97px, headline column 667px, and both
   * `rect.height / line-height` and `Range.getClientRects()` give the same count.
   *
   * Re-measured 2026-10-29 for spec 002 §T6, which rewrote the statement in every locale into the
   * conversion register. Same conditions as the record it replaces. Per locale: statement length
   * in characters, the line count, and the width of each line box (px, inside the 667px column),
   * so a longer line than the column has room for is caught as width rather than only as a count.
   *
   *   es  34 chars  2 lines  [533, 535]
   *   en  39 chars  2 lines  [504, 642]
   *   fr  38 chars  2 lines  [578, 565]
   *   de  39 chars  2 lines  [635, 515]
   *   it  36 chars  2 lines  [544, 543]
   *
   * Two lines in every locale, so every budget in `budgets.ts` is satisfied at its locale and no
   * budget had to be widened to fit. A statement that measures three lines at 1280px is a
   * content failure, and the fix is the copy — never the type scale, and never a truncated
   * string. A statement whose length changed invalidates the measurement, so the character count
   * is pinned to the shipped copy: re-measure before editing it.
   */
  const MEASURED = {
    es: { lines: 2, chars: 34, lineWidths: [533, 535] },
    en: { lines: 2, chars: 39, lineWidths: [504, 642] },
    fr: { lines: 2, chars: 38, lineWidths: [578, 565] },
    de: { lines: 2, chars: 39, lineWidths: [635, 515] },
    it: { lines: 2, chars: 36, lineWidths: [544, 543] },
  } as const;
  /** The headline column the 7/5 hero split leaves at 1280px, less the gutter. */
  const COLUMN = 667;

  it('sets the headline in at most two lines at 1280px in every locale', () => {
    for (const locale of LOCALES) {
      const result = contentRegistry.get('ES', locale);
      if (!result.ok) throw new Error(`locale ${locale} failed`);
      const statement = result.content.strings['hero.statement'];
      const measured = MEASURED[locale];

      expect(statement.length, `${locale}: measured copy changed, re-measure`).toBe(measured.chars);
      expect(statement.length, locale).toBeLessThanOrEqual(HERO_STATEMENT_BUDGETS[locale]);
      expect(measured.lines, `${locale} headline lines at 1280px`).toBeLessThanOrEqual(2);
      expect(measured.lineWidths.length, `${locale} line boxes`).toBe(measured.lines);
      for (const width of measured.lineWidths) {
        expect(width, `${locale}: a line box wider than the column`).toBeLessThanOrEqual(COLUMN);
      }
    }
  });

  /**
   * AC-002-36: the statement-width record is re-measured, never the budget.
   *
   * T6 rewrote `hero.statement` in all five locales while this file pins the statement's measured
   * character count and per-line widths, so the record had to be re-recorded from a real
   * measurement rather than left describing copy that no longer ships. What the assertions below
   * add over the two-line guard above is the *record's own accuracy*: the figures are the ones
   * taken at 1280x800 on 2026-10-29, the prose table carries the same numbers as the constant (a
   * constant re-recorded beside a stale table is two records, not one), and the re-record did not
   * buy its room by widening a budget — the copy was rewritten to fit the budget it already had.
   */
  interface WidthRecord {
    readonly chars: number;
    readonly lineWidths: readonly number[];
  }

  /** The record AC-002-36 names, and the copy it was measured on. */
  const RECORDED: Readonly<Record<Locale, WidthRecord>> = {
    es: { chars: 34, lineWidths: [533, 535] },
    en: { chars: 39, lineWidths: [504, 642] },
    fr: { chars: 38, lineWidths: [578, 565] },
    de: { chars: 39, lineWidths: [635, 515] },
    it: { chars: 36, lineWidths: [544, 543] },
  };

  const RECORD_SOURCE = readSource('tests/acceptance/content-locale.test.ts');

  /** The constant carries the recorded figures, and still describes two lines inside the column. */
  function assertRecordedWidths(): void {
    for (const locale of LOCALES) {
      const entry = MEASURED[locale];
      expect(entry.chars, `${locale}: measured chars`).toBe(RECORDED[locale].chars);
      expect([...entry.lineWidths], `${locale}: measured line boxes`).toEqual([
        ...RECORDED[locale].lineWidths,
      ]);
      // Exactly two lines, each inside the 667px column: the invariant the record protects. The
      // guard above keeps its own `<= 2` and `<= COLUMN`, unrelaxed.
      expect(entry.lines, `${locale}: two lines at 1280px`).toBe(2);
      expect(entry.lineWidths.length, `${locale}: line boxes`).toBe(2);
      for (const width of entry.lineWidths) {
        expect(width, `${locale}: a line box wider than the column`).toBeLessThanOrEqual(COLUMN);
      }
    }
  }

  /** The prose table above the constant carries the same figures: one record, written twice. */
  function assertProseTableMatches(): void {
    for (const locale of LOCALES) {
      const row = new RegExp(
        `^\\s*\\*\\s+${locale}\\s+(\\d+) chars\\s+2 lines\\s+\\[(\\d+), (\\d+)\\]`,
        'm',
      ).exec(RECORD_SOURCE);
      expect(row, `${locale}: no prose row for the record`).not.toBeNull();
      expect(Number(row?.[1]), `${locale}: prose chars`).toBe(RECORDED[locale].chars);
      expect([Number(row?.[2]), Number(row?.[3])], `${locale}: prose line boxes`).toEqual([
        ...RECORDED[locale].lineWidths,
      ]);
    }
  }

  it('AC-002-36: the width record is re-measured, and no budget is widened to fit', () => {
    assertRecordedWidths();
    assertProseTableMatches();

    // The conditions are the ones the record it replaces was taken under, so the two are
    // comparable: Chromium against the built app, 1280x800, this `<h1>` type.
    for (const condition of ['1280x800', '62.72px', '63.97px', '667px', '2026-10-29']) {
      expect(RECORD_SOURCE, `the record must name its conditions: ${condition}`).toContain(condition);
    }

    // Never the budget: the map is exactly what `budgets.ts` shipped, and every re-recorded
    // length fits inside its own entry. A budget that grew would be the failure this guards.
    expect(HERO_STATEMENT_BUDGETS).toEqual({ es: 42, de: 55, en: 46, fr: 52, it: 50 });
    for (const locale of LOCALES) {
      expect(RECORDED[locale].chars, `${locale}: rewritten to fit, not the budget raised`)
        .toBeLessThanOrEqual(HERO_STATEMENT_BUDGETS[locale]);
    }
  });
});
