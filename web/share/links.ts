/**
 * Sharing without tracking (spec 003 T3). Every share target is a plain, documented share URL
 * built here from the message and the canonical page URL — no SDK, no script, no pixel, and no
 * parameter the page did not put there itself (AC-003-26).
 */
import { readClock } from '../series/clock';

export type ShareNetwork = 'whatsapp' | 'telegram' | 'x' | 'linkedin';

/** WhatsApp first: the Spanish audience's primary channel (15-design.md §T3). */
export const SHARE_NETWORKS: readonly ShareNetwork[] = ['whatsapp', 'telegram', 'x', 'linkedin'];

/** The placeholder the server leaves in the JS template for the click-time day count. */
export const DAYS_PLACEHOLDER = '{days}';

const enc = encodeURIComponent;

/**
 * Telegram puts the URL beside the text itself, so the text it receives drops the trailing URL
 * the message already ends with; LinkedIn reads only the URL. The other two take the message.
 */
const BUILDERS: Readonly<Record<ShareNetwork, (message: string, url: string) => string>> = {
  whatsapp: (message) => `https://wa.me/?text=${enc(message)}`,
  telegram: (message, url) =>
    `https://t.me/share/url?url=${enc(url)}&text=${enc(message.replace(url, '').trimEnd())}`,
  x: (message) => `https://x.com/intent/post?text=${enc(message)}`,
  linkedin: (_message, url) => `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
};

export function shareHref(network: ShareNetwork, message: string, url: string): string {
  return BUILDERS[network](message, url);
}

/**
 * The share message at the click instant: the day count is the clock's own day value for
 * `nowMs`, read with the same function and the same anchor as the clock (AC-003-25). Once the
 * anchor has passed there is no day count to state, so the year-led message is used instead.
 */
export function messageAt(
  templates: { withDays: string; withoutDays: string },
  anchor: string,
  nowMs: number,
  formatDays: (value: number) => string,
): string {
  const reading = readClock(anchor, nowMs);
  if (reading.elapsed) return templates.withoutDays;
  return templates.withDays.replace(DAYS_PLACEHOLDER, formatDays(reading.days));
}
