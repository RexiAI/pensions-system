import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { stableStringify } from '../ingest/deterministic-json';
import type { DerivedSeries, SeriesId } from '../ingest/series-types';

/**
 * Where the derived series are published: `data/derived/series/`, a subdirectory of the
 * figure directory and never a sibling file inside it. `createFileDerivedStore().readAll()`
 * parses every top-level `*.json` under `data/derived/` and casts its `figureId` to the closed
 * `FigureId` union, so a series written at `data/derived/pyramid.json` would be read as a
 * metric figure — crash, or worse, be published as one. The flat `readdirSync` skips a
 * subdirectory, which is the entire reason for the extra path segment. Do not "tidy" this.
 */
export const SERIES_DIR = 'data/derived/series';

export function seriesFileName(seriesId: SeriesId): string {
  return `${seriesId}.json`;
}

export function serialiseDerivedSeries(series: DerivedSeries): string {
  return stableStringify(series);
}

export function writeDerivedSeries(dir: string, series: readonly DerivedSeries[]): string[] {
  mkdirSync(dir, { recursive: true });
  return series.map((entry) => {
    const path = join(dir, seriesFileName(entry.seriesId));
    writeFileSync(path, serialiseDerivedSeries(entry), 'utf8');
    return path;
  });
}

/** Reads the committed series. A missing directory is an empty set, never a thrown build. */
export function readDerivedSeries(dir: string = SERIES_DIR): DerivedSeries[] {
  let files: string[];
  try {
    files = readdirSync(dir).filter((file) => file.endsWith('.json'));
  } catch {
    return [];
  }
  return files.sort().map((file) => JSON.parse(readFileSync(join(dir, file), 'utf8')) as DerivedSeries);
}

export function findSeries(series: readonly DerivedSeries[], seriesId: SeriesId): DerivedSeries | undefined {
  return series.find((entry) => entry.seriesId === seriesId);
}
