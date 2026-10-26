/**
 * Ingests the machine sources into the committed snapshots under `data/snapshots/`.
 *
 * The suite never fetches: it reads these files. This script is the only writer, it runs
 * outside the test suite (at refresh time or by hand), and it writes deterministic JSON so a
 * re-fetch of unchanged data produces a byte-identical diff.
 *
 * Usage: tsx scripts/ingest-snapshots.ts [--only <sourceId>]
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { stableStringify } from '../web/ingest/deterministic-json';
import { findSource } from '../web/sources/types';
import { LIVE_URLS } from '../web/sources/live';

const DIR = 'data/snapshots';

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
}

function timestamp(now: Date): string {
  return now.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

interface SnapshotFile {
  meta: {
    sourceId: string;
    sourceClass: string;
    publisher: string;
    dataset: string;
    sourceUrl: string;
    retrievedAt: string;
    units?: string;
    filter?: string;
  };
  payload: unknown;
}

function filterOf(url: string): string {
  const query = url.split('?')[1] ?? '';
  return new URLSearchParams(query).toString();
}

async function ingest(sourceId: string, url: string, now: Date): Promise<string> {
  const declaration = findSource(sourceId);
  if (!declaration) throw new Error(`no declaration for ${sourceId}`);
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`${sourceId}: HTTP ${response.status}`);
  const payload: unknown = await response.json();
  const file: SnapshotFile = {
    meta: {
      sourceId,
      sourceClass: declaration.sourceClass,
      publisher: declaration.publisher,
      dataset: declaration.dataset,
      sourceUrl: url,
      retrievedAt: timestamp(now),
      filter: filterOf(url),
    },
    payload,
  };
  const path = join(DIR, `${sourceId}.json`);
  writeFileSync(path, stableStringify(file), 'utf8');
  return path;
}

async function main(): Promise<number> {
  const only = argValue('--only');
  const now = new Date();
  const entries = Object.entries(LIVE_URLS).filter(([sourceId]) => !only || sourceId === only);
  for (const [sourceId, url] of entries) {
    const path = await ingest(sourceId, url, now);
    console.log(`wrote ${path}`);
  }
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'ingest failed');
    process.exit(1);
  });
