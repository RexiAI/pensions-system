import type { DefinitionId } from './definitions';
import { isDefinitionId } from './definitions';
import type { FormulaId } from './formula-ids';
import { isFormulaId } from './formula-ids';
import { ISO_UTC_SECONDS, isSha256Hex, sha256Hex, toIsoUtcSeconds } from './hash';
import type { Manifest, ManifestProblem } from './types';

export interface ManifestBuildInput {
  sourceUrl: string[];
  fetchedAt: Date;
  formulaId: FormulaId;
  definitionId: DefinitionId;
  /** Raw bytes of the ingested input snapshot. */
  inputBytes: Uint8Array | string;
  reproducePath: string;
  /** The data vintage year, recorded here at ingest rather than derived at render time. */
  snapshotYear?: number;
}

export function buildManifest(input: ManifestBuildInput): Manifest {
  const manifest: Manifest = {
    sourceUrl: [...input.sourceUrl],
    fetchedAt: toIsoUtcSeconds(input.fetchedAt),
    formulaId: input.formulaId,
    definitionId: input.definitionId,
    inputHash: sha256Hex(input.inputBytes),
    reproducePath: input.reproducePath,
  };
  if (input.snapshotYear !== undefined) manifest.snapshotYear = input.snapshotYear;
  return manifest;
}

function checkSourceEntry(entry: unknown): ManifestProblem | null {
  if (typeof entry !== 'string' || entry.trim() === '') {
    return { field: 'sourceUrl', code: 'empty', detail: 'blank source URL entry' };
  }
  return /^https?:\/\/\S+$/.test(entry) ? null : { field: 'sourceUrl', code: 'malformed', detail: entry };
}

function checkSourceUrl(value: unknown): ManifestProblem[] {
  if (value === undefined) return [{ field: 'sourceUrl', code: 'missing', detail: 'absent' }];
  if (!Array.isArray(value) || value.length === 0) {
    return [{ field: 'sourceUrl', code: 'empty', detail: 'at least one source URL is required' }];
  }
  return value
    .map(checkSourceEntry)
    .filter((problem): problem is ManifestProblem => problem !== null);
}

function checkFetchedAt(value: unknown): ManifestProblem[] {
  if (value === undefined) return [{ field: 'fetchedAt', code: 'missing', detail: 'absent' }];
  if (typeof value !== 'string' || value.trim() === '') {
    return [{ field: 'fetchedAt', code: 'empty', detail: 'blank timestamp' }];
  }
  if (!ISO_UTC_SECONDS.test(value)) {
    return [{ field: 'fetchedAt', code: 'malformed', detail: 'expected YYYY-MM-DDTHH:MM:SSZ' }];
  }
  return [];
}

function checkFormulaId(value: unknown): ManifestProblem[] {
  if (value === undefined) return [{ field: 'formulaId', code: 'missing', detail: 'absent' }];
  if (typeof value !== 'string' || value.trim() === '') {
    return [{ field: 'formulaId', code: 'empty', detail: 'blank formula id' }];
  }
  if (!isFormulaId(value)) {
    return [{ field: 'formulaId', code: 'unknownFormulaId', detail: value }];
  }
  return [];
}

function checkDefinitionId(value: unknown): ManifestProblem[] {
  if (value === undefined) return [{ field: 'definitionId', code: 'missing', detail: 'absent' }];
  if (typeof value !== 'string' || value.trim() === '') {
    return [{ field: 'definitionId', code: 'empty', detail: 'blank definition id' }];
  }
  if (!isDefinitionId(value)) {
    return [{ field: 'definitionId', code: 'unknownDefinitionId', detail: value }];
  }
  return [];
}

function checkInputHash(value: unknown): ManifestProblem[] {
  if (value === undefined) return [{ field: 'inputHash', code: 'missing', detail: 'absent' }];
  if (typeof value !== 'string' || value.trim() === '') {
    return [{ field: 'inputHash', code: 'empty', detail: 'blank digest' }];
  }
  if (!isSha256Hex(value)) {
    return [{ field: 'inputHash', code: 'malformed', detail: 'expected 64 lowercase hex chars' }];
  }
  return [];
}

/** `snapshotYear` is optional; when a manifest records one it must be a plausible year. */
function checkSnapshotYear(value: unknown): ManifestProblem[] {
  if (value === undefined) return [];
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1900 || value > 2200) {
    return [{ field: 'snapshotYear', code: 'malformed', detail: String(value) }];
  }
  return [];
}

function isBlankPath(value: unknown): boolean {
  return typeof value !== 'string' || value.trim() === '';
}

function isRepoRelative(path: string): boolean {
  return !(path.startsWith('/') || path.includes('..'));
}

function checkReproducePath(value: unknown, fileExists: (path: string) => boolean): ManifestProblem[] {
  if (value === undefined) return [{ field: 'reproducePath', code: 'missing', detail: 'absent' }];
  if (isBlankPath(value)) return [{ field: 'reproducePath', code: 'empty', detail: 'blank path' }];
  const path = value as string;
  if (!isRepoRelative(path)) {
    return [{ field: 'reproducePath', code: 'malformed', detail: 'must be repo-relative' }];
  }
  return fileExists(path) ? [] : [{ field: 'reproducePath', code: 'missingFile', detail: path }];
}

export interface ManifestValidationDeps {
  fileExists(path: string): boolean;
}

function asRecord(candidate: unknown): Record<string, unknown> | null {
  if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) return null;
  return candidate as Record<string, unknown>;
}

/**
 * The manifest fields a page can check without touching the filesystem, so the public
 * renderer can withhold a plate whose provenance is structurally broken (D1 `withheld`)
 * without gaining a filesystem dependency.
 */
export function manifestFieldProblems(candidate: unknown): ManifestProblem[] {
  const record = asRecord(candidate);
  if (!record) return [{ field: 'sourceUrl', code: 'missing', detail: 'no manifest object' }];
  return [
    ...checkSourceUrl(record.sourceUrl),
    ...checkFetchedAt(record.fetchedAt),
    ...checkFormulaId(record.formulaId),
    ...checkDefinitionId(record.definitionId),
    ...checkInputHash(record.inputHash),
    ...checkSnapshotYear(record.snapshotYear),
    ...checkReproducePath(record.reproducePath, () => true).filter((problem) => problem.code !== 'missingFile'),
  ];
}

/**
 * Validates a manifest that arrived from disk or from an admin revision. Rejects on the
 * first missing/empty field rather than defaulting, so a partial manifest can never be
 * published as current (AC-001-03).
 */
export function validateManifest(
  candidate: unknown,
  deps: ManifestValidationDeps,
): { ok: true; manifest: Manifest } | { ok: false; problems: ManifestProblem[] } {
  const record = asRecord(candidate);
  if (!record) {
    return { ok: false, problems: [{ field: 'sourceUrl', code: 'missing', detail: 'no manifest object' }] };
  }
  const problems = [
    ...manifestFieldProblems(record),
    ...checkReproducePath(record.reproducePath, deps.fileExists),
  ];
  if (problems.length > 0) return { ok: false, problems };
  return { ok: true, manifest: record as unknown as Manifest };
}
