import { describe, expect, it } from 'vitest';
import { CountdownClock } from '../../web/components/series/CountdownClock';
import { formatValue } from '../../web/content/format';
import { content, renderComponent } from '../fixtures/figures';
import { countdownValue } from '../fixtures/series';
import { decodeText } from '../helpers/render-document';

/**
 * The clock leaf's structural details, asserted as whole regions.
 *
 * These are the parts of the group that carry its *grammar* rather than its numbers: the label
 * under each field, the space that makes `16 años` read as two words, and the state attribute.
 * None of them is a number, so no measurement assertion covered them — which is exactly how a
 * dropped `{' '}` between two spans survived: the digits and the unit are still on the page, they
 * just read as `16años`.
 *
 * Spec 004 moved the three footnotes out of this leaf (they are the method region's), so what is
 * asserted here is the measurement and its labels.
 */
const ES = content('es');
const NOW = Date.parse('2041-12-28T20:57:55Z');

function renderClock(): string {
  const value = countdownValue();
  return renderComponent(CountdownClock, {
    anchor: value.anchor as string,
    nowMs: NOW,
    locale: 'es',
    strings: {
      a11y: ES.t('countdown.clock.a11y', { date: '1 de enero de 2042' }),
      days: ES.t('countdown.clock.days'),
      hours: ES.t('countdown.clock.hours'),
      minutes: ES.t('countdown.clock.minutes'),
      seconds: ES.t('countdown.clock.seconds'),
    },
    years: formatValue(value.years, 'integer', 'es', ''),
    yearsUnit: ES.t('countdown.unit'),
  });
}

function regionText(html: string, className: string): string {
  const opener = `class="${className}">`;
  const at = html.indexOf(opener);
  if (at === -1) return '';
  const start = at + opener.length;
  const fragment = html.slice(start, html.indexOf('</p>', start));
  return decodeText(fragment.replace(/<[^>]*>/g, '')).trim();
}

describe('the number group’s labels and spacing', () => {
  it('labels all four fields, in the order the group reads them', () => {
    const labels = [...renderClock().matchAll(/<span class="clock__label">([^<]*)<\/span>/g)].map((match) =>
      decodeText(match[1] as string).trim(),
    );
    // The seconds label is `s` and the minutes label is `min`: both are one or three characters,
    // so only the ordered region pins them. A blanked label leaves the span in place and empty.
    expect(labels).toEqual([
      ES.t('countdown.clock.days'),
      ES.t('countdown.clock.hours'),
      ES.t('countdown.clock.minutes'),
      ES.t('countdown.clock.seconds'),
    ]);
  });

  it('sets the years numeral and its unit as two words inside one group', () => {
    const years = formatValue(countdownValue().years, 'integer', 'es', '');
    // `16 años`, not `16años`: a substring check would pass with the space removed. The region
    // cannot.
    expect(regionText(renderClock(), 'countdown__value')).toBe(`${years} ${ES.t('countdown.unit')}`);
  });

  it('publishes the running state while the anchor is still ahead', () => {
    expect(renderClock()).toContain('data-clock-state="running"');
  });

  it('carries no footnote of its own: no anchor line, no definition, no arithmetic', () => {
    const html = renderClock();
    for (const marker of ['clock__anchor', 'clock__definition', 'clock__arithmetic']) {
      expect(html, marker).not.toContain(marker);
    }
  });
});
