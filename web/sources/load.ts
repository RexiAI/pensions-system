import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { SnapshotMap, SourceSnapshot } from './types';

interface SnapshotFile {
  meta: {
    sourceId: string;
    publisher: string;
    dataset: string;
    sourceUrl: string | string[];
    retrievedAt: string;
  };
  resolved?: boolean;
  unresolvedReason?: string;
  payload?: unknown;
}

export function snapshotFromFile(path: string, content: string): SourceSnapshot {
  const parsed = JSON.parse(content) as SnapshotFile;
  const urls = Array.isArray(parsed.meta.sourceUrl) ? parsed.meta.sourceUrl : [parsed.meta.sourceUrl];
  const resolved = parsed.resolved ?? parsed.payload !== undefined;
  const snapshot: SourceSnapshot = {
    sourceId: parsed.meta.sourceId,
    bytes: content,
    resolved,
    retrievedAt: parsed.meta.retrievedAt,
    sourceUrl: urls,
    publisher: parsed.meta.publisher,
    dataset: parsed.meta.dataset,
  };
  if (parsed.payload !== undefined) snapshot.payload = parsed.payload;
  if (!resolved) {
    snapshot.unresolvedReason = parsed.unresolvedReason ?? 'series unresolved';
  }
  return snapshot;
}

/** Reads the committed snapshots. The raw file text is kept: the hash is over those bytes. */
export function loadSnapshots(dir = 'data/snapshots'): SnapshotMap {
  const snapshots = new Map<string, SourceSnapshot>();
  let files: string[];
  try {
    files = readdirSync(dir).filter((file) => file.endsWith('.json'));
  } catch {
    return snapshots;
  }
  for (const file of files.sort()) {
    const content = readFileSync(join(dir, file), 'utf8');
    const snapshot = snapshotFromFile(join(dir, file), content);
    snapshots.set(snapshot.sourceId, snapshot);
  }
  return snapshots;
}
