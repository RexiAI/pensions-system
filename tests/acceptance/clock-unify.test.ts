import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CountdownBlock } from '../../web/components/series/CountdownBlock';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import type { CountdownValue } from '../../web/series/countdown';
import { content, renderComponent } from '../fixtures/figures';
import { countdownAt, countdownValue } from '../fixtures/series';
import { decodeText } from '../helpers/render-document';
import { readSource, stripComments } from '../helpers/source-scan';

/**
 * T3 (spec 002): the recorded reversal of the 1px-rule rationale. The years numeral and the
 * day/hour/minute/second row become one centred group inside `.clock`; the separator between the
 * projection block and the rail is gone, and the risk it mitigated is written down as accepted
 * rather than quietly deleted.
 *
 * The tests that encoded the old layout are rewritten in T4, under
 * `docs/TESTING.md §Tests That Encode a Defect`; this file asserts the new structure itself.
 */
const CSS = readFileSync('web/styles/globals.css', 'utf8');
const CODE = stripComments(CSS);
const ANCHOR = '2042-01-01T00:00:00+01:00';
const THREE_DAYS_OUT = Date.parse('2041-12-28T20:57:55Z');

/** The `.clock` rule as written, from its selector to the next rule's selector. */
function clockRule(): string {
  return CODE.slice(CODE.indexOf('.clock {'), CODE.indexOf('.clock__fields'));
}

/** Every rule the clock section declares, from the rail's first rule to the end of its block. */
function clockSection(): string {
  return CODE.slice(CODE.indexOf('.clock {'), CODE.indexOf('.reproduce__note'));
}

/** The countdown section's own rule. */
function countdownRule(): string {
  return CODE.slice(CODE.indexOf('.countdown {'), CODE.indexOf('.countdown__eyebrow'));
}

function renderBlock(locale: Locale = 'es', value: CountdownValue = countdownValue()): string {
  return renderComponent(CountdownBlock, { content: content(locale), countdown: value, nowMs: THREE_DAYS_OUT });
}

function anchorDate(locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Madrid',
  }).format(new Date(ANCHOR));
}

describe('AC-002-09: the 1px separator between the projection block and the rail is gone', () => {
  it('AC-002-09: the `.clock` rule declares no `border-top`', () => {
    expect(clockRule()).not.toContain('border-top');
    expect(clockRule()).not.toContain('var(--border-hair)');
  });

  it('AC-002-09: the hairline does not reappear on any other clock rule', () => {
    // A hairline moved onto a sibling selector would be the separator reintroduced under a
    // different name, so the whole section is checked, not just the rail's first rule.
    expect(clockSection()).not.toContain('border-top: var(--border-hair)');
    expect(clockSection()).not.toContain('border-block-start');
  });
});

describe('AC-002-10: the years numeral and the day count are one centred group', () => {
  it('AC-002-10: both numerals render inside the `.clock` container, the years first', () => {
    const html = renderBlock();
    const clockAt = html.indexOf('<div class="clock"');
    const numeralAt = html.indexOf('countdown__numeral');
    const unitAt = html.indexOf('countdown__unit');
    const fieldsAt = html.indexOf('clock__fields');
    const daysAt = html.indexOf('clock__value--days');

    expect(clockAt).toBeGreaterThan(-1);
    // The years numeral is the container's first child, so DOM order equals reading order.
    expect(numeralAt).toBeGreaterThan(clockAt);
    expect(numeralAt).toBeLessThan(fieldsAt);
    // Its unit label is beside it, in the same group as before the merge.
    expect(unitAt).toBeGreaterThan(numeralAt);
    expect(unitAt).toBeLessThan(fieldsAt);
    // The day count and its label are in the same container.
    expect(daysAt).toBeGreaterThan(fieldsAt);
    const fields = html.slice(fieldsAt, html.indexOf('clock__anchor'));
    expect(fields).toContain('clock__field clock__field--days');
    expect(fields.split('clock__label').length - 1).toBe(4);
  });

  it('AC-002-10: no rule and no block boundary sits between the two numerals', () => {
    const html = renderBlock();
    const numeralStart = html.indexOf('class="countdown__value"');
    const numeralEnd = html.indexOf('</p>', numeralStart);
    const fieldsAt = html.indexOf('clock__fields');
    expect(numeralStart).toBeGreaterThan(-1);
    expect(numeralEnd).toBeLessThan(fieldsAt);

    // The gap between the years group's closing tag and the fields container's own opening tag
    // holds no node at all: no `<hr>`, no projection rule, no text.
    const fieldsTagAt = html.lastIndexOf('<div', fieldsAt);
    const between = html.slice(numeralEnd + '</p>'.length, fieldsTagAt);
    expect(between).not.toContain('<hr');
    expect(between).not.toContain('countdown__rule');
    expect(between.trim()).toBe('');
  });

  it('AC-002-10: the hour, minute and second fields stay in the same group', () => {
    const html = renderBlock();
    const fields = html.slice(html.indexOf('clock__fields'), html.indexOf('clock__anchor'));
    expect(fields.split('clock__field--sub').length - 1).toBe(3);
    expect(fields.split('clock__value--sub').length - 1).toBe(3);
    expect(fields).toContain('clock__field clock__field--days');
  });
});

describe('AC-002-11: the merged group is centred, with no left alignment reintroduced', () => {
  it('AC-002-11: the merged group inherits the section’s centred axis', () => {
    expect(countdownRule()).toContain('text-align: center');
    expect(countdownRule()).toContain('justify-items: center');
    // `.clock` declares its own centring, so the group does not depend on how it is mounted.
    expect(clockRule()).toContain('text-align: center');
  });

  it('AC-002-11: no left-aligning declaration is introduced for the merged group', () => {
    const LEFT = /(?:^|;)\s*(?:text-align|justify-content|justify-items|justify-self|float):\s*(?:left|start|flex-start|self-start)/;
    for (const rule of [clockRule(), countdownRule()]) {
      expect(rule).not.toMatch(LEFT);
      expect(rule).not.toMatch(/(?:^|;)\s*margin-(?:left|inline-start):\s*0/);
    }
  });
});

describe('AC-002-12: the component prose records the accepted risk', () => {
  const source = readSource('web/components/series/CountdownBlock.tsx');

  it('AC-002-12: the doc comment no longer asserts that a rule keeps the two apart', () => {
    expect(source).not.toMatch(/keeps? the years numeral and the day count out of one/);
    expect(source).not.toMatch(/is not decoration/);
    expect(source).not.toMatch(/two quantities, deliberately never merged/i);
  });

  it('AC-002-12: it states the separator is gone and the two numerals form one centred group', () => {
    expect(source).toMatch(/separator/i);
    expect(source).toMatch(/removed/i);
    expect(source).toMatch(/one (centred|typographic) group|single centred group/);
  });

  it('AC-002-12: it states the division risk is accepted', () => {
    expect(source).toMatch(/accept/i);
    expect(source).toMatch(/divid/i);
  });
});

describe('AC-002-13: “no anchor, no clock” still holds', () => {
  it('AC-002-13: the not-crossed state renders no years numeral and no clock', () => {
    const html = renderBlock('es', countdownAt(99));
    expect(html).not.toContain('class="clock"');
    expect(html).not.toContain('countdown__numeral');
    expect(html).not.toContain('countdown__value');
  });

  it('AC-002-13: the computed state renders both, as one group', () => {
    const html = renderBlock();
    expect(html).toContain('class="clock"');
    expect(html).toContain('countdown__numeral');
    // One container, not two: the numeral is inside the clock's subtree.
    expect(html.indexOf('countdown__numeral')).toBeGreaterThan(html.indexOf('<div class="clock"'));
  });
});

describe('AC-002-14: the integrity invariants are preserved', () => {
  it('AC-002-14: the anchor date stays visible text, in every locale', () => {
    for (const locale of LOCALES) {
      const html = renderBlock(locale);
      expect(html, locale).toContain('clock__anchor-date');
      expect(html, locale).toContain(anchorDate(locale));
      expect(html, locale).not.toContain('<time');
    }
  });

  it('AC-002-14: the clock never states the threshold has been crossed', () => {
    for (const locale of LOCALES) {
      const html = decodeText(renderBlock(locale)).toLowerCase();
      for (const word of ['crossed', 'reached', 'validated']) {
        expect(html, `${locale}: ${word}`).not.toContain(word);
      }
      // The factual definition sentence is the one that ships.
      const definition = content(locale).t('countdown.clock.definition', { date: anchorDate(locale) });
      expect(html, locale).toContain(definition.toLowerCase());
    }
  });

  it('AC-002-14: the clock is server-rendered complete and owns no React state', () => {
    // `renderToStaticMarkup` runs no effect, so these four values are exactly what ships.
    const html = renderBlock();
    expect(html).toContain('>3<');
    expect(html).toContain('>02<');
    expect(html).toContain('>05<');
    const source = readSource('web/components/series/CountdownClock.tsx');
    expect(source).not.toContain('useState');
    // One timer, in the ticker module: the leaf subscribes rather than scheduling.
    expect(source).not.toContain('setInterval');
    expect(source.split('startClockTicker(').length - 1).toBe(1);
  });

  it('AC-002-14: the years quantity keeps its unit and carries no sub-annual unit', () => {
    const html = renderBlock();
    const start = html.indexOf('class="countdown__value"');
    const years = html.slice(start, html.indexOf('</p>', start));
    expect(years).toContain('countdown__numeral');
    expect(years).toContain('countdown__unit');
    expect(years).toContain(content('es').t('countdown.unit'));
    for (const unit of ['día', 'dias', 'días', 'mes', 'meses', 'hora', 'horas', 'minuto', 'minutos', 'segundo']) {
      expect(years.toLowerCase(), unit).not.toContain(unit);
    }
  });

  it('AC-002-14: the day and sub-day fields keep their labels, in every locale', () => {
    for (const locale of LOCALES) {
      const page = content(locale);
      const html = renderBlock(locale);
      const fields = html.slice(html.indexOf('clock__fields'), html.indexOf('clock__anchor'));
      for (const key of ['days', 'hours', 'minutes', 'seconds'] as const) {
        expect(fields, `${locale}: ${key}`).toContain(page.t(`countdown.clock.${key}`));
      }
    }
  });
});
