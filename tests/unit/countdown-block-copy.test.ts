import { describe, expect, it } from 'vitest';
import { MethodRegion } from '../../web/components/public/MethodRegion';
import { formatYear } from '../../web/content/format';
import { content, renderComponent } from '../fixtures/figures';
import { countdownValue } from '../fixtures/series';
import { decodeText } from '../helpers/render-document';

/**
 * The countdown's copy slots, asserted as whole rendered regions rather than as loose substrings.
 *
 * Every assertion here exists because a mutation survived without it: the projection's copy
 * (threshold year, its label, the source and the year it was observed) is pinned by no
 * acceptance scenario, so an i18n key blanked or a `{' '}` dropped in the markup changed what a
 * reader sees while every test stayed green. Asserting the region's *exact* text is what makes the
 * space between two spans and the key behind each slot observable.
 *
 * Spec 004 moved these slots out of the story and into `#metodo` (T8): the strings are unchanged,
 * their position is not.
 */
const ES = content('es');
const NOW = Date.parse('2041-12-28T20:57:55Z');

function renderMethod(): string {
  return decodeText(
    renderComponent(MethodRegion, {
      content: ES,
      sources: { countdown: countdownValue() },
      freshnessWindowDays: 45,
      nowMs: NOW,
      countries: [{ geo: 'ES', name: ES.country.name, href: '#' }],
    }),
  );
}

function regionText(html: string, className: string): string {
  const opener = `class="${className}">`;
  const at = html.indexOf(opener);
  if (at === -1) return '';
  const start = at + opener.length;
  const fragment = html.slice(start, html.indexOf('</p>', start));
  return decodeText(fragment.replace(/<[^>]*>/g, '')).trim();
}

describe('the countdown precision’s slots', () => {
  it('prints the year pair as one group: the value, then its label', () => {
    expect(regionText(renderMethod(), 'countdown__year-line')).toBe(
      `${formatYear(countdownValue().thresholdYear ?? 0, 'es')} ${ES.t('countdown.yearLabel')}`,
    );
  });

  it('prints the variant range from the published range, not from a literal', () => {
    expect(regionText(renderMethod(), 'countdown__range')).toBe(
      ES.t('countdown.range', { min: formatYear(2039, 'es'), max: formatYear(2043, 'es') }),
    );
  });

  it('joins the anchor’s label to its date, and prints the date rather than its template', () => {
    const anchor = regionText(renderMethod(), 'clock__anchor');
    expect(anchor).toContain(ES.t('countdown.clock.anchorLabel'));
    expect(anchor).not.toContain('{date}');
    expect(anchor).toContain('2042');
  });

  it('prints the source line as the content model states it, byte for byte', () => {
    expect(regionText(renderMethod(), 'countdown__source')).toBe(ES.t('countdown.source'));
  });

  it('prints the back-cast sentence with both numbers interpolated', () => {
    const backcast = regionText(renderMethod(), 'countdown__backcast');
    expect(backcast).not.toContain('{');
    expect(backcast).toContain('31,22');
  });

  it('prints the eyebrow, the definition and both clock paragraphs', () => {
    const html = renderMethod();
    for (const key of ['countdown.eyebrow', 'countdown.definition', 'countdown.clock.definition', 'countdown.clock.arithmetic'] as const) {
      expect(html, key).toContain(ES.t(key, { date: '1 de enero de 2042', years: '16', thresholdYear: '2042', snapshotYear: '2026' }));
    }
  });
});
