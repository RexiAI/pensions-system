import type { ReactElement } from 'react';
import { BRAND } from '../brand/generated';
import { contentRegistry } from '../content/registry';
import { SOURCE_DECLARATIONS } from '../sources/types';

/**
 * The share card: the mark, the wordmark, the proposition and the five official publishers.
 * No metric, no number, no date (D7): a social platform caches a card for weeks, so a number
 * there becomes a false claim the first time the figure changes.
 */
export interface ShareCard {
  alt: string;
  element: ReactElement;
}

function publishersLine(): string {
  return SOURCE_DECLARATIONS.map((source) => source.publisher).join(' · ');
}

/** `og:image:alt`: the site name and the proposition. Never a figure name (D7). */
export function shareAlt(locale: string): string {
  return shareCard(locale)?.alt ?? '';
}

export function shareCard(locale: string): ShareCard | null {
  const result = contentRegistry.get('ES', locale);
  if (!result.ok) return null;
  const { content } = result;
  const proposition = content.t('hero.statement');
  const element = (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: BRAND.ground,
        color: BRAND.onGround,
        padding: 72,
        fontFamily: BRAND.font,
      }}
    >
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
        <div style={{ fontSize: 30, letterSpacing: 1 }}>{BRAND.wordmark}</div>
      </div>
      <div style={{ display: 'flex', fontSize: 76, lineHeight: 1.08, fontWeight: 600 }}>{proposition}</div>
      <div style={{ display: 'flex', fontSize: 24, opacity: 0.78 }}>{publishersLine()}</div>
    </div>
  );
  return { alt: `${BRAND.wordmark} — ${proposition}`, element };
}
