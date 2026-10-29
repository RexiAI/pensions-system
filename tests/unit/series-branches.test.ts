import { describe, expect, it } from 'vitest';
import { bandOfAgeLabel } from '../../web/series/age-bands';
import { BASELINE_PROJECTION_LABEL, computePyramid, readAgeCounts } from '../../web/series/age-structure';
import {
  lastObservedYear,
  observedDependency,
  projectionVariants,
  readDependencySeries,
} from '../../web/series/countdown';
import { seriesById } from '../../web/ingest/series';
import { runSeriesCompute, snapshotYearOf } from '../../web/ingest/run-series';
import type { DerivedSeries, SeriesDefinition } from '../../web/ingest/series-types';
import type { SourceSnapshot } from '../../web/sources/types';
import { validateManifest } from '../../web/manifest/validate';
import { FIXTURE_FILE_EXISTS, FIXTURE_NOW, committedPayload, seriesSnapshots } from '../fixtures/series';

const PYRAMID = seriesById('pyramid') as SeriesDefinition;
const COUNTDOWN = seriesById('countdown') as SeriesDefinition;

function payloadSnapshot(sourceId: string): SourceSnapshot {
  const snapshot = seriesSnapshots().get(sourceId);
  if (!snapshot) throw new Error(`missing ${sourceId}`);
  return snapshot;
}

function runOne(series: SeriesDefinition, snapshots: Map<string, SourceSnapshot>, overrides: Partial<Parameters<typeof runSeriesCompute>[0]> = {}) {
  return runSeriesCompute({
    series: [series],
    snapshots,
    now: FIXTURE_NOW,
    freshnessWindowDays: 45,
    reproducePath: 'scripts/compute.ts',
    fileExists: FIXTURE_FILE_EXISTS,
    ...overrides,
  });
}

function first(report: { series: DerivedSeries[] }): DerivedSeries {
  const entry = report.series[0];
  if (!entry) throw new Error('no series computed');
  return entry;
}

describe('age banding boundaries', () => {
  it('bands the labels at each edge and excludes every non-single-age class', () => {
    expect(bandOfAgeLabel(' 5 YEARS ')).toBe(5);
    expect(bandOfAgeLabel('100 years')).toBe(100);
    expect(bandOfAgeLabel('75 years')).toBe(75);
    expect(bandOfAgeLabel('0 years')).toBe(0);
    expect(bandOfAgeLabel('65 years and over')).toBeNull();
    expect(bandOfAgeLabel('')).toBeNull();
    expect(bandOfAgeLabel('Annual')).toBeNull();
  });
});

describe('the age-structure reader fails loudly on a payload it cannot band', () => {
  it('refuses a payload with no unit dimension', () => {
    const payload = committedPayload('eurostat-demo-pjan') as Record<string, unknown>;
    const clone = JSON.parse(JSON.stringify(payload)) as { dimension: Record<string, unknown> };
    delete clone.dimension.unit;
    expect(() => readAgeCounts(clone)).toThrow(/unit/);
  });

  it('refuses a payload whose unit is not a count of persons', () => {
    const clone = JSON.parse(JSON.stringify(committedPayload('eurostat-demo-pjan'))) as {
      dimension: { unit: { category: { index: Record<string, number>; label: Record<string, string> } } };
    };
    clone.dimension.unit.category.label = { NR: 'Percentage of total population' };
    expect(() => readAgeCounts(clone)).toThrow(/not a count of persons/);
  });

  it('refuses a projection payload whose variant label is absent', () => {
    const payload = committedPayload('eurostat-proj-23np');
    expect(() => readAgeCounts(payload, { projectionLabel: 'No such variant' })).toThrow(/no category labelled/);
  });

  it('fails the whole pyramid when one of the three years is absent', () => {
    expect(() => computePyramid({ observed: committedPayload('eurostat-demo-pjan'), projected: committedPayload('eurostat-demo-pjan') })).toThrow();
  });

  it('records the baseline variant label it resolved the projection by', () => {
    expect(BASELINE_PROJECTION_LABEL).toBe('Baseline projections');
  });
});

describe('the dependency-ratio reader', () => {
  it('skips a year that is missing one of the two age classes', () => {
    const series = readDependencySeries(committedPayload('eurostat-proj-23np-ratio'), { variant: 'BSL' });
    expect(series.every((point) => point.ratio > 0)).toBe(true);
    expect(series.length).toBe(79);
  });

  it('lists every variant the payload publishes and none for a payload without one', () => {
    expect(projectionVariants(committedPayload('eurostat-proj-23np-ratio'))).toHaveLength(6);
    // A payload without a projection dimension cannot contribute a range; it fails loudly.
    expect(() => projectionVariants(committedPayload('eurostat-demo-pjan'))).toThrow(/projection/);
  });

  it('answers a year the observation does not carry with null, never with a substituted value', () => {
    expect(observedDependency(committedPayload('eurostat-demo-pjan'), 2026)).toBeNull();
    expect(lastObservedYear(committedPayload('eurostat-demo-pjan'), 2026)).toBe(2025);
    expect(lastObservedYear(committedPayload('eurostat-demo-pjan'), 2000)).toBe(1995);
  });
});

describe('the series harness fails loudly rather than publishing a partial series', () => {
  it('reports a missing snapshot and publishes nothing as computed', () => {
    const snapshots = seriesSnapshots();
    snapshots.delete('eurostat-proj-23np');
    const report = runOne(PYRAMID, snapshots);

    expect(report.exitCode).toBe(1);
    expect(report.problems.map((problem) => problem.code)).toContain('missing-source');
    expect(first(report).availability).toBe('unavailable');
    expect(first(report).value).toBeNull();
    expect(first(report).unresolvedReason).toBeTruthy();
  });

  it('publishes an explicitly unresolved snapshot as unavailable, without failing the build', () => {
    const snapshots = seriesSnapshots();
    const original = payloadSnapshot('eurostat-proj-23np');
    snapshots.set('eurostat-proj-23np', {
      ...original,
      resolved: false,
      payload: undefined,
      unresolvedReason: 'series not yet specified',
    });
    const report = runOne(PYRAMID, snapshots);

    expect(report.exitCode).toBe(0);
    expect(first(report).availability).toBe('unavailable');
    expect(first(report).unresolvedReason).toBe('eurostat-proj-23np: series not yet specified');
  });

  it('fails a stale snapshot instead of reusing it silently', () => {
    const snapshots = seriesSnapshots();
    const stale = { ...payloadSnapshot('eurostat-demo-pjan'), retrievedAt: '2026-01-01T00:00:00Z' };
    snapshots.set('eurostat-demo-pjan', stale);
    const report = runOne(PYRAMID, snapshots);

    expect(report.exitCode).toBe(1);
    expect(report.problems.map((problem) => problem.code)).toContain('stale-snapshot');
  });

  it('fails a manifest whose reproduce path is not committed', () => {
    const report = runOne(PYRAMID, seriesSnapshots(), { reproducePath: 'scripts/absent.ts' });

    expect(report.exitCode).toBe(1);
    expect(report.problems.map((problem) => problem.code)).toContain('manifest-invalid');
    expect(first(report).availability).toBe('unavailable');
  });

  it('fails a compute error and names it', () => {
    const snapshots = seriesSnapshots();
    snapshots.set('eurostat-proj-23np', { ...payloadSnapshot('eurostat-proj-23np'), payload: {} });
    const report = runOne(PYRAMID, snapshots);

    expect(report.exitCode).toBe(1);
    expect(report.problems.map((problem) => problem.code)).toContain('compute-failed');
    expect(first(report).unresolvedReason).toContain('payload');
  });

  it('records the vintage year at ingest, from the snapshot date', () => {
    expect(snapshotYearOf(new Date('2026-10-26T12:00:00Z'))).toBe(2026);
    expect(first(runOne(COUNTDOWN, seriesSnapshots())).manifest.snapshotYear).toBe(2026);
  });

  it('carries a complete manifest on an unavailable series too', () => {
    const snapshots = seriesSnapshots();
    snapshots.delete('eurostat-demo-pjan');
    const figure = first(runOne(COUNTDOWN, snapshots));
    expect(figure.availability).toBe('unavailable');
    expect(validateManifest(figure.manifest, { fileExists: FIXTURE_FILE_EXISTS }).ok).toBe(true);
  });
});

describe('the manifest records the vintage year, and rejects a malformed one', () => {
  const manifest = {
    sourceUrl: ['https://ec.europa.eu/eurostat'],
    fetchedAt: '2026-10-26T12:00:00Z',
    formulaId: 'age-structure.v1',
    definitionId: 'age-structure',
    inputHash: 'a'.repeat(64),
    reproducePath: 'scripts/compute.ts',
  };

  it('accepts a plausible year and rejects a malformed one', () => {
    expect(validateManifest({ ...manifest, snapshotYear: 2026 }, { fileExists: FIXTURE_FILE_EXISTS }).ok).toBe(true);
    for (const malformed of [0, 1200, 3000, 2026.5, '2026']) {
      const result = validateManifest({ ...manifest, snapshotYear: malformed }, { fileExists: FIXTURE_FILE_EXISTS });
      expect(result.ok, String(malformed)).toBe(false);
      if (result.ok) continue;
      expect(result.problems.map((problem) => problem.code)).toContain('malformed');
    }
  });
});
