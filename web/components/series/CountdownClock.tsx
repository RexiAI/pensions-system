'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { integerFormatter } from '../../content/format';
import type { Locale } from '../../content/types';
import { readClock } from '../../series/clock';
import type { ClockField, ClockReading } from '../../series/clock';
import { startClockTicker } from '../../series/clock-ticker';

/** The seven copy slots the design requires, already resolved to text by the server parent. */
export interface ClockStrings {
  a11y: string;
  anchor: string;
  anchorLabel: string;
  definition: string;
  arithmetic: string;
  elapsed: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

export interface CountdownClockProps {
  /** `{thresholdYear}-01-01T00:00:00+01:00`, derived by `anchorFor`, never authored. */
  anchor: string;
  /** The instant this markup is rendered at. Corrected from the device clock before paint. */
  nowMs: number;
  locale: Locale;
  strings: ClockStrings;
}

/** The three animated fields: `aria-hidden`, because they change 60 times a minute. */
const SUB_FIELDS: readonly { field: ClockField; label: keyof ClockStrings }[] = [
  { field: 'hours', label: 'hours' },
  { field: 'minutes', label: 'minutes' },
  { field: 'seconds', label: 'seconds' },
];

const PAD = 2;

function subDay(value: number): string {
  return String(value).padStart(PAD, '0');
}

/**
 * The clock rail (T20, §P2). Server-rendered complete — four fields, the anchor line and the
 * definition are in the HTML before any script runs — then corrected from the device clock in a
 * pre-paint layout effect and ticked at 1 Hz.
 *
 * What is deliberately absent: `aria-live`, `role="timer"`, `aria-atomic`, `aria-busy` (nothing
 * announces sixty times a minute), any colons between the fields, and any React state — the tick
 * writes four `textContent` values through refs, so there is no re-render and no layout work.
 */
export function CountdownClock({ anchor, nowMs, locale, strings }: CountdownClockProps) {
  const reading = readClock(anchor, nowMs);
  const formatDays = useMemo(() => integerFormatter(locale), [locale]);
  const refs: Record<ClockField, RefObject<HTMLSpanElement | null>> = {
    days: useRef<HTMLSpanElement>(null),
    hours: useRef<HTMLSpanElement>(null),
    minutes: useRef<HTMLSpanElement>(null),
    seconds: useRef<HTMLSpanElement>(null),
  };

  useLayoutEffect(() => {
    const write = (next: ClockReading): void => {
      const values: Record<ClockField, string> = {
        days: formatDays(next.days),
        hours: subDay(next.hours),
        minutes: subDay(next.minutes),
        seconds: subDay(next.seconds),
      };
      for (const field of ['days', 'hours', 'minutes', 'seconds'] as const) {
        const element = refs[field].current;
        if (element) element.textContent = values[field];
      }
    };
    write(readClock(anchor, Date.now()));
    const ticker = startClockTicker({ anchor, onTick: write });
    return () => ticker.stop();
    // `refs` is a stable set of ref objects; re-running on `anchor` and the formatter is the
    // whole intent, and the rule's exhaustive-deps advice would only re-subscribe per render.
  }, [anchor, formatDays, refs]);

  return (
    <div
      className="clock"
      role="group"
      aria-label={strings.a11y}
      data-clock-state={reading.elapsed ? 'elapsed' : 'running'}
    >
      <div className="clock__fields">
        <p className="clock__field">
          <span className="clock__value clock__value--days" ref={refs.days} suppressHydrationWarning>
            {formatDays(reading.days)}
          </span>
          <span className="clock__label">{strings.days}</span>
        </p>
        {SUB_FIELDS.map((entry) => (
          <p className="clock__field clock__field--sub" key={entry.field} aria-hidden="true">
            <span
              className="clock__value clock__value--sub"
              ref={refs[entry.field]}
              suppressHydrationWarning
            >
              {subDay(reading[entry.field])}
            </span>
            <span className="clock__label">{strings[entry.label]}</span>
          </p>
        ))}
      </div>
      <p className="clock__anchor">
        <span className="clock__anchor-label">{strings.anchorLabel}</span>{' '}
        <span className="clock__anchor-date">{strings.anchor}</span>
      </p>
      <p className="clock__definition">{reading.elapsed ? strings.elapsed : strings.definition}</p>
      <p className="clock__arithmetic">{strings.arithmetic}</p>
    </div>
  );
}
