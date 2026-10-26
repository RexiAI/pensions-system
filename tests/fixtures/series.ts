import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { snapshotFromFile } from '../../web/sources/load';
import type { SourceSnapshot } from '../../web/sources/types';
import { runSeriesCompute } from '../../web/ingest/run-series';
import { SERIES } from '../../web/ingest/series';
import type { DerivedSeries, SeriesId } from '../../web/ingest/series-types';
import type { PyramidValue } from '../../web/series/age-structure';
import type { CountdownValue } from '../../web/series/countdown';

/**
 * Series fixtures are the real thing: the committed snapshots through the committed harness, on
 * a pinned clock one day after the snapshot date. Nothing here invents a number, so a test that
 * passes describes what the deployment actually publishes.
 */
export const FIXTURE_NOW = new Date('2026-10-27T00:00:00Z');
export const FIXTURE_FILE_EXISTS = (path: string): boolean => path === 'scripts/compute.ts';

const SNAPSHOT_IDS = ['eurostat-demo-pjan', 'eurostat-proj-23np', 'eurostat-proj-23np-ratio'] as const;

export function committedSnapshot(sourceId: string): SourceSnapshot {
  const path = join('data', 'snapshots', `${sourceId}.json`);
  return snapshotFromFile(path, readFileSync(path, 'utf8'));
}

export function committedPayload(sourceId: string): unknown {
  return committedSnapshot(sourceId).payload;
}

export function seriesSnapshots(): Map<string, SourceSnapshot> {
  return new Map(SNAPSHOT_IDS.map((sourceId) => [sourceId, committedSnapshot(sourceId)]));
}

export function seriesFixtures(): DerivedSeries[] {
  const report = runSeriesCompute({
    series: SERIES,
    snapshots: seriesSnapshots(),
    now: FIXTURE_NOW,
    freshnessWindowDays: 45,
    reproducePath: 'scripts/compute.ts',
    fileExists: FIXTURE_FILE_EXISTS,
  });
  return report.series;
}

function seriesOf(seriesId: SeriesId): DerivedSeries {
  const entry = seriesFixtures().find((candidate) => candidate.seriesId === seriesId);
  if (!entry) throw new Error(`missing series fixture: ${seriesId}`);
  return entry;
}

export function pyramidSeries(): DerivedSeries {
  return seriesOf('pyramid');
}

export function countdownSeries(): DerivedSeries {
  return seriesOf('countdown');
}

export function pyramidValue(): PyramidValue {
  return pyramidSeries().value as PyramidValue;
}

export function countdownValue(): CountdownValue {
  return countdownSeries().value as CountdownValue;
}

/** An `unavailable` series: no value, a reason, the same manifest shape. */
export function unavailableSeries(series: DerivedSeries): DerivedSeries {
  return {
    ...series,
    availability: 'unavailable',
    value: null,
    unresolvedSources: ['eurostat-proj-23np'],
    unresolvedReason: 'eurostat-proj-23np: series not yet specified',
  };
}
