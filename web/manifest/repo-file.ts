import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A `reproducePath` must point at a committed artefact, and committed artefacts live in
 * exactly two roots. Resolving each root as a literal keeps the check statically scoped: a
 * `resolve(process.cwd(), path)` style check makes the bundler trace the whole repository
 * into the server output.
 */
const REPO_ROOTS = ['scripts', 'data'] as const;

type RepoRoot = (typeof REPO_ROOTS)[number];

function isRepoRoot(value: string): value is RepoRoot {
  return (REPO_ROOTS as readonly string[]).includes(value);
}

export function committedFileExists(path: string): boolean {
  const [root, ...rest] = path.split('/');
  if (rest.length === 0 || !isRepoRoot(root)) return false;
  if (root === 'scripts') return existsSync(join(process.cwd(), 'scripts', ...rest));
  return existsSync(join(process.cwd(), 'data', ...rest));
}
