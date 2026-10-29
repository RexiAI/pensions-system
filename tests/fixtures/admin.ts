import type { FigureChange } from '../../web/admin/revisions/types';
import { createMemoryRevisionStore } from '../../web/admin/revisions/pending-store';
import type { InMemoryRevisionStore } from '../../web/admin/revisions/pending-store';
import { buildManifest } from '../../web/manifest/validate';
import type { DefinitionId } from '../../web/manifest/definitions';
import type { FormulaId } from '../../web/manifest/formula-ids';
import type { FigureId } from '../../web/ingest/types';

export const NOW = new Date('2026-10-25T12:00:00Z');
export const SECRET = 'r'.repeat(48);

export interface ChangeParams {
  figureId?: FigureId;
  formulaId?: FormulaId;
  definitionId?: DefinitionId;
  before?: unknown;
  after?: unknown;
  bytes?: string;
  reproducePath?: string;
  unit?: string;
}

function manifestFor(params: ChangeParams): ReturnType<typeof buildManifest> {
  const figureId = params.figureId ?? 'fig-01';
  return buildManifest({
    sourceUrl: ['https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176953'],
    fetchedAt: NOW,
    formulaId: params.formulaId ?? 'dependency-ratio.v1',
    definitionId: params.definitionId ?? 'dependency-ratio.international',
    inputBytes: params.bytes ?? `snapshot-${figureId}`,
    reproducePath: params.reproducePath ?? 'scripts/compute.ts',
  });
}

export function makeChange(params: ChangeParams = {}): FigureChange {
  const figureId = params.figureId ?? 'fig-01';
  const manifest = manifestFor(params);
  return {
    figureId,
    before: params.before ?? { latest: 0.41 },
    after: params.after ?? { latest: 0.42 },
    source: manifest.sourceUrl,
    fetchedAt: manifest.fetchedAt,
    inputHash: manifest.inputHash,
    manifest,
    unit: params.unit ?? 'ratio',
    assumptions: {},
  };
}

export function revisionStore(initial = []): InMemoryRevisionStore {
  return createMemoryRevisionStore(initial);
}
