import type { Manifest } from '../manifest/types';

/**
 * The reproduce command is derived from the manifest, never authored in a component. One
 * committed script reproduces every published artefact: `--figure` for a metric figure,
 * `--series` for a derived series.
 */
export function reproduceCommand(manifest: Manifest, figureId: string): string {
  return ['npx', 'tsx', manifest.reproducePath, '--figure', figureId].join(' ');
}

export function seriesReproduceCommand(manifest: Manifest, seriesId: string): string {
  return ['npx', 'tsx', manifest.reproducePath, '--series', seriesId].join(' ');
}
