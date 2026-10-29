import { afterEach, describe, expect, it, vi } from 'vitest';
import { anchorFor, anchorInstant, readClock } from '../../web/series/clock';
import { startClockTicker } from '../../web/series/clock-ticker';
import type { MotionQuery, VisibilitySource } from '../../web/series/clock-ticker';
import { computeCountdown } from '../../web/series/countdown';
import { committedPayload } from '../fixtures/series';

/**
 * The clock's guarantees that a render assertion cannot reach: the boundary at the anchor
 * instant, an unparseable anchor, and the reduced-motion *transition*.
 *
 * `clock.test.ts` proves what the reader receives (four fields, the anchor line, the definition,
 * no live region). These tests prove the branches behind that markup actually decide, so a
 * mutant that removes one is a failing test rather than a silent change.
 */

const ANCHOR = '2042-01-01T00:00:00+01:00';
const THREE_DAYS_OUT = anchorInstant(ANCHOR) - 3 * 86_400_000;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

interface FakeMotion extends MotionQuery {
  emit(matches: boolean): void;
  /** The event names the ticker asked for, in order. */
  added: string[];
  removed: string[];
}

function fakeMotion(matches: boolean): FakeMotion {
  let listener: (() => void) | null = null;
  const added: string[] = [];
  const removed: string[] = [];
  const query: FakeMotion = {
    matches,
    added,
    removed,
    emit(next: boolean): void {
      query.matches = next;
      listener?.();
    },
    addEventListener: (type, handler) => {
      added.push(type);
      listener = handler;
    },
    removeEventListener: (type) => {
      removed.push(type);
      listener = null;
    },
  };
  return query;
}

interface FakeDoc extends VisibilitySource {
  emit(): void;
  /** Keeps delivering events after `removeEventListener`, as a teardown race would. */
  emitThroughTeardown(next: 'visible' | 'hidden'): void;
  added: string[];
  removed: string[];
}

function fakeDocument(visibility: 'visible' | 'hidden' = 'visible'): FakeDoc {
  let listener: (() => void) | null = null;
  let retained: (() => void) | null = null;
  const added: string[] = [];
  const removed: string[] = [];
  const doc: FakeDoc = {
    visibilityState: visibility,
    added,
    removed,
    emit: () => listener?.(),
    emitThroughTeardown: (next) => {
      doc.visibilityState = next;
      retained?.();
    },
    addEventListener: (type, handler) => {
      added.push(type);
      listener = handler;
      retained = handler;
    },
    removeEventListener: (type) => {
      removed.push(type);
      listener = null;
    },
  };
  return doc;
}

/** A ticker whose scheduling is recorded rather than performed. */
function recorder(overrides: { motion?: MotionQuery; doc?: VisibilitySource } = {}) {
  const created: number[] = [];
  const cancelled: number[] = [];
  const ticks: number[] = [];
  const handlers: Array<() => void> = [];
  const ticker = startClockTicker({
    anchor: ANCHOR,
    onTick: (reading) => ticks.push(reading.days),
    now: () => THREE_DAYS_OUT,
    document: overrides.doc ?? fakeDocument(),
    motionQuery: overrides.motion ?? fakeMotion(false),
    schedule: (handler) => {
      handlers.push(handler);
      created.push(created.length + 1);
      return created.length;
    },
    cancel: (handle) => cancelled.push(Number(handle)),
  });
  return { ticker, created, cancelled, ticks, handlers };
}

describe('AC-001-115: the anchor instant is the boundary of the count', () => {
  it('AC-001-115: reports elapsed at exactly the anchor instant, not one second later', () => {
    // `remaining <= 0` is the elapsed test, not `remaining < 0`: the last second of the count
    // is the second before the anchor, and the instant itself has passed.
    expect(readClock(ANCHOR, anchorInstant(ANCHOR))).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      elapsed: true,
    });
    // One second earlier is still counting, and reads the last second.
    expect(readClock(ANCHOR, anchorInstant(ANCHOR) - 1000)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
      elapsed: false,
    });
  });

  it('AC-001-108: never answers with NaN fields, even for an anchor that does not parse', () => {
    // `anchorProblem` is the gate that keeps a bad anchor out of the data; this is the second
    // line of defence, so a drifted artefact renders the elapsed state instead of NaN.
    for (const badAnchor of ['not-an-instant', '', 'null']) {
      expect(readClock(badAnchor, anchorInstant(ANCHOR)), badAnchor).toEqual({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        elapsed: true,
      });
    }
  });

  it('AC-001-108: pads a three-digit year to four, so the instant is always ISO-8601', () => {
    // No year in this deployment is below 1000; the padding is what keeps a short year from
    // producing a string `Date.parse` reads differently.
    expect(anchorFor(42)).toBe('0042-01-01T00:00:00+01:00');
    expect(anchorFor(2042)).toBe(ANCHOR);
    expect(new Date(anchorFor(42) as string).toISOString()).toBe('0041-12-31T23:00:00.000Z');
  });

  it('AC-001-108: refuses a threshold year that is not an integer', () => {
    for (const notAYear of [Number.NaN, Number.POSITIVE_INFINITY, 2042.5, -1.5]) {
      expect(anchorFor(notAYear), String(notAYear)).toBeNull();
    }
    // The two integer forms that exist: a year, and no year.
    expect(anchorFor(0)).toBe('0000-01-01T00:00:00+01:00');
    expect(anchorFor(undefined)).toBeNull();
  });
});

describe('AC-001-110: a countdown with no threshold year carries no anchor', () => {
  it('AC-001-110: the not-crossed value answers a null anchor, so no clock can be mounted from it', () => {
    const notCrossed = computeCountdown({
      projected: committedPayload('eurostat-proj-23np-ratio'),
      observed: committedPayload('eurostat-demo-pjan'),
      snapshotYear: 2026,
      threshold: 90,
    });

    expect(notCrossed.state).toBe('not-crossed');
    expect(notCrossed.thresholdYear).toBeNull();
    // The three fields a clock needs are all absent together — never a year without an anchor.
    expect(notCrossed.anchor).toBeNull();
    expect(notCrossed.years).toBeNull();
  });

  it('AC-001-110: the crossing year is reached, not exceeded, by the threshold', () => {
    // `>=` is what makes the threshold the crossing point: a year that publishes exactly the
    // threshold has crossed it, and the range must start there rather than one year later.
    expect(
      computeCountdown({
        projected: committedPayload('eurostat-proj-23np-ratio'),
        observed: committedPayload('eurostat-demo-pjan'),
        snapshotYear: 2026,
        threshold: 50,
      }).thresholdYear,
    ).toBe(2042);
  });
});

describe('AC-001-112: the timer honours a change of the reader’s motion preference', () => {
  it('AC-001-112: a live switch to reduced motion clears the interval and stops ticking', () => {
    const motion = fakeMotion(false);
    const { ticker, created, cancelled, ticks } = recorder({ motion });

    expect(created).toEqual([1]);
    const ticksBefore = ticks.length;

    motion.emit(true);
    expect(cancelled).toEqual([1]);
    expect(ticks.length).toBe(ticksBefore);

    ticker.stop();
  });

  it('AC-001-112: switching back to motion recomputes immediately and restarts the interval', () => {
    const motion = fakeMotion(true);
    const { ticker, created, ticks } = recorder({ motion });

    // Reduced motion at mount: nothing scheduled, nothing ticked.
    expect(created).toEqual([]);
    expect(ticks).toEqual([]);

    motion.emit(false);
    expect(created).toEqual([1]);
    // The visible field must be correct at the instant motion is allowed, not one tick later.
    expect(ticks).toEqual([3]);

    ticker.stop();
  });

  it('AC-001-112: a change that leaves motion allowed does not restart the interval', () => {
    const motion = fakeMotion(false);
    const { ticker, created } = recorder({ motion });

    motion.emit(false);
    // Same preference, same timer: clearing and rescheduling on every event is the thrash the
    // one-timer rule exists to prevent.
    expect(created).toEqual([1]);
    expect(motion.added).toEqual(['change']);

    ticker.stop();
  });

  it('AC-001-112: stop detaches the motion listener, so a later change cannot restart the timer', () => {
    const motion = fakeMotion(false);
    const { ticker, created } = recorder({ motion });

    ticker.stop();
    expect(motion.removed).toEqual(['change']);
    motion.emit(false);
    expect(created).toEqual([1]);
  });

  it('AC-001-114: a visibility event delivered during teardown cannot restart the timer', () => {
    // React's StrictMode mounts, cleans up and mounts again; a `visibilitychange` that arrives
    // while the listener is being detached must find a stopped ticker, not a live one.
    const doc = fakeDocument();
    const { ticker, created } = recorder({ doc });

    expect(created).toEqual([1]);
    expect(doc.added).toEqual(['visibilitychange']);
    ticker.stop();
    expect(doc.removed).toEqual(['visibilitychange']);
    doc.emitThroughTeardown('visible');
    expect(created).toEqual([1]);
  });
});

describe('AC-001-114: the ticker’s own scheduling primitives', () => {
  it('AC-001-112: asks the browser for the reduce-motion query, and honours it', () => {
    // The query string is the whole mechanism: ask for the wrong media feature and reduced
    // motion is never detected, so the clock animates for a reader who asked it not to.
    const asked: string[] = [];
    vi.stubGlobal('window', {
      matchMedia: (query: string) => {
        asked.push(query);
        return { matches: true };
      },
    });

    const created: number[] = [];
    const ticker = startClockTicker({
      anchor: ANCHOR,
      onTick: () => undefined,
      now: () => THREE_DAYS_OUT,
      schedule: () => {
        created.push(1);
        return 1;
      },
      cancel: () => undefined,
    });

    expect(asked).toEqual(['(prefers-reduced-motion: reduce)']);
    expect(created).toEqual([]);
    ticker.stop();
  });

  it('AC-001-114: falls back to “motion allowed” when there is no window to ask', () => {
    // Node has no `window`, so the default query must answer NO_MOTION rather than throw: an
    // absent matchMedia is not a reduced-motion preference.
    const created: number[] = [];
    const ticker = startClockTicker({
      anchor: ANCHOR,
      onTick: () => undefined,
      now: () => THREE_DAYS_OUT,
      schedule: () => {
        created.push(1);
        return 1;
      },
    });

    expect(created).toEqual([1]);
    ticker.stop();
  });

  it('AC-001-114: subscribes to the real document when none is injected', () => {
    // The default `document` is the one the page actually has; a ticker that quietly used its
    // no-op stand-in would never stop for a background tab.
    const doc = fakeDocument();
    vi.stubGlobal('document', doc);
    const created: number[] = [];
    const cancelled: number[] = [];
    const ticker = startClockTicker({
      anchor: ANCHOR,
      onTick: () => undefined,
      now: () => THREE_DAYS_OUT,
      motionQuery: fakeMotion(false),
      schedule: () => {
        created.push(1);
        return created.length;
      },
      cancel: (handle) => cancelled.push(Number(handle)),
    });

    expect(created).toEqual([1]);
    doc.visibilityState = 'hidden';
    doc.emit();
    expect(cancelled).toEqual([1]);
    ticker.stop();
  });

  it('AC-001-114: the scheduled handler recomputes the fields, it does not replay them', () => {
    let now = THREE_DAYS_OUT;
    const ticks: number[] = [];
    const handlers: Array<() => void> = [];
    const ticker = startClockTicker({
      anchor: ANCHOR,
      onTick: (reading) => ticks.push(reading.days),
      now: () => now,
      document: fakeDocument(),
      motionQuery: fakeMotion(false),
      schedule: (handler) => {
        handlers.push(handler);
        return 1;
      },
      cancel: () => undefined,
    });

    handlers[0]?.();
    now += 86_400_000;
    handlers[0]?.();
    expect(ticks).toEqual([3, 2]);
    ticker.stop();
  });

  it('AC-001-114: the default interval really ticks, and stop really clears it', () => {
    // The default `schedule`/`cancel` are the production path — `setInterval` and
    // `clearInterval` — so they get exercised rather than injected around.
    vi.useFakeTimers();
    const ticks: number[] = [];
    const ticker = startClockTicker({
      anchor: ANCHOR,
      onTick: (reading) => ticks.push(reading.seconds),
      document: fakeDocument(),
      motionQuery: fakeMotion(false),
    });

    vi.advanceTimersByTime(3000);
    expect(ticks.length).toBe(3);

    ticker.stop();
    vi.advanceTimersByTime(3000);
    expect(ticks.length).toBe(3);
  });

  it('AC-001-114: clears a numeric handle exactly once', () => {
    const clear = vi.spyOn(globalThis, 'clearInterval');
    const ticker = startClockTicker({
      anchor: ANCHOR,
      onTick: () => undefined,
      now: () => THREE_DAYS_OUT,
      document: fakeDocument(),
      motionQuery: fakeMotion(false),
      schedule: () => 42,
    });

    ticker.stop();
    expect(clear).toHaveBeenCalledTimes(1);
    expect(clear).toHaveBeenCalledWith(42);
    clear.mockRestore();
  });

  it('AC-001-114: clears an object handle exactly once', () => {
    // `setInterval` answers a number in a browser and a `Timeout` object in Node; the default
    // cancel has to handle both, and a leaked interval is a timer nobody can stop.
    const clear = vi.spyOn(globalThis, 'clearInterval');
    const handle = { ref: () => undefined, unref: () => undefined };
    const ticker = startClockTicker({
      anchor: ANCHOR,
      onTick: () => undefined,
      now: () => THREE_DAYS_OUT,
      document: fakeDocument(),
      motionQuery: fakeMotion(false),
      schedule: () => handle,
    });

    ticker.stop();
    expect(clear).toHaveBeenCalledTimes(1);
    expect(clear).toHaveBeenCalledWith(handle);
    clear.mockRestore();
  });

  it('AC-001-114: never calls cancel for an interval that was never created', () => {
    // Reduced motion at mount, then unmount: there is no handle to clear, and clearing one
    // anyway would be a call into a timer this page never owned.
    const cancelled: unknown[] = [];
    const ticker = startClockTicker({
      anchor: ANCHOR,
      onTick: () => undefined,
      now: () => THREE_DAYS_OUT,
      document: fakeDocument(),
      motionQuery: fakeMotion(true),
      schedule: () => 'handle',
      cancel: (handle) => cancelled.push(handle),
    });

    ticker.stop();
    expect(cancelled).toEqual([]);
  });
});
