import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * A real Chromium, driven over the DevTools protocol with Node's own `WebSocket` — no Playwright,
 * no Puppeteer, no new dependency. Spec 003 states its layout and network criteria as
 * `getComputedStyle` / `getBoundingClientRect` / request-log facts "in a real Chromium page", so
 * the files that assert them use this, and skip (stating why) where no browser is installed.
 */
const CANDIDATES = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];

export const CHROME_PATH = CANDIDATES.find((path): path is string => typeof path === 'string' && existsSync(path));

interface Pending {
  resolve(value: Record<string, unknown>): void;
  reject(error: Error): void;
}

type Listener = (message: { method?: string; params?: Record<string, unknown>; sessionId?: string }) => void;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface BrowserPage {
  /** Every request URL the page's own browsing context issued. */
  requests: string[];
  evaluate<T>(expression: string): Promise<T>;
  send(method: string, params?: Record<string, unknown>): Promise<Record<string, unknown>>;
  close(): Promise<void>;
}

export interface PageOptions {
  width: number;
  height: number;
  reducedMotion?: boolean;
  /** Script evaluated before the page's own scripts (a `navigator.share` stub, for instance). */
  preload?: string;
}

export interface Browser {
  open(url: string, options: PageOptions): Promise<BrowserPage>;
  /** Browser-level permission grant (the clipboard, for the copy-link scenario). */
  grant(origin: string, permissions: readonly string[]): Promise<void>;
  close(): void;
}

function requestUrl(params: Record<string, unknown> | undefined): string {
  const request = params?.request as { url?: string } | undefined;
  return String(request?.url ?? '');
}

async function versionOf(port: number): Promise<{ webSocketDebuggerUrl: string }> {
  for (let attempt = 0; attempt < 600; attempt += 1) {
    try {
      return (await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()) as { webSocketDebuggerUrl: string };
    } catch {
      await sleep(100);
    }
  }
  throw new Error('Chromium did not expose its DevTools endpoint');
}

/**
 * An OS-allocated free port. The old default was `9400 + random(400)`: with 13 browser files
 * booting at once, two instances could land on the same debugging port, and the second would
 * attach to the first browser's endpoint — a non-deterministic hang that the 10 s hook timeout
 * then reported as a timeout. Asking the OS removes the collision.
 */
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

function connect(socket: WebSocket) {
  let id = 0;
  const pending = new Map<number, Pending>();
  const listeners = new Set<Listener>();
  const settle = (waiting: Pending, message: { result?: Record<string, unknown>; error?: unknown }): void => {
    if (message.error) waiting.reject(new Error(JSON.stringify(message.error)));
    else waiting.resolve(message.result ?? {});
  };
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data)) as { id?: number; result?: Record<string, unknown>; error?: unknown };
    const waiting = pending.get(message.id ?? -1);
    if (waiting) {
      pending.delete(message.id ?? -1);
      settle(waiting, message);
      return;
    }
    for (const listener of listeners) listener(message as Parameters<Listener>[0]);
  });
  const send = (method: string, params: Record<string, unknown> = {}, sessionId?: string) =>
    new Promise<Record<string, unknown>>((resolve, reject) => {
      id += 1;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params, sessionId }));
    });
  return { send, listeners };
}

async function preparePage(send: ReturnType<typeof connect>['send'], sessionId: string, options: PageOptions) {
  await send('Network.enable', {}, sessionId);
  await send('Page.enable', {}, sessionId);
  await send('Emulation.setDeviceMetricsOverride', { width: options.width, height: options.height, deviceScaleFactor: 1, mobile: false }, sessionId);
  if (options.reducedMotion) {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }, sessionId);
  }
  if (options.preload) await send('Page.addScriptToEvaluateOnNewDocument', { source: options.preload }, sessionId);
}

export async function launchBrowser(port?: number): Promise<Browser> {
  if (!CHROME_PATH) throw new Error('no Chromium binary');
  const debuggingPort = port ?? (await freePort());
  const profile = mkdtempSync(join(tmpdir(), 'cdp-'));
  const child: ChildProcess = spawn(
    CHROME_PATH,
    ['--headless=new', `--remote-debugging-port=${debuggingPort}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'],
    { stdio: 'ignore' },
  );
  const socket = new WebSocket((await versionOf(debuggingPort)).webSocketDebuggerUrl);
  await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }));
  const { send, listeners } = connect(socket);
  return {
    async open(url, options) {
      const { targetId } = (await send('Target.createTarget', { url: 'about:blank' })) as { targetId: string };
      const { sessionId } = (await send('Target.attachToTarget', { targetId, flatten: true })) as { sessionId: string };
      const requests: string[] = [];
      let loaded = false;
      const listener: Listener = (message) => {
        if (message.sessionId !== sessionId) return;
        if (message.method === 'Network.requestWillBeSent') requests.push(requestUrl(message.params));
        if (message.method === 'Page.loadEventFired') loaded = true;
      };
      listeners.add(listener);
      await preparePage(send, sessionId, options);
      await send('Page.navigate', { url }, sessionId);
      for (let waited = 0; !loaded && waited < 60_000; waited += 50) await sleep(50);
      // Web fonts can swap in after `load` and reflow a label row; measure after they settle.
      await send('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true }, sessionId);
      // Hydration and the clock's pre-paint correction run after `load`.
      await sleep(400);
      return {
        requests,
        evaluate: async <T,>(expression: string) => {
          const result = (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true }, sessionId)) as {
            result: { value: T };
            exceptionDetails?: unknown;
          };
          if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
          return result.result.value;
        },
        send: (method, params = {}) => send(method, params, sessionId),
        close: async () => {
          listeners.delete(listener);
          await send('Target.closeTarget', { targetId });
        },
      };
    },
    async grant(origin, permissions) {
      await send('Browser.grantPermissions', { origin, permissions: [...permissions] });
    },
    close() {
      socket.close();
      child.kill('SIGKILL');
    },
  };
}
