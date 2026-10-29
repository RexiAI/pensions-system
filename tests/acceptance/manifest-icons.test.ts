import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import manifest from '../../app/manifest';

/**
 * The web app manifest's icons must be paths Next actually routes.
 *
 * The defect this pins down: the generator wrote `app/icon-192.png` and `app/icon-512.png`,
 * but `app/` only publishes files named exactly `icon.*`, `apple-icon.*` and `favicon.*` — so
 * both manifest entries were 404s and every page load logged a console error. The rasters now
 * live in `public/`, which is served verbatim.
 *
 * This asserts the file the manifest names exists (no build needed); `served-document.test.ts`
 * fetches both URLs from `next start` and asserts 200 + `image/png`.
 */
const NEXT_METADATA_FILES = ['/icon.svg', '/apple-icon.png', '/favicon.ico'];

describe('web app manifest', () => {
  it('points every icon at a file that is served', () => {
    const icons = manifest().icons ?? [];

    expect(icons.length).toBeGreaterThan(0);
    const unresolvable: string[] = [];
    for (const icon of icons) {
      const src = String(icon.src);
      const served = existsSync(join('public', src)) || NEXT_METADATA_FILES.includes(src);
      if (!served) unresolvable.push(src);
    }

    expect(unresolvable, 'declared by the manifest, never routed by Next').toEqual([]);
  });

  it('declares the sizes its PNG rasters actually carry', () => {
    const icons = manifest().icons ?? [];
    const dimensions = icons.map((icon) => {
      const bytes = readFileSync(join('public', String(icon.src)));
      // A PNG's IHDR carries width and height as big-endian uint32 at offsets 16 and 20.
      return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
    });

    expect(dimensions).toEqual(icons.map((icon) => String(icon.sizes)));
  });
});
