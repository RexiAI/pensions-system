import { describe, expect, it } from 'vitest';
import { LOCALES } from '../../web/content/types';
import { readClock } from '../../web/series/clock';
import { COUNTDOWN_BASE, COUNTDOWN_THRESHOLD } from '../../web/series/countdown';
import { content } from '../fixtures/figures';
import { countdownValue } from '../fixtures/series';
import { anchorDate, clockLabels, metodoPage, numberSentence, stepIds, stepOf, storyPage, textOf } from '../helpers/story';
import { decodeText } from '../helpers/render-document';

/**
 * AC-006-29…31 — one number (Task 11). Step 1 shows `5534 días` and one sentence that says what
 * date it counts to; the years numeral and the three sub-day fields leave the story and their
 * detail lives in Method.
 */
const NOW = Date.parse('2026-10-31T10:00:00Z');
const VALUE = countdownValue();

describe('AC-006-29: step 1 renders exactly one quantity', () => {
  it('AC-006-29: it renders the day numeral, the unit, the label and the sentence — nothing else', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      const step = stepOf(storyPage(locale), 'number');
      const text = textOf(step);
      expect(step, locale).toContain('clock__value--days');
      expect(step, locale).toContain(`class="clock__label">${local.t('countdown.clock.days')}<`);
      expect(step, locale).toContain(local.t('steps.number.label'));
      expect(text, locale).toContain(numberSentence(locale));
      for (const marker of ['countdown__numeral', 'clock__value--sub', 'clock__field--sub', 'countdown__unit']) {
        expect(step, `${locale}: ${marker}`).not.toContain(marker);
      }
      // One field label renders, and it is the unit: `s` and `min` are substrings of ordinary
      // prose, so the assertion is on the field labels rather than on the raw text.
      const labels = clockLabels(step);
      expect(labels, locale).toEqual([local.t('countdown.clock.days')]);
    }
  });

  it('AC-006-29: the numeral is the committed countdown’s day value, and appears once', () => {
    const html = storyPage('es', { nowMs: NOW });
    const expected = readClock(VALUE.anchor as string, NOW).days;
    const numeral = /class="clock__value[^"]*clock__value--days">([^<]*)</.exec(html)?.[1] ?? '';
    expect(numeral.replace(/[^\d]/g, '')).toBe(String(expected));
    expect(html.split('clock__value--days').length - 1).toBe(1);
  });

  it('AC-006-29: inside the number group exactly one text node contains a digit', () => {
    const step = stepOf(storyPage('es', { nowMs: NOW }), 'number');
    const group = /<p class="clock__field--days">([\s\S]*?)<\/p>/.exec(step)?.[1] ?? '';
    expect(group, 'the group renders').not.toBe('');
    const numeral = /class="clock__value[^"]*">([^<]*)</.exec(group)?.[1] ?? '';
    expect(numeral, 'the numeral carries a digit').toMatch(/\d/);
    // Remove the one digit-bearing carrier: nothing else in the group may hold a digit, so
    // "no time-of-day text" is a count rather than a judgement about what looks like a clock.
    const outside = group.replace(/<span class="clock__value[^"]*">[^<]*<\/span>/, '');
    expect(outside).not.toMatch(/\d/);
  });

  it('AC-006-29: the five steps still render in their declared order', () => {
    expect(stepIds(storyPage('es'))).toEqual(['number', 'breakage', 'why', 'distance', 'meaning']);
  });
});

describe('AC-006-30: the sentence still carries the date and binds to the one numeral', () => {
  it('AC-006-30: it names the anchor date once, in step 1', () => {
    for (const locale of LOCALES) {
      const html = storyPage(locale);
      const story = textOf(['number', 'breakage', 'why', 'distance', 'meaning'].map((id) => stepOf(html, id)).join(''));
      expect(story.split(anchorDate(locale)).length - 1, locale).toBe(1);
      expect(textOf(stepOf(html, 'number')), locale).toContain(anchorDate(locale));
    }
  });

  it('AC-006-30: its only quantity reference resolves to the day numeral above it', () => {
    for (const locale of LOCALES) {
      const sentence = textOf(stepOf(storyPage(locale), 'number'));
      // The shipped string, with the threshold's two numerals and the date — never a years or
      // sub-day quantity.
      expect(sentence, locale).toContain(
        content(locale).t('steps.number.sentence', {
          date: anchorDate(locale),
          threshold: String(COUNTDOWN_THRESHOLD),
          base: String(COUNTDOWN_BASE),
        }),
      );
      expect(sentence, `${locale}: a years quantity`).not.toContain(`${VALUE.years} ${content(locale).t('countdown.unit')}`);
      const labels = clockLabels(stepOf(storyPage(locale), 'number'));
      expect(labels, `${locale}: field labels`).toEqual([content(locale).t('countdown.clock.days')]);
    }
  });

  it('AC-006-30: the sentence is the shipped string, unchanged', () => {
    const template = content('es').strings['steps.number.sentence'];
    expect(template).toBe(
      'Faltan estos días para el {date}: ese día la población de 65 y más años llega a {threshold} por cada {base} personas de 15 a 64 años.',
    );
  });
});

describe('AC-006-31: the detail survives in Method', () => {
  it('AC-006-31: the years quantity, its two integers and the arithmetic are visible text outside a disclosure', () => {
    for (const locale of LOCALES) {
      const html = metodoPage(locale);
      const method = html.slice(html.indexOf('id="metodo"'), html.indexOf('class="pager"'));
      const outside = decodeText(method.replace(/<details[\s\S]*?<\/details>/g, ''));
      const arithmetic = content(locale).t('countdown.clock.arithmetic', {
        years: '16',
        thresholdYear: '2042',
        snapshotYear: '2026',
        date: anchorDate(locale),
      });
      expect(outside, locale).toContain(arithmetic);
      expect(outside, locale).toContain(anchorDate(locale));
      // The years quantity carries no sub-annual unit: its clause is the arithmetic's first
      // sentence; "the days are counted to …" is a separate clause.
      const yearsClause = arithmetic.split('.')[0] ?? '';
      expect(yearsClause, `${locale}: 16`).toContain('16');
      for (const unit of ['día', 'dias', 'días', 'mes', 'meses', 'hora', 'horas', 'minuto', 'minutos', 'segundo']) {
        expect(yearsClause.toLowerCase(), `${locale}: ${unit}`).not.toContain(unit);
      }
    }
  });
});
