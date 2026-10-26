import type { Manifest } from '../manifest/types';

/** The reproduce command is derived from the manifest, never authored in a component. */
export function reproduceCommand(manifest: Manifest, figureId: string): string {
  return ['npx', 'tsx', manifest.reproducePath, '--figure', figureId].join(' ');
}
