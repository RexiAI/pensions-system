import { describe, expect, it } from 'vitest';
import { decodeText } from '../helpers/render-document';
import { MethodRegion } from '../../web/components/public/MethodRegion';
import { StoryStrip } from '../../web/components/public/StoryStrip';
import { FuseLine } from '../../web/components/series/Fuse';
import { canonicalUrl } from '../../web/content/site';
import type { CountryLocaleContent } from '../../web/content/types';
import { DEMO_PJAN_SOURCE, SERIES } from '../../web/ingest/series';
import type { SeriesDefinition } from '../../web/ingest/series-types';
import type { DerivedSeries } from '../../web/ingest/series-types';
import { publicPathFor } from '../../web/seo/routes';
import { pageMetadata } from '../../web/seo/metadata';
import { COUNTDOWN_THRESHOLD, observedDependency } from '../../web/series/countdown';
import { computeFuse } from '../../web/series/fuse';
import { DAYS_PLACEHOLDER } from '../../web/share/links';
import { content, renderComponent } from '../fixtures/figures';
import { committedPayload, countdownValue, seriesFixtures, seriesSnapshots } from '../fixtures/series';

/**
 * Mutation-killing tests for spec 003 (stage 5a), re-pointed at spec 004's composition wherever
 * the element they named moved (`CountdownBand` → `StoryStrip`, `Fuse` → `FuseLine` plus the
 * method region, `PendingBlock` → retired). Each block names the surviving mutant it kills.
 */

const ES = content('es');
const NOW = Date.parse('2026-10-31T10:00:00Z');

function fuseFixture(): DerivedSeries {
  const entry = seriesFixtures().find((candidate) => candidate.seriesId === 'fuse');
  if (!entry) throw new Error('no fuse series');
  return entry;
}

function fuseDefinition(): SeriesDefinition {
  const definition = SERIES.find((candidate) => candidate.seriesId === 'fuse');
  if (!definition) throw new Error('no fuse series definition');
  return definition;
}

/** The committed `demo_pjan` payload, typed as far as these tests reach into it. */
interface JsonStat {
  id: readonly string[];
  size: readonly number[];
  value: Record<string, number>;
  dimension: {
    time: { category: { index: Record<string, number> } };
    age: { category: { index: Record<string, number> } };
  };
}

function coordinates(flat: number, size: readonly number[]): number[] {
  const out: number[] = new Array<number>(size.length).fill(0);
  let rest = flat;
  for (let axis = size.length - 1; axis >= 0; axis -= 1) {
    const width = size[axis] ?? 1;
    out[axis] = rest % width;
    rest = Math.floor(rest / width);
  }
  return out;
}

/** The axes these tests reach into, and the years whose working-age rows are emptied. */
interface Axes {
  age: number;
  time: number;
  codeByPosition: Map<number, string>;
  emptied: Set<number | undefined>;
}

function axesOf(stat: JsonStat, years: readonly string[]): Axes {
  const codeByPosition = new Map<number, string>();
  for (const [code, position] of Object.entries(stat.dimension.age.category.index)) {
    codeByPosition.set(position, code);
  }
  return {
    age: stat.id.indexOf('age'),
    time: stat.id.indexOf('time'),
    codeByPosition,
    emptied: new Set(years.map((year) => stat.dimension.time.category.index[year])),
  };
}

/** Zero one row when it belongs to an emptied year and to a working-age band (15–64). */
function zeroWorkingAgeRow(stat: JsonStat, axes: Axes, flat: string): void {
  const coords = coordinates(Number(flat), stat.size);
  const age = Number((axes.codeByPosition.get(coords[axes.age] ?? -1) ?? '').slice(1));
  const workingAge = age >= 15 && age <= 64;
  if (axes.emptied.has(coords[axes.time]) && workingAge) stat.value[flat] = 0;
}

/**
 * `demo_pjan` with the working-age rows of the named years set to zero: those years stay in the
 * snapshot, but `observedDependency` cannot divide for them. The shipped snapshot has both years
 * complete, which is why neither the fallback nor the no-observation refusal was ever exercised.
 */
function withoutWorkingAgePopulation(years: readonly string[]): unknown {
  const stat = structuredClone(committedPayload(DEMO_PJAN_SOURCE)) as JsonStat;
  const axes = axesOf(stat, years);
  for (const flat of Object.keys(stat.value)) zeroWorkingAgeRow(stat, axes, flat);
  return stat;
}

describe('AC-003-12: the observed ratio comes from the latest year that can be divided', () => {
  it('AC-003-12: a year with no working-age denominator is skipped, never reported as the ratio', () => {
    const observed = withoutWorkingAgePopulation(['2025']);
    expect(observedDependency(observed, 2025)).toBeNull();
    const value = computeFuse({ observed });
    expect(value?.observedYear).toBe(1995);
    expect(value?.observedRatio).toBe(observedDependency(observed, 1995));
    expect(Number.isFinite(value?.consumedPercent)).toBe(true);
    expect(value?.threshold).toBe(COUNTDOWN_THRESHOLD);
  });
});

describe('AC-003-38: an unknown locale publishes no invented title', () => {
  it('AC-003-38: pageMetadata falls back to empty strings with no description and no suffix', () => {
    // Revision 2: the title no longer carries the wordmark, so the unknown-locale fallback
    // publishes nothing rather than a brand string the operator removed from every title.
    expect(pageMetadata('xx')).toEqual({
      title: '',
      ogTitle: '',
      description: '',
    });
  });
});

describe('AC-003-33: the strip resolves every share string from the content model', () => {
  it('AC-003-33: it asks for the click-time template with {days} left in it and for the label keys', () => {
    const calls: Array<[string, Record<string, string | number> | undefined]> = [];
    const spied: CountryLocaleContent = {
      ...ES,
      t: (key, vars) => {
        calls.push([key, vars]);
        return ES.t(key, vars);
      },
    };
    renderComponent(StoryStrip, { content: spied, countdown: countdownValue() });
    const url = canonicalUrl(publicPathFor('es'));
    const year = String(countdownValue().thresholdYear);
    // The message the click rebuilds: the year and the URL filled, the day count left as a token.
    expect(calls).toContainEqual(['share.text', { year, url, days: DAYS_PLACEHOLDER }]);
    // The message the server HTML carries: no day token at all.
    expect(calls).toContainEqual(['share.textNoJs', { year, url }]);
    // The client-only controls' labels are resolved at render, so a blank label is a defect even
    // though the server HTML never shows them.
    for (const key of ['share.native', 'share.copy', 'share.copied'] as const) {
      expect(calls).toContainEqual([key, undefined]);
    }
  });
});

describe('AC-003-13 and AC-003-21: the drawn line is the stored fraction', () => {
  it('AC-003-13: the cord is inset and the burnt segment is the remainder of the viewBox', () => {
    const html = decodeText(renderComponent(FuseLine, { consumedPercent: 62.44 }));
    expect(html).toContain('<rect class="fuse__cord" x="0" y="3" width="375.6" height="1"');
    expect(html).toContain('<rect class="fuse__burnt" x="375.6" y="0" width="624.4" height="6"');
  });

  it('AC-003-21: the definition of the ratio and the reproduce label are the locale’s own strings', () => {
    const html = decodeText(
      renderComponent(MethodRegion, {
        content: ES,
        sources: { countdown: countdownValue(), fuse: fuseFixture() },
        freshnessWindowDays: 45,
        nowMs: NOW,
        countries: [{ geo: 'ES', name: ES.country.name, href: '#' }],
      }),
    );
    expect(html).toContain(`<p class="fuse__definition">${ES.t('fuse.definition')}</p>`);
    expect(html).toContain(`<a class="fuse__reproduce" href="#reproducir">${ES.t('fuse.reproduce')}</a>`);
  });
});

describe('AC-003-20: the fuse series records the value it published as its assumptions', () => {
  it('AC-003-20: thresholds, denominator and observed numbers are the computed value’s own', () => {
    const { value, assumptions } = fuseDefinition().compute(seriesSnapshots(), { snapshotYear: 2026 });
    expect(value).toEqual({
      observedRatio: 31.22,
      observedYear: 2025,
      threshold: COUNTDOWN_THRESHOLD,
      consumedPercent: 62.44,
    });
    expect(assumptions).toEqual({
      threshold: 50,
      denominator: '15-64',
      observedYear: 2025,
      observedRatio: 31.22,
      consumedPercent: 62.44,
    });
  });

  it('AC-003-20: a missing observation and an uncomputable one both stop the series by name', () => {
    const context = { snapshotYear: 2026 };
    expect(() => fuseDefinition().compute(new Map(), context)).toThrow(`${DEMO_PJAN_SOURCE} is not resolved`);
    const inputs = seriesSnapshots();
    const snapshot = inputs.get(DEMO_PJAN_SOURCE);
    if (!snapshot) throw new Error('no demo_pjan snapshot');
    inputs.set(DEMO_PJAN_SOURCE, {
      ...snapshot,
      payload: withoutWorkingAgePopulation(['1995', '2025']) as never,
    });
    expect(() => fuseDefinition().compute(inputs, context)).toThrow(
      `${DEMO_PJAN_SOURCE} has no year with both age classes`,
    );
  });
});
