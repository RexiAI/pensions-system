import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  COUNTDOWN_THRESHOLD,
  computeCountdown,
  firstYearAtOrAbove,
  observedDependency,
  readDependencySeries,
} from '../../web/series/countdown';
import type { CountdownValue } from '../../web/series/countdown';
import { CountdownBlock } from '../../web/components/series/CountdownBlock';
import { Hero } from '../../web/components/public/Hero';
import { content, dependencyFigure, renderComponent, shareFigure } from '../fixtures/figures';
import { committedPayload, countdownValue, seriesSnapshots, countdownSeries } from '../fixtures/series';

const ES = content('es');
const projected = committedPayload('eurostat-proj-23np-ratio');
const observed = committedPayload('eurostat-demo-pjan');

function countdownAt(threshold: number): CountdownValue {
  return computeCountdown({ projected, observed, snapshotYear: 2026, threshold });
}

function renderCountdown(value: CountdownValue, locale = 'es'): string {
  return renderComponent(CountdownBlock, { content: content(locale), countdown: value });
}

describe('AC-001-98: the ratio is pinned to the variant and the age definition; the threshold is a parameter', () => {
  it('AC-001-98: the ratio is drawn entirely from proj_23np, including its 2025 back-cast', () => {
    const series = readDependencySeries(projected, { variant: 'BSL' });
    expect(series[0]?.year).toBe(2022);
    expect(series.some((point) => point.year === 1995)).toBe(false);
    expect(series.find((point) => point.year === 2025)?.ratio).toBe(31.91);

    // The verified values from the design, reproduced from the committed snapshot.
    const at = (year: number) => series.find((point) => point.year === year)?.ratio;
    expect([at(2030), at(2034), at(2038), at(2042), at(2050)]).toEqual([36.2, 40.54, 45.56, 51.32, 58.97]);
    expect(Math.max(...series.map((point) => point.ratio))).toBe(65.81);
  });

  it('AC-001-98: the crossing year is derived from the threshold, not authored', () => {
    expect(countdownAt(50).thresholdYear).toBe(2042);
    expect(countdownAt(COUNTDOWN_THRESHOLD).thresholdYear).toBe(2042);

    const lower = countdownAt(40).thresholdYear;
    const higher = countdownAt(60).thresholdYear;
    expect(lower).not.toBeNull();
    expect(higher).not.toBeNull();
    expect(lower as number).toBeLessThan(2042);
    expect(higher as number).toBeGreaterThan(2042);
  });

  it('AC-001-98: the published series never mixes the observation into the projection', () => {
    const value = countdownValue();
    expect(value.backCast?.projected).toBe(31.91);
    expect(value.backCast?.observed).toBe(31.22);
    expect(value.backCast?.difference).toBe(0.69);
    // The disclosure's observation comes from demo_pjan, on the same 15-64 definition.
    expect(observedDependency(observed, 2025)).toBe(31.22);
    // The same year on a 20-64 denominator would read 34.03: the definition is why the page
    // pins 15-64 rather than choosing whichever denominator flatters the number.
    expect(observedDependency(observed, 2025, '20-64')).toBe(34.03);
  });

  it('AC-001-98: firstYearAtOrAbove answers the first crossing and nothing later', () => {
    const points = [
      { year: 2022, ratio: 30.46 },
      { year: 2023, ratio: 51.0 },
      { year: 2024, ratio: 55.0 },
    ];
    expect(firstYearAtOrAbove(points, 50)).toBe(2023);
    expect(firstYearAtOrAbove(points, 60)).toBeNull();
    expect(firstYearAtOrAbove([], 50)).toBeNull();
  });
});

describe('AC-001-99: the countdown is the difference of two printed integers', () => {
  const value = countdownValue();

  it('AC-001-99: years is thresholdYear minus snapshotYear, both integers', () => {
    expect(value.state).toBe('computed');
    expect(value.thresholdYear).toBe(2042);
    expect(value.snapshotYear).toBe(2026);
    expect(value.years).toBe(16);
    expect(Number.isInteger(value.years)).toBe(true);
    expect(Number.isInteger(value.thresholdYear)).toBe(true);
  });

  it('AC-001-99: both integers are printed beside the number, and the years quantity carries no sub-annual unit', () => {
    const html = renderCountdown(value);
    expect(html).toContain('2042');
    expect(html).toContain('2026');
    expect(html).toContain('16');

    // The rule is scoped as Revision 3 rewrote it: the years quantity carries no sub-annual
    // unit, and the clock is a separate quantity with its own anchor, definition and scenarios
    // (AC-001-108…AC-001-119). Spec 002 §T3 moved the numeral into the clock's own centred
    // group, so the assertion is made on the numeral wherever it now renders — no longer on a
    // slice that ends at `class="clock"` — and, as before, on the whole block above the clock.
    const numeralAt = html.indexOf('class="countdown__value"');
    expect(numeralAt).toBeGreaterThan(-1);
    const numeral = html.slice(numeralAt, html.indexOf('</p>', numeralAt));
    expect(numeral).toContain('16');
    const aboveClock = html.slice(0, html.indexOf('class="clock"'));
    for (const unit of ['día', 'dias', 'días', 'mes', 'meses', 'hora', 'horas', 'minuto', 'minutos', 'segundo']) {
      expect(numeral.toLowerCase(), unit).not.toContain(unit);
      expect(aboveClock.toLowerCase(), unit).not.toContain(unit);
    }
  });

  it('AC-002-17: AC-001-99 keeps its invariant while the years numeral relocates', () => {
    // The authorized rewrite (`docs/TESTING.md §Tests That Encode a Defect`): the slice the old
    // assertion used located the numeral in the projection block above the rail, which is the
    // structure spec 002 reverts. The invariant — no sub-annual unit on the years quantity — is
    // re-pointed, not relaxed.
    const source = readFileSync('tests/acceptance/countdown.test.ts', 'utf8');
    const body = source.slice(
      source.indexOf("it('AC-001-99: both integers are printed beside the number"),
      source.indexOf("\n  });", source.indexOf("it('AC-001-99: both integers are printed beside the number")),
    );
    expect(body).not.toContain("projectionGroup.indexOf('class=\"countdown__value\"')");
    expect(body).toContain("html.indexOf('class=\"countdown__value\"')");

    // And it still holds on the rendered block: neither the numeral nor the prose above the clock
    // has acquired an annual-or-shorter unit.
    const html = renderCountdown(value);
    const numeralAt = html.indexOf('class="countdown__value"');
    expect(html.slice(numeralAt, html.indexOf('</p>', numeralAt))).toContain('16');
    for (const unit of ['día', 'dias', 'días', 'mes', 'meses', 'hora', 'horas', 'minuto', 'minutos', 'segundo']) {
      expect(html.slice(numeralAt, html.indexOf('</p>', numeralAt)).toLowerCase(), unit).not.toContain(unit);
    }
    expect(body).toContain('AC-001-99');
  });

  it('AC-001-99: no icon, no ticking element and no live region', () => {
    const html = renderCountdown(value);
    expect(html).not.toContain('<svg');
    expect(html).not.toContain('aria-live');
    expect(html).not.toContain('<time');
    expect(html).not.toContain('animation');
  });
});

describe('AC-001-100: the range is computed over all six variants', () => {
  const value = countdownValue();

  it('AC-001-100: every published variant contributes its crossing year', () => {
    expect(value.variants.map((entry) => entry.variant).sort()).toEqual([
      'BSL',
      'HMIGR',
      'LFRT',
      'LMIGR',
      'LMRT',
      'NMIGR',
    ]);
    const byVariant = Object.fromEntries(value.variants.map((entry) => [entry.variant, entry.thresholdYear]));
    expect(byVariant).toEqual({ BSL: 2042, HMIGR: 2043, LFRT: 2041, LMIGR: 2040, LMRT: 2041, NMIGR: 2039 });
  });

  it('AC-001-100: the printed range is the min and max over the crossing variants', () => {
    expect(value.range).toEqual({ min: 2039, max: 2043 });
    const html = renderCountdown(value);
    expect(html).toContain(ES.t('countdown.range', { min: 2039, max: 2043 }));
  });

  it('AC-001-100: a variant that never crosses is excluded, and the block still stands', () => {
    const high = countdownAt(100);
    expect(high.state).toBe('not-crossed');
    expect(high.range).toBeNull();
    expect(high.variants.every((entry) => entry.thresholdYear === null)).toBe(true);
    expect(renderCountdown(high)).not.toContain('countdown__numeral');
  });
});

describe('AC-001-101: a variant that never crosses renders no numeral and no substitute threshold', () => {
  const notCrossed = countdownAt(90);

  it('AC-001-101: the not-crossed state carries no numeral and states the horizon', () => {
    expect(notCrossed.state).toBe('not-crossed');
    expect(notCrossed.thresholdYear).toBeNull();
    expect(notCrossed.years).toBeNull();
    expect(notCrossed.horizonEnd).toBe(2100);
    const html = renderCountdown(notCrossed);
    expect(html).toContain(ES.t('countdown.notCrossed', { year: 2100 }));
    expect(html).toContain('2100');
    expect(html).not.toContain('countdown__numeral');
    expect(html).not.toContain('2042');
  });

  it('AC-001-101: the hero falls back to the figure ladder with no countdown numeral', () => {
    const html = renderComponent(Hero, {
      content: ES,
      figures: [shareFigure(), dependencyFigure()],
      countdown: notCrossed,
    });
    expect(html).not.toContain('countdown__numeral');
    expect(html).toContain(ES.t('countdown.notCrossed', { year: 2100 }));
    // The figure keeps the largest type, exactly as Revision 1 shipped it.
    expect(html).toContain('class="hero__value"');
    expect(html).not.toContain('hero__value--demoted');
  });
});

describe('the countdown block states the source, the definition and the variant', () => {
  const value = countdownValue();

  it('prints the threshold, the source, the variant range and the definition', () => {
    const html = renderCountdown(value);
    expect(html).toContain(ES.t('countdown.eyebrow'));
    expect(html).toContain(ES.t('countdown.unit'));
    expect(html).toContain(ES.t('countdown.yearLabel'));
    expect(html).toContain(ES.t('countdown.definition'));
    expect(html).toContain(ES.t('countdown.source'));
    expect(html).toContain('countdown__rule');
    expect(html).toContain(ES.t('countdown.backCast', { projected: '31,91', observed: '31,22', year: 2025 }));
  });

  it('renders in every locale without leaking the operator variant code', () => {
    for (const locale of ['es', 'en', 'fr', 'de', 'it'] as const) {
      const html = renderCountdown(value, locale);
      expect(html, locale).not.toContain('BSL');
      expect(html, locale).not.toContain('HMIGR');
      expect(html, locale).toContain('2042');
    }
  });

  it('keeps its own manifest, digest and reproduce path', () => {
    const series = countdownSeries();
    expect(series.availability).toBe('computed');
    expect(series.manifest.formulaId).toBe('old-age-dependency-threshold.v1');
    expect(series.manifest.definitionId).toBe('old-age-dependency-ratio');
    expect(series.manifest.snapshotYear).toBe(2026);
    expect(series.manifest.reproducePath).toBe('scripts/compute.ts');
    expect(series.manifest.inputHash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('the countdown copy obeys the register rules in every locale', () => {
  const BANNED = ['faltan', 'quedan', 'solo', 'apenas', 'cuenta atrás', 'bomba', 'explota'];
  // Second-person address, checked per locale as whole words (a substring match would fire on
  // ordinary words such as the French article `du`).
  const SECOND_PERSON: Readonly<Record<string, readonly string[]>> = {
    es: ['tú', 'tu', 'vosotros', 'vuestro'],
    en: ['you', 'your'],
    fr: ['vous', 'ton', 'ta', 'tes'],
    de: ['du', 'dich', 'dein', 'deine'],
    it: ['tu', 'tuo', 'tua'],
  };

  function countdownStrings(locale: string): string[] {
    const result = content(locale);
    return Object.entries(result.strings)
      .filter(([key]) => key.startsWith('countdown.'))
      .map(([, value]) => value);
  }

  it('never uses the banned urgency vocabulary', () => {
    for (const locale of ['es', 'en', 'fr', 'de', 'it'] as const) {
      for (const text of countdownStrings(locale)) {
        expect(text, `${locale}: ${text}`).not.toContain('!');
        for (const word of BANNED) {
          expect(text.toLocaleLowerCase(), `${locale}: ${text}`).not.toContain(word);
        }
        // `ya` is banned as a word, not as a substring of an ordinary word.
        expect(/\bya\b/.test(text.toLocaleLowerCase()), `${locale}: ${text}`).toBe(false);
        for (const word of SECOND_PERSON[locale] ?? []) {
          expect(new RegExp(`\\b${word}\\b`).test(text.toLocaleLowerCase()), `${locale}: ${text}`).toBe(false);
        }
      }
    }
  });

  it('states the horizon in the not-crossed sentence', () => {
    for (const locale of ['es', 'en', 'fr', 'de', 'it'] as const) {
      expect(content(locale).strings['countdown.notCrossed']).toContain('{year}');
    }
  });

  it('the clock copies obey the extended ban list, in every locale', () => {
    // §P5 extends R2's bans for the clock: the owner's metaphor is the brief, never the copy.
    // `fin` is checked as a word, because it is a substring of ordinary words in three locales.
    const EXTENDED = [
      'destrucción',
      'destruccion',
      'destruction',
      'colapso',
      'collapse',
      'explosión',
      'explosion',
      'se agota',
      'agota',
      'última oportunidad',
      'ultima oportunidad',
      'last chance',
    ];

    for (const locale of ['es', 'en', 'fr', 'de', 'it'] as const) {
      const clock = Object.entries(content(locale).strings)
        .filter(([key]) => key.startsWith('countdown.clock.'))
        .map(([, value]) => value);
      expect(clock.length, locale).toBe(10);
      for (const text of clock) {
        const lower = text.toLocaleLowerCase();
        for (const word of EXTENDED) expect(lower, `${locale}: ${text}`).not.toContain(word);
        expect(/\bfin\b/.test(lower), `${locale}: ${text}`).toBe(false);
        expect(text, `${locale}: ${text}`).not.toContain('!');
      }
    }
  });
});

describe('the series fixtures describe the deployment', () => {
  it('reads both projection snapshots and the observation', () => {
    const snapshots = seriesSnapshots();
    expect(snapshots.size).toBe(3);
    expect(snapshots.get('eurostat-proj-23np-ratio')?.resolved).toBe(true);
  });
});
