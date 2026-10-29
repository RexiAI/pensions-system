import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';

/**
 * Boots the built app (`next start`) so a test can fetch the HTML a reader actually receives,
 * instead of asserting on the code that is supposed to produce it.
 *
 * `next start` needs a build, and `npm test` does not require one, so `BUILD_PRESENT` lets the
 * callers state their condition instead of failing on a clean checkout. Every assertion made
 * through this helper is also made against the rendering layer by a test that never skips —
 * see `document-lang.test.ts` and `manifest-icons.test.ts`.
 */
export const BUILD_PRESENT = existsSync('.next/server/app');

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address !== null ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

async function waitForServer(baseUrl: string, timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl, { redirect: 'manual' });
      if (response.status < 500) return;
    } catch {
      // Not listening yet: the server binding and the first compile are both normal here.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`next start did not answer on ${baseUrl} within ${timeoutMs}ms`);
}

export interface ServedApp {
  baseUrl: string;
  close(): Promise<void>;
}

export async function startServedApp(): Promise<ServedApp> {
  const port = await freePort();
  const child: ChildProcess = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'start', '-p', String(port)],
    { cwd: process.cwd(), stdio: 'ignore', env: process.env },
  );
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await waitForServer(baseUrl);
  } catch (error) {
    child.kill('SIGKILL');
    throw error;
  }
  return {
    baseUrl,
    close: async () => {
      if (child.exitCode !== null) return;
      child.kill('SIGTERM');
      await new Promise((resolve) => child.once('exit', resolve));
    },
  };
}

/** The route path for one of the five locales: the base locale is served at `/`. */
export function routePath(locale: string): string {
  return locale === 'es' ? '/' : `/${locale}`;
}

export function htmlLang(html: string): string | null {
  const match = /<html[^>]*\slang="([^"]*)"/.exec(html);
  return match?.[1] ?? null;
}

/** A `<meta>` content value by property or name, decoded the way a browser would see it. */
export function metaContent(html: string, key: string): string | null {
  const pattern = new RegExp(`<meta[^>]*(?:property|name)="${key}"[^>]*content="([^"]*)"`);
  const match = pattern.exec(html);
  return match?.[1]?.replace(/&#x27;/g, "'").replace(/&amp;/g, '&') ?? null;
}
