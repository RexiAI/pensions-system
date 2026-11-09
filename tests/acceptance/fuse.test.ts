import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ReproduceBlock } from '../../web/components/public/ReproduceBlock';
import { PublicPage } from '../../web/components/PublicPage';
import { seriesReproduceCommand } from '../../web/components/reproduce-command';
import { burnPoint, fuseLabelOf, fuseValueOf } from '../../web/components/series/Fuse';
import { citationRegistry } from '../../web/content/citations';
import { LOCALES } from '../../web/content/types';
import { readDerivedSeries } from '../../web/derived/series-store';
import { runSeriesCompute } from '../../web/ingest/run-series';
import { DEMO_PJAN_SOURCE, PROJ_RATIO_SOURCE, SERIES } from '../../web/ingest/series';
import type { DerivedSeries } from '../../web/ingest/series-types';
import { readDerivedFigures } from '../../web/ingest/write-derived';
import { COUNTDOWN_THRESHOLD } from '../../web/series/countdown';
import { computeFuse } from '../../web/series/fuse';
import type { FuseValue } from '../../web/series/fuse';
import { snapshotFromFile } from '../../web/sources/load';
import { content, dependencyFigure, renderComponent, shareFigure } from '../fixtures/figures';
import {
  FIXTURE_FILE_EXISTS,
  FIXTURE_NOW,
  committedPayload,
  countdownAt,
  countdownSeries,
  countdownValue,
  pyramidSeries,
  seriesFixtures,
  seriesSnapshots,
  unavailableSeries,
} from '../fixtures/series';
import { decodeText } from '../helpers/render-document';

const ES = content('es');
const CSS = readFileSync('web/styles/globals.css', 'utf8');
const NBSP = '\u00A0';

function fuseSeries(series: readonly DerivedSeries[] = seriesFixtures()): DerivedSeries {
  const entry = series.find((candidate) => candidate.seriesId === 'fuse');
  if (!entry) throw new Error('no fuse series');
  return entry;
}

function withValue(value: FuseValue): DerivedSeries {
  return { ...fuseSeries(), value };
}

/**
 * The page with the fuse series under test. Spec 004 split the old fuse component: the drawing and
 * the percentage are step 4, and the ratio, its year, the threshold and the provenance are
 * `#metodo` — so an assertion chooses its region.
 */
function renderFuse(series: DerivedSeries, locale = 'es'): string {
  const others = seriesFixtures().filter((entry) => entry.seriesId !== 'fuse');
  return decodeText(page([...others, series], Date.parse('2026-10-31T10:00:00Z'), locale));
}

/** `#metodo`: the methodological precision the story drops. */
function methodOf(html: string): string {
  const at = html.indexOf('id="metodo"');
  return at === -1 ? '' : html.slice(at, html.indexOf('class="pager"', at));
}

/** The declared `fuse.label`, computed from the value the same way the page does. */
function technicalLabel(series: DerivedSeries, locale = 'es'): string {
  const value = fuseValueOf(series);
  if (value === undefined) throw new Error('no fuse value');
  return fuseLabelOf(content(locale), value);
}

function page(
  series: readonly DerivedSeries[],
  nowMs = Date.parse('2026-10-31T10:00:00Z'),
  locale = 'es',
): string {
  const props = {
    content: content(locale),
    figures: [dependencyFigure(), shareFigure()],
    citations: citationRegistry,
    freshnessWindowDays: 45,
    stale: false,
    series,
    now: new Date(nowMs),
  } as const;
  return (
    renderComponent(PublicPage, { ...props, pageKind: 'historia' }) +
    renderComponent(PublicPage, { ...props, pageKind: 'metodo' })
  );
}

/** The fuse element itself: the `<figure class="fuse">`, not its provenance sibling. */
function fuseElement(html: string): string {
  const start = html.indexOf('<figure class="fuse">');
  return start === -1 ? '' : html.slice(start, html.indexOf('</figure>', start) + '</figure>'.length);
}

function computeWith(snapshots: Map<string, ReturnType<typeof snapshotFromFile>>): DerivedSeries {
  const report = runSeriesCompute({
    series: SERIES.filter((series) => series.seriesId === 'fuse'),
    snapshots,
    now: FIXTURE_NOW,
    freshnessWindowDays: 45,
    reproducePath: 'scripts/compute.ts',
    fileExists: FIXTURE_FILE_EXISTS,
  });
  const [entry] = report.series;
  if (!entry) throw new Error('no fuse');
  return entry;
}

/** The committed snapshot with one byte-level change to its first numeric value. */
function alteredSnapshot(sourceId: string) {
  const path = `data/snapshots/${sourceId}.json`;
  const document = JSON.parse(readFileSync(path, 'utf8')) as { payload: { value: Record<string, number> | number[] } };
  const values = document.payload.value as Record<string, number>;
  const firstKey = Object.keys(values)[0] as string;
  values[firstKey] = (values[firstKey] ?? 0) + 1;
  return snapshotFromFile(path, JSON.stringify(document));
}

describe('AC-003-11: the fuse reproduces the observed ratio over the threshold', () => {
  it('AC-003-11: Spain 2025 observed 31.22 over 50 is 62.44', () => {
    const value = computeFuse({ observed: committedPayload(DEMO_PJAN_SOURCE) });
    expect(value).toEqual({ observedRatio: 31.22, observedYear: 2025, threshold: 50, consumedPercent: 62.44 });
    // The committed derived file says the same.
    expect(fuseSeries(readDerivedSeries()).value).toEqual(value);
  });
});

describe('AC-003-12: the latest observed year is taken, not the first', () => {
  it('AC-003-12: with 1995 and 2025 both complete, 2025 is used', () => {
    const value = computeFuse({ observed: committedPayload(DEMO_PJAN_SOURCE) });
    expect(value?.observedYear).toBe(2025);
    expect(value?.observedYear).toBe(Math.max(1995, 2025));
  });
});

describe('AC-003-13: the display rounding is pinned', () => {
  it('AC-003-13: 62.44 prints "62 %" and the ratio "31,22" with 2025 beside it; 62.50 prints "63 %"', () => {
    const html = renderFuse(fuseSeries());
    const label = fuseElement(html);
    // The step states the percentage and nothing else; the ratio, its year and the threshold are
    // methodological precision and render in `#metodo` (spec 004 T5, T8).
    expect(label).toContain(`62${NBSP}%`);
    expect(label).not.toContain('31,22 (2025)');
    expect(methodOf(html)).toContain(technicalLabel(fuseSeries()));
    expect(technicalLabel(fuseSeries())).toContain('31,22 (2025)');
    expect(label).not.toContain('62,44');
    const half = renderFuse(withValue({ observedRatio: 31.25, observedYear: 2025, threshold: 50, consumedPercent: 62.5 }));
    expect(fuseElement(half)).toContain(`63${NBSP}%`);
  });
});

describe('AC-003-14: the threshold is the shared parameter, not a second literal', () => {
  it('AC-003-14: threshold 40 gives 78.05 from the committed snapshot', () => {
    expect(computeFuse({ observed: committedPayload(DEMO_PJAN_SOURCE), threshold: 40 })?.consumedPercent).toBe(78.05);
  });

  it('AC-003-14: the fuse computation defaults to the countdown’s own threshold constant', () => {
    const source = readFileSync('web/series/fuse.ts', 'utf8');
    expect(source).toContain('inputs.threshold ?? COUNTDOWN_THRESHOLD');
    expect(source).not.toMatch(/\b50\b/);
    expect(computeFuse({ observed: committedPayload(DEMO_PJAN_SOURCE) })?.threshold).toBe(COUNTDOWN_THRESHOLD);
  });
});

describe('AC-003-15: above the threshold the percentage is not capped', () => {
  it('AC-003-15: 55.00 over 50 prints "110 %" and draws the whole line burnt', () => {
    const over = withValue({ observedRatio: 55, observedYear: 2025, threshold: 50, consumedPercent: 110 });
    expect(fuseElement(renderFuse(over))).toContain(`110${NBSP}%`);
    expect(burnPoint(110)).toBe(0);
    expect(fuseElement(renderFuse(over))).toContain('x="0" y="0" width="1000" height="6"');
  });
});

describe('AC-003-16: the fuse carries a complete manifest and reproduces by command', () => {
  it('AC-003-16: every manifest field is present and non-empty', () => {
    const { manifest } = fuseSeries(readDerivedSeries());
    for (const field of ['formulaId', 'definitionId', 'fetchedAt', 'inputHash', 'reproducePath'] as const) {
      expect(String(manifest[field]).trim(), field).not.toBe('');
    }
    expect(manifest.sourceUrl.length).toBeGreaterThan(0);
    expect(manifest.snapshotYear).toBeGreaterThan(0);
  });

  it('AC-003-16: the published command, run on the committed snapshot, prints the same hash and 62.44', () => {
    const committed = fuseSeries(readDerivedSeries());
    const command = seriesReproduceCommand(committed.manifest, 'fuse');
    expect(command).toBe('npx tsx scripts/compute.ts --series fuse --offline');
    const [, , script, ...args] = command.split(' ');
    const run = spawnSync(process.execPath, ['node_modules/tsx/dist/cli.mjs', script as string, ...args], {
      encoding: 'utf8',
    });
    expect(run.status, run.stderr).toBe(0);
    expect(run.stdout).toContain(committed.manifest.inputHash);
    expect(run.stdout).toContain('"consumedPercent":62.44');
  }, 60_000);

  it('AC-003-16: the fuse is listed in the reproduce panel with its command', () => {
    const html = renderComponent(ReproduceBlock, {
      content: ES,
      figures: readDerivedFigures('data/derived'),
      series: seriesFixtures(),
    });
    const fuse = fuseSeries();
    expect(html).toContain(ES.t('series.fuse.title'));
    expect(html).toContain(fuse.manifest.inputHash);
    expect(html).toContain(seriesReproduceCommand(fuse.manifest, 'fuse'));
  });
});

describe('AC-003-17: changing the snapshot changes the hash', () => {
  it('AC-003-17: one altered demo_pjan value gives a different inputHash', () => {
    const snapshots = seriesSnapshots();
    const original = computeWith(snapshots).manifest.inputHash;
    snapshots.set(DEMO_PJAN_SOURCE, alteredSnapshot(DEMO_PJAN_SOURCE));
    expect(computeWith(snapshots).manifest.inputHash).not.toBe(original);
  });
});

describe('AC-003-18: no observed value, no fuse', () => {
  it('AC-003-18: absent, unavailable or empty, no fuse, percentage or provenance renders, and the clock does', () => {
    const fuse = fuseSeries();
    for (const series of [
      [pyramidSeries(), countdownSeries()],
      [pyramidSeries(), countdownSeries(), unavailableSeries(fuse)],
      [pyramidSeries(), countdownSeries(), { ...fuse, value: null }],
    ]) {
      const html = page(series);
      expect(html).not.toContain('class="fuse"');
      expect(html).not.toContain('fuse__line');
      expect(html).not.toContain(`62${NBSP}%`);
      expect(html).not.toContain(fuse.manifest.inputHash);
      // The projection's 31,91 appears only in the countdown's own back-cast sentence.
      expect(html.split('31,91').length - 1).toBe(1);
      expect(html).toContain('class="clock"');
    }
  });

  it('AC-003-18: a snapshot with no year carrying both age classes publishes no value', () => {
    const empty = { ...(committedPayload(DEMO_PJAN_SOURCE) as Record<string, unknown>), value: {} };
    expect(() => computeFuse({ observed: empty })).not.toThrow();
    expect(computeFuse({ observed: empty })).toBeNull();
  });
});

describe('AC-003-19: no threshold year, no fused threshold claim', () => {
  it('AC-003-19: a not-crossed, unavailable or empty countdown renders no number and no clock', () => {
    const notCrossed = { ...countdownSeries(), value: countdownAt(90) };
    for (const countdown of [notCrossed, unavailableSeries(countdownSeries()), { ...countdownSeries(), value: null }]) {
      const html = page([pyramidSeries(), countdown, fuseSeries()]);
      // Step 1 states no number at all, so nothing on the page claims a crossing the projection
      // does not publish. The fuse is its own step (spec 004 T5) and states its own quantity:
      // its denominator is the shared threshold parameter, never the countdown's year.
      expect(html).not.toContain('class="clock"');
      expect(html).not.toContain('countdown__numeral');
      expect(html).not.toContain('data-clock-state');
      expect(html.split('class="fuse"').length - 1).toBe(1);
      expect(fuseElement(html)).toContain(`62${NBSP}%`);
    }
  });

  it('AC-003-19: with no fuse value there is no fuse step, whatever the countdown says', () => {
    const html = page([pyramidSeries(), countdownSeries()]);
    expect(html).not.toContain('class="fuse"');
    expect(html).not.toContain('fuse__line');
  });
});

describe('AC-003-20: the projected value is never used for now', () => {
  it('AC-003-20: the fuse reads demo_pjan only; altering proj_23np moves neither value nor hash', () => {
    const fuse = SERIES.find((series) => series.seriesId === 'fuse');
    expect(fuse?.requirementSources).toEqual([DEMO_PJAN_SOURCE]);
    expect(countdownValue().backCast?.projected).toBe(31.91);
    const snapshots = seriesSnapshots();
    const before = computeWith(snapshots);
    snapshots.set(PROJ_RATIO_SOURCE, alteredSnapshot(PROJ_RATIO_SOURCE));
    snapshots.set('eurostat-proj-23np', alteredSnapshot('eurostat-proj-23np'));
    const after = computeWith(snapshots);
    expect(after.value).toEqual(before.value);
    expect(after.manifest.inputHash).toBe(before.manifest.inputHash);
    expect(after.manifest.sourceUrl.join(' ')).not.toContain('proj_23np');
    expect(readFileSync('web/series/fuse.ts', 'utf8')).not.toMatch(/proj_23np'|projected:/);
  });
});

describe('AC-003-21: the fuse implies no date and does not move with the clock', () => {
  it('AC-003-21: its only numbers are the percentage, the ratio, its year and the threshold', () => {
    const RATIO: Readonly<Record<string, string>> = { es: '31,22', en: '31.22', fr: '31,22', de: '31,22', it: '31,22' };
    for (const locale of LOCALES) {
      const html = renderFuse(fuseSeries(), locale);
      const element = fuseElement(html);
      const caption = element.slice(element.indexOf('<figcaption'), element.indexOf('</figcaption>'));
      const numbers = caption.replace(/<[^>]+>/g, ' ').match(/\d+(?:[.,]\d+)?/g) ?? [];
      // One numeral on the face; the ratio, its year and the threshold are `#metodo`'s.
      expect(numbers, locale).toEqual(['62']);
      const technical = methodOf(html).replace(/<[^>]+>/g, ' ');
      for (const value of ['62', RATIO[locale] ?? '', '2025', '50']) {
        expect(technical, `${locale}: ${value}`).toContain(value);
      }
      for (const forbidden of ['2042', 'role="progressbar"', 'aria-valuenow', '<time']) {
        expect(element, `${locale}: ${forbidden}`).not.toContain(forbidden);
      }
      expect(element, locale).toContain('<svg class="fuse__line" viewBox="0 0 1000 6" preserveAspectRatio="none" aria-hidden="true"');
      expect(element, locale).toContain('<figcaption class="fuse__label">');
    }
  });

  it('AC-003-21: the fuse markup is the same at two render instants, three seconds apart', () => {
    const at = Date.parse('2026-10-31T10:00:00Z');
    expect(fuseElement(page(seriesFixtures(), at))).toBe(fuseElement(page(seriesFixtures(), at + 3000)));
    const fuseCss = CSS.slice(CSS.indexOf('\n.fuse {'), CSS.indexOf('\n.share {'));
    expect(fuseCss).not.toMatch(/transition|animation/);
  });
});

describe('AC-003-22: the fuse carries no alarm hue and no new hue', () => {
  it('AC-003-22: burnt is --ink-1, the cord is --ink-3, nothing resolves an accent or alarm token', () => {
    // Re-pointed by spec 006 T9: the burnt segment is an ink and the pair improves. No chromatic
    // value at all is on the fuse now, so "no alarm hue" is stronger than it was.
    expect(CSS).toMatch(/\.fuse__cord\s*\{\s*fill:\s*var\(--ink-3\);\s*\}/);
    expect(CSS).toMatch(/\.fuse__burnt\s*\{\s*fill:\s*var\(--ink-1\);\s*\}/);
    const fuseCss = CSS.slice(CSS.indexOf('\n.fuse {'), CSS.indexOf('\n.share {'));
    expect(fuseCss).not.toMatch(/--accent|--data-deficit|--data-projection|--rule-|#[0-9a-f]{3,8}\b/i);
  });

  it('AC-003-22: the fuse renders inside step 4, not step 1', () => {
    const html = page(seriesFixtures());
    // The clock subtree this clause used to be measured against does not exist; what replaces it
    // is the step boundary: step 4 carries the fuse, step 1 does not.
    const distance = html.slice(html.indexOf('data-top-step="distance"'), html.indexOf('data-top-step="meaning"'));
    const number = html.slice(html.indexOf('data-top-step="number"'), html.indexOf('data-top-step="breakage"'));
    expect(distance).toContain('class="fuse"');
    expect(number).not.toContain('fuse');
    expect(html.indexOf('class="fuse"')).toBeGreaterThan(html.indexOf('data-top-step="distance"'));
  });
});
