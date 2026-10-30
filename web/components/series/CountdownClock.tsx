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

/** The anchor the fields count to, the definition of the reading, and its arithmetic. */
function ClockFootnotes({ strings, elapsed }: { strings: ClockStrings; elapsed: boolean }) {
  return (
    <>
      <p className="clock__anchor">
        <span className="clock__anchor-label">{strings.anchorLabel}</span>{' '}
        <span className="clock__anchor-date">{strings.anchor}</span>
      </p>
      <p className="clock__definition">{elapsed ? strings.elapsed : strings.definition}</p>
      <p className="clock__arithmetic">{strings.arithmetic}</p>
    </>
  );
}

/**
 * The clock rail (T20, §P2). Server-rendered complete — the years numeral, four fields, the
 * anchor line and the definition are in the HTML before any script runs — then corrected from the
 * device clock in a pre-paint layout effect and ticked at 1 Hz.
 *
 * Spec 002 §T3 merges the years numeral into this container: it is the group's first child, so a
 * reader reads `N años`, then `M días HH MM SS`, then the date both quantities resolve to. The
 * numeral arrives as pre-resolved text from the server parent, the same convention as the
 * `ClockStrings` slots, so this leaf still resolves nothing from the content model.
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
      <ClockFootnotes strings={strings} elapsed={reading.elapsed} />
    </div>
  );
}
