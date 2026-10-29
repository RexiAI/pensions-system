import { describe, expect, it } from 'vitest';
import { CountdownBlock } from '../../web/components/series/CountdownBlock';
import { formatDate, formatValue } from '../../web/content/format';
import { CLOCK_TIME_ZONE } from '../../web/series/clock';
import type { CountdownValue } from '../../web/series/countdown';
import { content, renderComponent } from '../fixtures/figures';
import { countdownValue } from '../fixtures/series';
import { decodeText } from '../helpers/render-document';

/**
 * The clock leaf's structural details, asserted as whole regions.
 *
 * These are the parts of the rail that carry the group's *grammar* rather than its numbers: the
 * label under each field, the space that makes `16 años` read as two words, the space that joins
 * the anchor's label to its date, and the state attribute. None of them is a number, so no
 * measurement assertion covered them — which is exactly how a dropped `{' '}` between two spans
 * survived: the digits and the unit are still on the page, they just read as `16años`.
 */
const ES = content('es');
const NOW = Date.parse('2041-12-28T20:57:55Z');

function renderBlock(value: CountdownValue = countdownValue()): string {
  return renderComponent(CountdownBlock, { content: ES, countdown: value, nowMs: NOW });
}

function regionText(html: string, className: string): string {
  const opener = `class="${className}">`;
  const at = html.indexOf(opener);
  if (at === -1) return '';
  const start = at + opener.length;
  const fragment = html.slice(start, html.indexOf('</p>', start));
  return decodeText(fragment.replace(/<[^>]*>/g, '')).trim();
}

describe('the clock rail’s labels and spacing', () => {
  it('labels all four fields, in the order the group reads them', () => {
    const labels = [...renderBlock().matchAll(/<span class="clock__label">([^<]*)<\/span>/g)].map(
      (match) => decodeText(match[1] as string).trim(),
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
    const value = countdownValue();
    const years = formatValue(value.years, 'integer', 'es', '');
    // `16 años`, not `16años`: the arithmetic sentence below the fields also contains `16 años`,
    // so a substring check would pass with the space removed. The region cannot.
    expect(regionText(renderBlock(value), 'countdown__value')).toBe(`${years} ${ES.t('countdown.unit')}`);
  });

  it('joins the anchor’s label to its date, and prints the date rather than its placeholder', () => {
    const value = countdownValue();
    const date = formatDate(value.anchor as string, 'es', CLOCK_TIME_ZONE);
    const anchor = regionText(renderBlock(value), 'clock__anchor');
    expect(anchor).toBe(`${ES.t('countdown.clock.anchorLabel')} ${date}`);
    // `countdown.clock.anchor` is the template `{date}`; an uninterpolated template must never
    // reach the page.
    expect(anchor).not.toContain('{date}');
  });

  it('publishes the running state while the anchor is still ahead', () => {
    expect(renderBlock()).toContain('data-clock-state="running"');
  });
});
