import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { displayPercent, drawnFraction } from '../../web/series/fuse';
import { COUNTDOWN_THRESHOLD } from '../../web/series/countdown';
import { readClock } from '../../web/series/clock';
import { formatWholePercent } from '../../web/content/format';
import { LOCALES } from '../../web/content/types';
import { content } from '../fixtures/figures';
import { countdownAt, countdownSeries, countdownValue, pyramidSeries, seriesFixtures } from '../fixtures/series';
import { classesOf, anchorDate, metodoPage, numberSentence, stepOf, storyPage, textOf } from '../helpers/story';

const FUSE_SERIES = seriesFixtures().find((entry) => entry.seriesId === 'fuse');
if (FUSE_SERIES === undefined) throw new Error('no fuse series');

/** The story's text nodes with the operator subtrees removed: what a reader sees. */
function storyText(html: string): string {
  // The chart's own axis and band labels are data, not story copy: they carry `50–54` and `100+`
  // and would make a "the threshold is stated once" count meaningless.
  return textOf(html.replace(/<details[\s\S]*?<\/details>/g, '').replace(/<svg[\s\S]*?<\/svg>/g, ''));
}

describe('AC-004-06: the day count comes from the committed countdown', () => {
  it('AC-004-06: the day count is the committed anchor’s, at the pinned instant', () => {
    const nowMs = Date.parse('2026-10-31T10:00:00Z');
    const html = storyPage('es', { nowMs });
    const expected = readClock(countdownValue().anchor as string, nowMs).days;
    expect(stepOf(html, 'number')).toContain(`>${expected}<`);
    // One source of days: the committed anchor, read by the clock, appearing once on the page.
    expect(html.split('clock__value--days').length - 1).toBe(1);
  });

  it('AC-004-06: the day numeral is on the ladder’s top step and larger than the h1', () => {
    const css = readFileSync('web/styles/globals.css', 'utf8');
    const tokens = readFileSync('web/styles/tokens.css', 'utf8');
    expect(css).toMatch(/\.clock__value--days\s*\{[^}]*font-size:\s*var\(--text-num-xl\)/s);
    expect(tokens).toMatch(/--text-display:\s*clamp\(2\.5rem, 4\.9vw, 4rem\);/);
    expect(tokens).toMatch(/--text-num-xl:\s*clamp\([^)]*5rem\)/);
  });
});

describe('AC-004-07: step 1 carries the number and one plain sentence, nothing else', () => {
  it('AC-004-07: the step’s visible text is the one number, one sentence and the label', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      const step = stepOf(storyPage(locale), 'number');
      const classes = classesOf(step);
      // Re-pointed by spec 006 T11: one quantity, its unit, the label and the sentence.
      expect(classes, locale).toContain('clock__value--days');
      expect(classes, locale).toContain('clock__label');
      expect(classes, locale).not.toContain('clock__value--sub');
      expect(classes, locale).not.toContain('countdown__numeral');
      const text = storyText(step);
      expect(text, locale).toContain(numberSentence(locale));
      expect(text, locale).toContain(local.t('steps.number.label'));
      expect(text, locale).toContain(local.t('countdown.clock.days'));
    }
  });

  it('AC-004-07: it renders none of the seven precision keys, and no details', () => {
    const step = stepOf(storyPage(), 'number');
    for (const marker of [
      'countdown__definition',
      'countdown__range',
      'countdown__source',
      'countdown__backcast',
      'countdown__year-line',
      'clock__definition',
      'clock__arithmetic',
    ]) {
      expect(step, marker).not.toContain(marker);
    }
    expect(step).not.toContain('<details');
  });
});

describe('AC-004-08: the h1 is step 1’s heading and still names the country', () => {
  it('AC-004-08: exactly one h1, inside step 1, above the day-count group', () => {
    for (const locale of LOCALES) {
      const html = storyPage(locale);
      expect(html.split('<h1').length - 1, locale).toBe(1);
      const step = stepOf(html, 'number');
      expect(step, locale).toContain('<h1');
      expect(step.indexOf('<h1'), locale).toBeLessThan(step.indexOf('clock__value--days'));
      expect(textOf(step.slice(step.indexOf('<h1'), step.indexOf('</h1>'))), locale).toContain(
        content(locale).country.name,
      );
    }
  });
});

describe('AC-004-09: no threshold year, no number, and no empty step', () => {
  it('AC-004-09: step 1 states the projection’s sentence and no number', () => {
    const notCrossed = { ...countdownSeries(), value: countdownAt(90) };
    const html = storyPage('es', { series: [pyramidSeries(), notCrossed, FUSE_SERIES] });
    const step = stepOf(html, 'number');
    expect(step).toContain(content('es').t('countdown.notCrossed', { year: 2100 }));
    expect(step).not.toContain('clock__value--days');
    expect(step).not.toContain('class="clock"');
    // Steps 2 to 5 keep their order and none is empty.
    const ids = [...html.matchAll(/data-top-step="([a-z]+)"/g)].map((match) => match[1]);
    expect(ids).toEqual(['number', 'breakage', 'why', 'distance', 'meaning']);
    for (const id of ids) expect(textOf(stepOf(html, id ?? '')).length, id).toBeGreaterThan(0);
  });
});

describe('AC-004-10: one sentence, bound to the shared parameter', () => {
  it('AC-004-10: step 2 is one p, one key, both placeholders', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      const step = stepOf(storyPage(locale), 'breakage');
      expect(step.split('<p').length - 1, locale).toBe(1);
      const template = local.strings['steps.breakage.sentence'];
      expect(template, locale).toContain('{threshold}');
      expect(template, locale).toContain('{base}');
      const rendered = local.t('steps.breakage.sentence', {
        threshold: String(COUNTDOWN_THRESHOLD),
        base: '100',
      });
      expect(textOf(step), locale).toContain(rendered);
      expect(textOf(step), locale).not.toContain('proj_23np');
    }
  });
});

describe('AC-005-10: the proportion is stated in step 1 and step 2, and nowhere else', () => {
  it('AC-005-10: the threshold-and-base carrier set is number and breakage', () => {
    const html = storyPage('es');
    const carriers = ['number', 'breakage', 'why', 'distance', 'meaning'].filter((id) => {
      const text = storyText(stepOf(html, id));
      return new RegExp(`(?<![\\d.,])${COUNTDOWN_THRESHOLD}(?![\\d.,])`).test(text) && /(?<![\d.,])100(?![\d.,])/.test(text);
    });
    expect(carriers).toEqual(['number', 'breakage']);
  });
});

describe('AC-004-12: step 2 adds nothing but the sentence', () => {
  it('AC-004-12: no svg, table, figure, anchor or operator subtree', () => {
    for (const locale of LOCALES) {
      const step = stepOf(storyPage(locale), 'breakage');
      for (const element of ['<svg', '<table', '<figure', '<a ', 'data-operator']) {
        expect(step, `${locale}: ${element}`).not.toContain(element);
      }
    }
  });
});

describe('AC-004-20: the face states one quantity', () => {
  it('AC-004-20: one placeholder, one numeral, the whole percent of the committed value', () => {
    const value = FUSE_SERIES.value as { consumedPercent: number };
    for (const locale of LOCALES) {
      const local = content(locale);
      const template = local.strings['steps.distance.sentence'];
      expect([...template.matchAll(/\{(\w+)\}/g)].map((match) => match[1]), locale).toEqual(['percent']);
      const rendered = local.t('steps.distance.sentence', {
        percent: formatWholePercent(displayPercent(value.consumedPercent), locale),
      });
      const face = textOf(stepOf(storyPage(locale), 'distance'));
      expect(face, locale).toContain(textOf(rendered));
      const numerals = face.replace(/[^\d]/g, ' ').trim().split(/\s+/);
      expect(numerals, locale).toEqual([String(displayPercent(value.consumedPercent))]);
    }
  });
});

describe('AC-004-21: the technical label and the dataset name leave the step', () => {
  it('AC-004-21: fuse.label and fuse.definition render in #metodo, never in step 4', () => {
    const html = storyPage();
    const step = stepOf(html, 'distance');
    expect(step).not.toContain(content('es').t('fuse.definition'));
    expect(step).not.toContain('demo_pjan');
    const method = metodoPage('es');
    expect(method).toContain(content('es').t('fuse.definition'));
    expect(method).toContain('class="fuse__label"');
  });
});

describe('AC-004-22: the drawing is unchanged and still implies nothing', () => {
  it('AC-004-22: same viewBox, burnPoint geometry, decorative and timeless', () => {
    const value = FUSE_SERIES.value as { consumedPercent: number };
    const step = stepOf(storyPage(), 'distance');
    expect(step).toContain('viewBox="0 0 1000 6"');
    expect(step).toContain('aria-hidden="true"');
    expect(step).toContain('focusable="false"');
    for (const forbidden of ['role="progressbar"', 'aria-valuenow', '<time', '2042']) {
      expect(step, forbidden).not.toContain(forbidden);
    }
    expect(drawnFraction(value.consumedPercent)).toBeCloseTo(value.consumedPercent / 100, 10);
  });

  it('AC-004-22: the geometry does not change across a clock tick', () => {
    const at = Date.parse('2026-10-31T10:00:00Z');
    const first = stepOf(storyPage('es', { nowMs: at }), 'distance');
    const later = stepOf(storyPage('es', { nowMs: at + 3000 }), 'distance');
    expect(first).toBe(later);
  });
});

describe('AC-004-23: no fuse value, no step', () => {
  it('AC-004-23: step 4 vanishes, with no label, svg, reproduce link or body text', () => {
    const html = storyPage('es', { series: [pyramidSeries(), countdownSeries()] });
    expect(html).not.toContain('data-top-step="distance"');
    expect(html).not.toContain('class="fuse"');
    expect(stepOf(html, 'meaning')).not.toBe('');
  });
});

describe('AC-004-24: one sentence and one button', () => {
  it('AC-004-24: step 5 holds one p, one anchor, and only its own label besides', () => {
    for (const locale of LOCALES) {
      const step = stepOf(storyPage(locale), 'meaning');
      expect(step.split('<p').length - 1, locale).toBe(1);
      expect(step.split('<a ').length - 1, locale).toBe(1);
      const textBearing = [...step.matchAll(/<(h1|h2|p|a|span|li|dd|dt)\b/g)].map((match) => match[1]);
      expect(textBearing, locale).toEqual(['h2', 'p', 'a']);
    }
  });
});

describe('AC-004-26: step 5 closes the story', () => {
  it('AC-004-26: meaning is the fifth data-top-step and nothing follows it', () => {
    const ids = [...storyPage().matchAll(/data-top-step="([a-z]+)"/g)].map((match) => match[1]);
    expect(ids).toHaveLength(5);
    expect(ids[4]).toBe('meaning');
  });
});

describe('AC-004-27: the share row follows the steps and works without JavaScript', () => {
  it('AC-004-27: the share row renders after step 5, outside every step, server-side', () => {
    for (const locale of LOCALES) {
      const html = storyPage(locale);
      const strip = html.slice(html.indexOf('class="story__strip"'), html.indexOf('class="pager"'));
      expect(strip, locale).toContain('class="share"');
      expect(strip, locale).not.toContain('data-top-step');
      expect(html.indexOf('class="story__strip"'), locale).toBeGreaterThan(html.indexOf('data-top-step="meaning"'));
      // The links, the canonical URL and the no-script text are in the served HTML.
      expect(strip, locale).toContain('https://');
      expect(strip, locale).toContain(content(locale).t('share.label'));
    }
  });
});

describe('AC-004-29: the target date is named once at the top', () => {
  it('AC-004-29: the formatted anchor date occurs once in the steps, inside step 1', () => {
    for (const locale of LOCALES) {
      const html = storyPage(locale);
      const story = textOf(
        ['number', 'breakage', 'why', 'distance', 'meaning'].map((id) => stepOf(html, id)).join(''),
      );
      const occurrences = story.split(anchorDate(locale)).length - 1;
      expect(occurrences, locale).toBe(1);
      expect(textOf(stepOf(html, 'number')), locale).toContain(anchorDate(locale));
    }
  });
});

describe('AC-004-30: the three paraphrases are gone from the top', () => {
  it('AC-004-30: the clock’s definition, arithmetic and the countdown definition are not in the story', () => {
    for (const locale of LOCALES) {
      const html = storyPage(locale);
      const story = textOf(['number', 'breakage', 'why', 'distance', 'meaning'].map((id) => stepOf(html, id)).join(''));
      const local = content(locale);
      for (const text of [
        local.t('countdown.clock.definition', { date: anchorDate(locale) }),
        local.t('countdown.clock.arithmetic', { years: '16', thresholdYear: '2042', snapshotYear: '2026', date: anchorDate(locale) }),
        local.t('countdown.definition'),
      ]) {
        expect(story, `${locale}: ${text.slice(0, 24)}`).not.toContain(text);
      }
    }
  });
});
