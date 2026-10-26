import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCompute } from '../../web/ingest/run-compute';
import { derivedFileName, readDerivedFigures, writeDerivedFigures } from '../../web/ingest/write-derived';
import type { ComputeOptions } from '../../web/ingest/run-compute';
import type { FigureDefinition } from '../../web/ingest/types';
import type { SourceSnapshot } from '../../web/sources/types';

const NOW = new Date('2026-10-25T12:00:00Z');
const WINDOW_DAYS = 45;

const figure: FigureDefinition = {
  figureId: 'fig-06',
  formulaId: 'dependency-ratio.v1',
  definitionId: 'dependency-ratio.national',
  geography: 'national',
  unit: 'ratio',
  requirementSources: ['src-a', 'src-b'],
  compute: (inputs) => ({
    value: {
      pensioners: Number(inputs.get('src-a')?.payload),
      affiliates: Number(inputs.get('src-b')?.payload),
    },
    assumptions: {},
  }),
};

function snapshot(overrides: Partial<SourceSnapshot> & { sourceId: string }): SourceSnapshot {
  return {
    bytes: `raw-bytes-${overrides.sourceId}`,
    resolved: true,
    retrievedAt: '2026-10-24T00:00:00Z',
    sourceUrl: [`https://example.invalid/${overrides.sourceId}`],
    publisher: 'Example',
    dataset: 'Example dataset',
    payload: 1,
    ...overrides,
  };
}

function options(snapshots: SourceSnapshot[]): ComputeOptions {
  return {
    figures: [figure],
    snapshots: new Map(snapshots.map((s) => [s.sourceId, s])),
    now: NOW,
    freshnessWindowDays: WINDOW_DAYS,
    reproducePath: 'scripts/compute.ts',
    fileExists: (path) => path === 'scripts/compute.ts',
  };
}

describe('build-time ingest and computation harness', () => {
  it('AC-001-04: all sources resolve, derived JSON is written, exit 0', () => {
    const report = runCompute(
      options([
        snapshot({ sourceId: 'src-a', payload: 8_400_000 }),
        snapshot({ sourceId: 'src-b', payload: 20_000_000 }),
      ]),
    );

    expect(report.exitCode).toBe(0);
    expect(report.problems).toEqual([]);
    expect(report.figures[0]?.availability).toBe('computed');

    const dir = mkdtempSync(join(tmpdir(), 'derived-'));
    const written = writeDerivedFigures(dir, report.figures);
    expect(written).toEqual([join(dir, derivedFileName('fig-06'))]);
    const parsed = JSON.parse(readFileSync(written[0] as string, 'utf8')) as {
      manifest: { inputHash: string };
      value: unknown;
    };
    expect(parsed.manifest.inputHash).toMatch(/^[0-9a-f]{64}$/);
    expect(readDerivedFigures(dir)).toHaveLength(1);
  });

  it('AC-001-05: a single source failure fails the build loudly', () => {
    const report = runCompute(
      options([snapshot({ sourceId: 'src-a', payload: 8_400_000 })]),
    );

    expect(report.exitCode).not.toBe(0);
    expect(report.problems.map((p) => p.code)).toContain('missing-source');
    expect(report.figures[0]?.availability).not.toBe('computed');
    expect(report.figures[0]?.value).toBeNull();
  });

  it('AC-001-05: a figure explicitly marked unavailable is not a partial snapshot', () => {
    const report = runCompute(
      options([
        snapshot({ sourceId: 'src-a', payload: 8_400_000 }),
        snapshot({
          sourceId: 'src-b',
          resolved: false,
          payload: undefined,
          unresolvedReason: 'series not yet specified',
        }),
      ]),
    );

    expect(report.exitCode).toBe(0);
    expect(report.problems).toEqual([]);
    expect(report.figures[0]?.availability).toBe('unavailable');
    expect(report.figures[0]?.value).toBeNull();
    expect(report.figures[0]?.unresolvedSources).toEqual(['src-b']);
  });

  it('AC-001-06: a partial ingest fails loudly and publishes nothing as current', () => {
    const partial = runCompute(options([snapshot({ sourceId: 'src-a', payload: 8_400_000 })]));

    expect(partial.exitCode).not.toBe(0);
    expect(partial.figures.some((f) => f.availability === 'computed')).toBe(false);
    expect(partial.figures[0]?.unresolvedSources).toContain('src-b');

    const withUnavailable = runCompute(
      options([
        snapshot({ sourceId: 'src-a', payload: 8_400_000 }),
        snapshot({
          sourceId: 'src-b',
          resolved: false,
          payload: undefined,
          unresolvedReason: 'series not yet specified',
        }),
      ]),
    );

    expect(withUnavailable.exitCode).toBe(0);
    expect(withUnavailable.problems).toEqual([]);
    expect(withUnavailable.figures[0]?.availability).toBe('unavailable');
  });

  it('AC-001-07: a stale snapshot is not rendered as current', () => {
    const report = runCompute(
      options([
        snapshot({ sourceId: 'src-a', payload: 8_400_000, retrievedAt: '2026-06-01T00:00:00Z' }),
        snapshot({ sourceId: 'src-b', payload: 20_000_000 }),
      ]),
    );

    expect(report.exitCode).not.toBe(0);
    expect(report.problems.map((p) => p.code)).toContain('stale-snapshot');
    expect(report.figures[0]?.availability).toBe('unavailable');
  });
});
