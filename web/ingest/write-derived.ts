import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { stableStringify } from './deterministic-json';
import type { DerivedFigure } from './types';

export const DERIVED_DIR = 'data/derived';

export function derivedFileName(figureId: string): string {
  return `${figureId}.json`;
}

export function serialiseDerivedFigure(figure: DerivedFigure): string {
  return stableStringify(figure);
}

/** Writes one deterministic JSON file per figure. Returns the paths written. */
export function writeDerivedFigures(dir: string, figures: readonly DerivedFigure[]): string[] {
  mkdirSync(dir, { recursive: true });
  const written: string[] = [];
  for (const figure of figures) {
    const path = join(dir, derivedFileName(figure.figureId));
    writeFileSync(path, serialiseDerivedFigure(figure), 'utf8');
    written.push(path);
  }
  return written;
}

export function readDerivedFigures(dir: string): DerivedFigure[] {
  const files = readdirSync(dir).filter((file) => file.endsWith('.json'));
  return files.map((file) => JSON.parse(readFileSync(join(dir, file), 'utf8')) as DerivedFigure);
}
