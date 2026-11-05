'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { integerFormatter } from '../../content/format';
import type { Locale } from '../../content/types';
import { readClock } from '../../series/clock';
import type { ClockField, ClockReading } from '../../series/clock';
import { startClockTicker } from '../../series/clock-ticker';

/** The six copy slots the number group needs, already resolved to text by the server parent. */
export interface ClockStrings {
  /** The group's accessible name: the target date in plain words (spec 004 T7). */
  a11y: string;
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
  /** The years quantity, already formatted: it is the group's first numeral (spec 002 §T3). */
  years: string;
  /** The years unit label beside it, already resolved from `countdown.unit`. */
  yearsUnit: string;
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

type ClockRefs = Record<ClockField, RefObject<HTMLSpanElement | null>>;

/**
 * Four stable refs, one per field. The tick writes through them, so the leaf never holds state
 * and a tick costs no render.
 */
function useClockRefs(): ClockRefs {
  return {
    days: useRef<HTMLSpanElement>(null),
    hours: useRef<HTMLSpanElement>(null),
    minutes: useRef<HTMLSpanElement>(null),
    seconds: useRef<HTMLSpanElement>(null),
  };
}

/**
 * The pre-paint correction and the 1 Hz tick, in one layout effect: the server's reading is
 * replaced from the device clock before the first paint, then ticked. The ticker module owns the
 * interval; this subscribes to it.
 */
function useClockTicker({
  anchor,
  formatDays,
  refs,
}: {
  anchor: string;
  formatDays: (value: number) => string;
  refs: ClockRefs;
}): void {
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
}

/** The years numeral, the group's first child: pre-resolved text, so this leaf resolves nothing. */
function YearsNumeral({ years, unit }: { years: string; unit: string }) {
  return (
    <p className="countdown__value">
      <span className="countdown__numeral">{years}</span>{' '}
      <span className="countdown__unit">{unit}</span>
    </p>
  );
}

/** The day count and the three sub-day fields, one band: the four quantities the tick writes. */
function ClockFields({
  formatDays,
  reading,
  strings,
  refs,
}: {
  formatDays: (value: number) => string;
  reading: ClockReading;
  strings: ClockStrings;
  refs: ClockRefs;
}) {
  return (
    <div className="clock__fields">
      <p className="clock__field clock__field--days">
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
  );
}

/**
 * The clock group (T20, §P2; rescoped by spec 004 T2/T7). Server-rendered complete — the years
 * numeral and the four fields are in the HTML before any script runs — then corrected from the
 * device clock in a pre-paint layout effect and ticked at 1 Hz.
 *
 * Spec 004 removes the three footnotes from this leaf: the anchor line, the definition and the
 * arithmetic are methodological precision, and they render in `#metodo`, below the story. What
 * stays here is the measurement and the group's accessible name, which states the target date in
 * plain words instead of naming a conventional date.
 *
 * What is deliberately absent: `aria-live`, `role="timer"`, `aria-atomic`, `aria-busy` (nothing
 * announces sixty times a minute), any colons between the fields, and any React state — the tick
 * writes four `textContent` values through refs, so there is no re-render and no layout work.
 */
export function CountdownClock({ anchor, nowMs, locale, strings, years, yearsUnit }: CountdownClockProps) {
  const reading = readClock(anchor, nowMs);
  const formatDays = useMemo(() => integerFormatter(locale), [locale]);
  const refs = useClockRefs();
  useClockTicker({ anchor, formatDays, refs });

  return (
    <div
      className="clock"
      role="group"
      aria-label={strings.a11y}
      data-clock-state={reading.elapsed ? 'elapsed' : 'running'}
    >
      <YearsNumeral years={years} unit={yearsUnit} />
      <ClockFields formatDays={formatDays} reading={reading} strings={strings} refs={refs} />
    </div>
  );
}
