import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DerivedFigure, FigureId } from '../ingest/types';
import { stableStringify } from '../ingest/deterministic-json';

/** The publication target. An approval writes here; nothing else may. */
export interface DerivedFigureStore {
  read(figureId: FigureId): DerivedFigure | undefined;
  readAll(): DerivedFigure[];
  write(figure: DerivedFigure): void;
}

export interface InMemoryDerivedStore extends DerivedFigureStore {
  written(): FigureId[];
  snapshot(): DerivedFigure[];
}

export function createMemoryDerivedStore(initial: readonly DerivedFigure[] = []): InMemoryDerivedStore {
  const figures = new Map<FigureId, DerivedFigure>(initial.map((figure) => [figure.figureId, figure]));
  const writes: FigureId[] = [];
  return {
    read: (figureId) => figures.get(figureId),
    readAll: () => [...figures.values()],
    write: (figure) => {
      figures.set(figure.figureId, figure);
      writes.push(figure.figureId);
    },
    written: () => [...writes],
    snapshot: () => [...figures.values()],
  };
}

/** The published figures, statically scoped to `data/derived` (see admin/persistence.ts). */
function derivedDir(): string {
  return join(process.cwd(), 'data', 'derived');
}

export function createFileDerivedStore(): DerivedFigureStore {
  const pathFor = (figureId: FigureId) => join(derivedDir(), `${figureId}.json`);
  return {
    read(figureId) {
      try {
        return JSON.parse(readFileSync(pathFor(figureId), 'utf8')) as DerivedFigure;
      } catch {
        return undefined;
      }
    },
    readAll() {
      try {
        return readdirSync(derivedDir())
          .filter((file) => file.endsWith('.json'))
          .map((file) => JSON.parse(readFileSync(join(derivedDir(), file), 'utf8')) as DerivedFigure);
      } catch {
        return [];
      }
    },
    write(figure) {
      mkdirSync(derivedDir(), { recursive: true });
      writeFileSync(pathFor(figure.figureId), stableStringify(figure), 'utf8');
    },
  };
}
