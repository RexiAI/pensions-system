import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Build-output grep gate for AC-001-55: no admin secret may appear in a client bundle,
 * and no `NEXT_PUBLIC_*` variable may name an admin credential.
 */
export interface SecretLeak {
  file: string;
  secret: string;
}

export const BUNDLE_EXTENSIONS = ['.js', '.mjs', '.css', '.html', '.map', '.json'];

export function listBundleFiles(dir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      files.push(...listBundleFiles(path));
      continue;
    }
    if (BUNDLE_EXTENSIONS.some((extension) => path.endsWith(extension))) files.push(path);
  }
  return files.sort();
}

export function findSecretLeaks(params: { dir: string; secrets: readonly string[] }): SecretLeak[] {
  const suspects = params.secrets.filter((secret) => secret.length >= 8);
  const leaks: SecretLeak[] = [];
  for (const file of listBundleFiles(params.dir)) {
    const content = readFileSync(file, 'utf8');
    for (const secret of suspects) {
      if (content.includes(secret)) leaks.push({ file, secret });
    }
  }
  return leaks;
}

const PUBLIC_ADMIN_NAME = /NEXT_PUBLIC_[A-Z0-9_]*(ADMIN|SECRET|PASSWORD|HASH|CREDENTIAL)[A-Z0-9_]*/g;

/** Any public env variable that names an admin credential is a leak by construction. */
export function findPublicAdminEnvNames(files: ReadonlyArray<{ path: string; content: string }>): string[] {
  const found: string[] = [];
  for (const file of files) {
    for (const match of file.content.matchAll(PUBLIC_ADMIN_NAME)) {
      found.push(`${file.path}: ${match[0]}`);
    }
  }
  return found;
}
