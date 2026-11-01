import type { Manifest } from '../manifest/types';

/**
 * The reproduce command is derived from the manifest, never authored in a component. One
 * committed script reproduces every published artefact: `--figure` for a metric figure,
 * `--series` for a derived series.
 */
export function reproduceCommand(manifest: Manifest, figureId: string): string {
  return ['npx', 'tsx', manifest.reproducePath, '--figure', figureId].join(' ');
}

/**
 * The series whose published command pins the committed snapshot (`--offline`): the fuse is
 * advertised as reproducing *from the committed snapshot* (spec 003 AC-003-16), so its command
 * must not fetch a newer payload first.
 */
const OFFLINE_SERIES: ReadonlySet<string> = new Set(['fuse']);

export function seriesReproduceCommand(manifest: Manifest, seriesId: string): string {
  const offline = OFFLINE_SERIES.has(seriesId) ? ['--offline'] : [];
  return ['npx', 'tsx', manifest.reproducePath, '--series', seriesId, ...offline].join(' ');
}
