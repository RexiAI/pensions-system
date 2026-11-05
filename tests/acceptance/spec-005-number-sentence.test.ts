import { describe, expect, it } from 'vitest';
import { internalTermsOf, stripOperatorSubtrees } from '../../web/build/public-vocabulary';
import { scanTopRegion } from '../../web/build/public-plain-language';
import { BreakageStep } from '../../web/components/public/BreakageStep';
import { NumberStep } from '../../web/components/public/NumberStep';
import { TOP_STEPS } from '../../web/components/public/top-steps';
import { formatValue } from '../../web/content/format';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import { readDerivedSeries } from '../../web/derived/series-store';
import { readDerivedFigures } from '../../web/ingest/write-derived';
import { COUNTDOWN_BASE, COUNTDOWN_THRESHOLD } from '../../web/series/countdown';
import { content, renderComponent } from '../fixtures/figures';
import { countdownValue } from '../fixtures/series';
import { anchorDate, stepOf, storyOf, storyPage, textOf } from '../helpers/story';

const NUMBER_STEP = TOP_STEPS[0];
const BREAKAGE_STEP = TOP_STEPS[1];
if (NUMBER_STEP === undefined || BREAKAGE_STEP === undefined) throw new Error('missing steps');

const SHIPPED: Record<Locale, string> = {
  es: 'Faltan estos días para el {date}, el día en que la población mayor alcanza la proporción que explica el paso siguiente.',
  en: 'These days remain until {date}, the day the older population reaches the share the next step explains.',
  fr: "Il reste ces jours jusqu'au {date}, le jour où la population âgée atteint la part que l'étape suivante explique.",
  de: 'Es bleiben diese Tage bis zum {date}, dem Tag, an dem die ältere Bevölkerung den Anteil erreicht, den der nächste Schritt erklärt.',
  it: 'Restano questi giorni fino al {date}, il giorno in cui la popolazione anziana raggiunge la quota che il passo successivo spiega.',
};

const FORWARD_REFERENCE = [
  'paso siguiente',
  'siguiente paso',
  'next step',
  "l'étape suivante",
  'étape suivante',
  'nächste Schritt',
  'nächsten Schritt',
  'passo successivo',
  'prossimo passo',
];

const SECOND_PERSON: Readonly<Record<Locale, readonly string[]>> = {
  es: ['tú', 'tu', 'vosotros', 'vuestro'],
  en: ['you', 'your'],
  fr: ['vous', 'ton', 'ta', 'tes'],
  de: ['du', 'dich', 'dein', 'deine'],
  it: ['tu', 'tuo', 'tua'],
};

const URGENCY = ['bomba', 'explota', 'solo', 'apenas', 'urgente', 'inminente'];

/** Step 1's single sentence element, tag-stripped. */
function sentenceOf(html: string): string {
  const match = /<p class="step__sentence">([\s\S]*?)<\/p>/.exec(stepOf(html, 'number'));
  return textOf(match?.[1] ?? '');
}

function template(locale: Locale): string {
  return content(locale).strings['steps.number.sentence'];
}

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? '').sort();
}

describe('AC-005-06: the first sentence names the proportion beside the date', () => {
  it('AC-005-06: the five numerals and the anchor date sit in one sentence', () => {
    const text = sentenceOf(storyPage('es'));
    for (const numeral of ['50', '100', '65', '15', '64']) expect(text, numeral).toContain(numeral);
    expect(text).toContain(anchorDate('es'));
    expect(stepOf(storyPage('es'), 'number').split('class="step__sentence"').length - 1).toBe(1);
    for (const value of [String(COUNTDOWN_THRESHOLD), String(COUNTDOWN_BASE), anchorDate('es')]) {
      expect(text, value).toContain(value);
    }
  });
});

describe('AC-005-07: the 50 and the 100 are bound to their sources', () => {
  it('AC-005-07: every template carries exactly {date}, {threshold} and {base}', () => {
    for (const locale of LOCALES) {
      expect(placeholders(template(locale)), locale).toEqual(['base', 'date', 'threshold']);
    }
  });

  it('AC-005-07: step 1 and step 2 render the same threshold and base', () => {
    expect(COUNTDOWN_BASE).toBe(100);
    for (const locale of LOCALES) {
      const local = content(locale);
      const number = renderComponent(NumberStep, {
        step: NUMBER_STEP,
        content: local,
        countdown: countdownValue(),
        nowMs: Date.parse('2026-10-31T10:00:00Z'),
      });
      const breakage = renderComponent(BreakageStep, { step: BREAKAGE_STEP, content: local });
      const threshold = formatValue(COUNTDOWN_THRESHOLD, 'integer', locale, '');
      const base = formatValue(COUNTDOWN_BASE, 'integer', locale, '');
      for (const numeral of [threshold, base]) {
        expect(textOf(number), `${locale}: number ${numeral}`).toContain(numeral);
        expect(textOf(breakage), `${locale}: breakage ${numeral}`).toContain(numeral);
      }
    }
  });

  it('AC-005-07: no template types the threshold or the base as a literal digit', () => {
    for (const locale of LOCALES) {
      expect(template(locale), locale).not.toMatch(/(?<![\d.,])50(?![\d.,])/);
      expect(template(locale), locale).not.toMatch(/(?<![\d.,])100(?![\d.,])/);
    }
  });
});

describe('AC-005-08: the forward reference to the next step is gone', () => {
  it('AC-005-08: no locale carries a forward reference, and every template changed', () => {
    for (const locale of LOCALES) {
      const text = template(locale).toLocaleLowerCase();
      for (const phrase of FORWARD_REFERENCE) {
        expect(text, `${locale}: "${phrase}"`).not.toContain(phrase);
      }
      expect(template(locale), locale).not.toBe(SHIPPED[locale]);
    }
  });
});

describe('AC-005-09: the date is still stated once, and in step 1', () => {
  it('AC-005-09: across the five steps the anchor date occurs exactly once, in step 1', () => {
    const steps = ['number', 'breakage', 'why', 'distance', 'meaning'] as const;
    for (const locale of LOCALES) {
      const html = storyPage(locale);
      const date = anchorDate(locale);
      let total = 0;
      for (const id of steps) {
        const count = textOf(stripOperatorSubtrees(stepOf(html, id))).split(date).length - 1;
        total += count;
        if (id !== 'number') expect(count, `${locale} ${id}`).toBe(0);
      }
      expect(total, locale).toBe(1);
    }
  });
});

describe('AC-005-10: the proportion is stated in step 1 and step 2, nowhere else', () => {
  it('AC-005-10: the carrier set is exactly number and breakage', () => {
    const html = storyPage('es');
    const threshold = new RegExp(`(?<![\\d.,])${COUNTDOWN_THRESHOLD}(?![\\d.,])`);
    const base = /(?<![\d.,])100(?![\d.,])/;
    const carriers = ['number', 'breakage', 'why', 'distance', 'meaning'].filter((id) => {
      const text = textOf(stepOf(html, id).replace(/<details[\s\S]*?<\/details>/g, '').replace(/<svg[\s\S]*?<\/svg>/g, ''));
      return threshold.test(text) && base.test(text);
    });
    expect(carriers).toEqual(['number', 'breakage']);
  });
});

describe('AC-005-11: the sentence keeps the factual register and the plain-language gate', () => {
  it('AC-005-11: the plain-language gate finds no hit whose context is step 1’s sentence', () => {
    const terms = internalTermsOf(readDerivedFigures('data/derived'), readDerivedSeries());
    for (const locale of LOCALES) {
      const html = storyPage(locale);
      const sentence = sentenceOf(html);
      const hits = scanTopRegion(storyOf(html), locale, terms);
      expect(hits.filter((hit) => hit.context.includes(sentence)), locale).toEqual([]);
    }
  });

  it('AC-005-11: no second person, no exclamation and no urgency word', () => {
    for (const locale of LOCALES) {
      const text = template(locale);
      const lower = text.toLocaleLowerCase();
      expect(text, locale).not.toContain('!');
      for (const form of SECOND_PERSON[locale]) {
        expect(new RegExp(`\\b${form}\\b`).test(lower), `${locale}: "${form}"`).toBe(false);
      }
      for (const word of URGENCY) expect(lower, `${locale}: "${word}"`).not.toContain(word);
    }
  });

  it('AC-005-11: `faltan`, `quedan` and `cuenta atrás` remain allowed countdown phrasing', () => {
    // The shipped sentence's countdown words are not urgency: the Spanish sentence keeps `faltan`
    // and the criteria above cannot fail a sentence merely for using it.
    expect(content('es').t('steps.number.sentence').toLocaleLowerCase()).toContain('faltan');
  });
});
