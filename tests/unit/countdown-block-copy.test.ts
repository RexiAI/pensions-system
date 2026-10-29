import { describe, expect, it } from 'vitest';
import { CountdownBlock } from '../../web/components/series/CountdownBlock';
import { formatYear } from '../../web/content/format';
import type { CountdownValue } from '../../web/series/countdown';
import { content, renderComponent } from '../fixtures/figures';
import { countdownAt, countdownValue } from '../fixtures/series';
import { decodeText } from '../helpers/render-document';

/**
 * The countdown block's copy slots, asserted as whole rendered regions rather than as loose
 * substrings.
 *
 * Every assertion here exists because a mutation survived without it: the projection's copy
 * (threshold year, its label, the source and the year it was observed) is pinned by no
 * acceptance scenario, so an i18n key blanked or a `{' '}` dropped in the markup changed what a
 * reader sees while every test stayed green. Asserting the region's *exact* text is what makes
 * the space between two spans and the key behind each slot observable — a `toContain` on a bare
 * number would pass either way, because the same digits and the same unit appear inside the
 * arithmetic sentence further down the block.
 *
 * Three days out, the same pinned instant `tests/acceptance/clock.test.ts` uses.
 */
const ES = content('es');
const NOW = Date.parse('2041-12-28T20:57:55Z');

function renderBlock(value: CountdownValue = countdownValue()): string {
  return renderComponent(CountdownBlock, { content: ES, countdown: value, nowMs: NOW });
}

/** A `<p class="…">` region's text: tags stripped, entities decoded, edges trimmed. */
function regionText(html: string, className: string): string {
  const opener = `class="${className}">`;
  const at = html.indexOf(opener);
  if (at === -1) return '';
  const start = at + opener.length;
  const fragment = html.slice(start, html.indexOf('</p>', start));
  return decodeText(fragment.replace(/<[^>]*>/g, '')).trim();
}

describe('the countdown projection’s copy slots', () => {
  it('prints the threshold year and its label as one line, separated by a space', () => {
    const value = countdownValue();
    const year = formatYear(value.thresholdYear as number, 'es');
    // Pins `thresholdYear` not being coerced to zero, the label key resolving, and the space
    // between the numeral and its label surviving.
    expect(regionText(renderBlock(value), 'countdown__year-line')).toBe(
      `${year} ${ES.t('countdown.yearLabel')}`,
    );
  });

  it('prints the source and the year it was observed, separated by a space', () => {
    const value = countdownValue();
    // Pins the `provenance.observedAt` key resolving and the space before the observed year.
    expect(regionText(renderBlock(value), 'countdown__source')).toBe(
      `${ES.t('countdown.source')} · ${ES.t('provenance.observedAt')} ${formatYear(value.snapshotYear, 'es')}`,
    );
  });

  it('renders no back-cast line when the projection carries none', () => {
    // The committed snapshots always carry a back-cast, so the absence branch is reached by
    // constructing the value. The component's contract is that a projection without one renders
    // nothing — not that it throws while reading a missing field.
    const withoutBackCast: CountdownValue = { ...countdownValue(), backCast: null };
    expect(renderBlock(countdownValue())).toContain('countdown__backcast');
    expect(renderBlock(withoutBackCast)).not.toContain('countdown__backcast');
  });
});

describe('the not-crossed state’s copy slots', () => {
  const notCrossed = countdownAt(90);
  const html = renderBlock(notCrossed);

  it('carries its eyebrow as both its accessible name and its visible label', () => {
    // The block is announced by the eyebrow; a blanked `countdown.eyebrow` key silences the
    // name without changing any assertion that only counts renderable elements.
    expect(html).toContain(`aria-label="${ES.t('countdown.eyebrow')}"`);
    expect(regionText(html, 'countdown__eyebrow')).toBe(ES.t('countdown.eyebrow'));
  });

  it('still states where the projection came from', () => {
    expect(notCrossed.state).toBe('not-crossed');
    expect(regionText(html, 'countdown__source')).toBe(ES.t('countdown.source'));
  });
});
