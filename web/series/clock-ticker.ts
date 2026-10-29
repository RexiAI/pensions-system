/**
 * The clock's timer (T20, §P2 Performance). One interval per page, created in one client leaf,
 * cleared on unmount and while the tab is hidden, and never created at all under reduced motion.
 *
 * The scheduling primitives are injected so the contract is testable without a browser: a test
 * can assert that exactly one interval exists, that hiding the tab cancels it, and that showing
 * it restarts it — which is what AC-001-114 asks for and what a rendered string cannot show.
 */
import { CLOCK_TICK_MS, readClock } from './clock';
import type { ClockReading } from './clock';

/** The slice of `document` the ticker needs; the real `Document` satisfies it structurally. */
export interface VisibilitySource {
  visibilityState: string;
  addEventListener(type: 'visibilitychange', listener: () => void): void;
  removeEventListener(type: 'visibilitychange', listener: () => void): void;
}

/** The slice of a `MediaQueryList` the ticker needs. */
export interface MotionQuery {
  matches: boolean;
  addEventListener?(type: 'change', listener: () => void): void;
  removeEventListener?(type: 'change', listener: () => void): void;
}

export interface ClockTickerOptions {
  anchor: string;
  onTick: (reading: ClockReading) => void;
  now?: () => number;
  document?: VisibilitySource;
  motionQuery?: MotionQuery;
  schedule?: (handler: () => void, ms: number) => unknown;
  cancel?: (handle: unknown) => void;
}

export interface ClockTicker {
  /** Cancels the interval and detaches both listeners. Idempotent. */
  stop(): void;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** A no-op document for a server render or a test: the ticker then has nothing to subscribe to. */
const NO_DOCUMENT: VisibilitySource = {
  visibilityState: 'visible',
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
};

/** No matchMedia (or a reduced-motion query that is absent) is "motion allowed". */
const NO_MOTION: MotionQuery = { matches: false };

function defaultDocument(): VisibilitySource {
  return typeof document === 'undefined' ? NO_DOCUMENT : document;
}

function defaultMotionQuery(): MotionQuery {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return NO_MOTION;
  return window.matchMedia(REDUCED_MOTION_QUERY);
}

/** Older engines expose only `addListener`; an absent subscription is a supported state. */
function subscribe(query: MotionQuery, listener: () => void): void {
  if (query.addEventListener) query.addEventListener('change', listener);
}

function unsubscribe(query: MotionQuery, listener: () => void): void {
  if (query.removeEventListener) query.removeEventListener('change', listener);
}

function defaultSchedule(handler: () => void, ms: number): unknown {
  return setInterval(handler, ms);
}

function defaultCancel(handle: unknown): void {
  if (typeof handle === 'number') clearInterval(handle);
  if (typeof handle === 'object' && handle !== null) clearInterval(handle as ReturnType<typeof setInterval>);
}

/** Everything the callbacks share. A plain record keeps each callback a small, flat function. */
interface TickerContext {
  anchor: string;
  onTick: (reading: ClockReading) => void;
  now: () => number;
  reduced: () => boolean;
  schedule: (handler: () => void, ms: number) => unknown;
  cancel: (handle: unknown) => void;
  handle: unknown;
  stopped: boolean;
}

function clearHandle(context: TickerContext): void {
  if (context.handle === null) return;
  context.cancel(context.handle);
  context.handle = null;
}

function runnable(context: TickerContext): boolean {
  if (context.stopped) return false;
  if (context.reduced()) return false;
  return !readClock(context.anchor, context.now()).elapsed;
}

function tickNow(context: TickerContext): void {
  context.onTick(readClock(context.anchor, context.now()));
}

function startHandle(context: TickerContext): void {
  if (context.handle !== null) return;
  if (!runnable(context)) return;
  context.handle = context.schedule(() => tickNow(context), CLOCK_TICK_MS);
}

/** A background tab must not run a fifteen-year timer: hidden clears, visible recomputes. */
function onVisibilityChange(context: TickerContext, source: VisibilitySource): void {
  if (source.visibilityState === 'hidden') {
    clearHandle(context);
    return;
  }
  tickNow(context);
  startHandle(context);
}

function onMotionChange(context: TickerContext): void {
  if (context.reduced()) {
    clearHandle(context);
    return;
  }
  tickNow(context);
  startHandle(context);
}

/**
 * Starts the tick. Returns `{ stop }`, which must run on unmount.
 *
 * No interval is created when the anchor is absent, already passed (`elapsed`), or when the
 * reader prefers reduced motion: in each case the day count, the anchor line and the definition
 * are complete on their own, and a field that never changes reads as a stopped clock.
 */
export function startClockTicker({
  anchor,
  onTick,
  now = () => Date.now(),
  document: source = defaultDocument(),
  motionQuery = defaultMotionQuery(),
  schedule = defaultSchedule,
  cancel = defaultCancel,
}: ClockTickerOptions): ClockTicker {
  const context: TickerContext = {
    anchor,
    onTick,
    now,
    reduced: () => motionQuery.matches,
    schedule,
    cancel,
    handle: null,
    stopped: false,
  };
  const visibility = () => onVisibilityChange(context, source);
  const motion = () => onMotionChange(context);

  startHandle(context);
  source.addEventListener('visibilitychange', visibility);
  subscribe(motionQuery, motion);

  return {
    stop(): void {
      context.stopped = true;
      clearHandle(context);
      source.removeEventListener('visibilitychange', visibility);
      unsubscribe(motionQuery, motion);
    },
  };
}
