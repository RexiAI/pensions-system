import type { ReactElement } from 'react';
import { BRAND } from '../brand/generated';
import { formatYear } from '../content/format';
import { contentRegistry } from '../content/registry';
import type { CountryLocaleContent } from '../content/types';
import { SOURCE_DECLARATIONS } from '../sources/types';
import { committedThresholdYear } from './threshold-year';

/**
 * The share card: the mark, the wordmark, the proposition, the five official publishers and the
 * scope line (D7, extended by R4 level 3). No metric, no day count, no date: a social platform
 * caches a card for weeks, so a number there becomes a false claim the first time the figure
 * changes. Spec 003 T4 amends this for the derived threshold year only.
 */
export interface ShareCard {
  alt: string;
  element: ReactElement;
}

function publishersLine(): string {
  return SOURCE_DECLARATIONS.map((source) => source.publisher).join(' · ');
}

/** `og:image:alt`: the site name and the proposition. Never a figure name (D7). */
export function shareAlt(locale: string, thresholdYear: number | null = committedThresholdYear()): string {
  return shareCard(locale, thresholdYear)?.alt ?? '';
}

const FRAME = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  background: BRAND.ground,
  color: BRAND.onGround,
  padding: 72,
  fontFamily: BRAND.font,
} as const;

function Mark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 72,
          height: 72,
          background: BRAND.onGround,
          color: BRAND.ground,
          fontSize: 44,
          fontWeight: 600,
        }}
      >
        {BRAND.letter}
      </div>
      <div style={{ display: 'flex', fontSize: 30, letterSpacing: 1 }}>{BRAND.wordmark}</div>
    </div>
  );
}

function ScopeLine({ name }: { name: string }) {
  return (
    <div style={{ display: 'flex', fontSize: 28, letterSpacing: 2, textTransform: 'uppercase' }}>{name}</div>
  );
}

/** The year-free card: the proposition, the publishers and the scope line (D7). */
function yearFreeCard(content: CountryLocaleContent): ShareCard {
  const proposition = content.t('hero.statement');
  const element = (
    <div style={FRAME}>
      <Mark />
      <div style={{ display: 'flex', fontSize: 76, lineHeight: 1.08, fontWeight: 600 }}>{proposition}</div>
      <div style={{ display: 'flex', fontSize: 24, opacity: 0.78 }}>{publishersLine()}</div>
      <ScopeLine name={content.country.name} />
    </div>
  );
  // The proposition already names the country in every locale (validated at build time), and the
  // card's own scope line is drawn from the country record. The alt repeats it once, never twice.
  return { alt: `${BRAND.wordmark} — ${proposition}`, element };
}

/**
 * Spec 003 T4: the card built on the derived threshold year — the eyebrow, the year, the
 * sentence and the scope line. No day count, no date, no metric: the year is the only number a
 * card may carry, because it stays true until the projection is revised.
 */
function yearCard(content: CountryLocaleContent, thresholdYear: number): ShareCard {
  const year = formatYear(thresholdYear, content.locale);
  const element = (
    <div style={FRAME}>
      <div style={{ display: 'flex', fontSize: 28, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.78 }}>
        {content.t('card.eyebrow')}
      </div>
      <div style={{ display: 'flex', fontSize: 220, lineHeight: 1, fontWeight: 600 }}>{year}</div>
      <div style={{ display: 'flex', fontSize: 40, lineHeight: 1.15 }}>{content.t('card.sentence')}</div>
      <ScopeLine name={content.country.name} />
    </div>
  );
  return { alt: `${BRAND.wordmark} — ${content.t('meta.title', { year })}`, element };
}

export function shareCard(locale: string, thresholdYear: number | null = committedThresholdYear()): ShareCard | null {
  const result = contentRegistry.get('ES', locale);
  if (!result.ok) return null;
  return thresholdYear === null ? yearFreeCard(result.content) : yearCard(result.content, thresholdYear);
}
