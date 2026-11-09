import { describe, expect, it } from 'vitest';
import { LOCALES } from '../../web/content/types';
import { CLOCK_TIME_ZONE } from '../../web/series/clock';
import { formatDate } from '../../web/content/format';
import { content } from '../fixtures/figures';
import { methodOf, metodoPage } from '../helpers/story';
import { decodeText } from '../helpers/render-document';

/** AC-004-33…36 — the methodological precision relocates into `#metodo` (spec 004 T8, spec 007 T4). */
const DATE = (locale: (typeof LOCALES)[number]): string =>
  formatDate('2042-01-01T00:00:00+01:00', locale, CLOCK_TIME_ZONE);

describe('AC-004-33: every dropped precision string is still on the page', () => {
  it('AC-004-33: the countdown, the fuse and both provenance strips render in #metodo', () => {
    for (const locale of LOCALES) {
      const method = decodeText(methodOf(metodoPage(locale)));
      const local = content(locale);
      for (const text of [
        local.t('countdown.definition'),
        local.t('countdown.yearLabel'),
        local.t('countdown.range', { min: '2039', max: '2043' }),
        local.t('countdown.source'),
        local.t('countdown.clock.definition', { date: DATE(locale) }),
        local.t('countdown.clock.arithmetic', { years: '16', thresholdYear: '2042', snapshotYear: '2026', date: DATE(locale) }),
        local.t('countdown.eyebrow'),
        local.t('fuse.definition'),
      ]) {
        expect(method, `${locale}: ${text.slice(0, 20)}`).toContain(text);
      }
      expect(method).toContain('class="fuse__label"');
      // The back-cast sentence is interpolated per locale (its separators are the locale's own).
      const backcast = /<p class="countdown__backcast">([^<]*)<\/p>/.exec(method)?.[1] ?? '';
      expect(backcast, locale).not.toContain('{');
      expect(backcast.length, locale).toBeGreaterThan(0);
      expect(method.split('class="provenance"').length - 1).toBe(2);
      expect(method.split('data/derived/series').length - 1).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('AC-004-34: the strings are the content model’s, not a rewrite', () => {
  it('AC-004-34: each rendered slot equals its interpolated document value', () => {
    for (const locale of LOCALES) {
      const method = methodOf(metodoPage(locale));
      const local = content(locale);
      const pairs: [string, string][] = [
        ['countdown__source', local.t('countdown.source')],
        ['countdown__definition', local.t('countdown.definition')],
        ['countdown__eyebrow', local.t('countdown.eyebrow')],
        ['fuse__definition', local.t('fuse.definition')],
      ];
      for (const [className, value] of pairs) {
        const pattern = new RegExp(`class="${className}">${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<`);
        expect(method, `${locale}/${className}`).toMatch(pattern);
      }
    }
  });
});

describe('AC-004-35: #metodo keeps the register key', () => {
  it('AC-004-35: the register key renders inside #metodo and its heading names the rows rendered', () => {
    const html = metodoPage();
    const method = methodOf(html);
    expect(method).toContain('class="register-key"');
    const rows = method.split('register-key__row').length - 1;
    const heading = /<h2 class="register__label" id="register-key-heading">([^<]*)<\/h2>/.exec(method)?.[1] ?? '';
    expect(heading).toContain(String(rows));
  });
});

describe('AC-004-36: every in-page reference to #metodo resolves', () => {
  it('AC-004-36: at least one href, one id, and no dangling fragment', () => {
    for (const locale of LOCALES) {
      const html = metodoPage(locale);
      expect(html.split('href="#metodo"').length - 1, locale).toBeGreaterThan(0);
      expect(html.split('id="metodo"').length - 1, locale).toBe(1);
      const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
      const targets = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
      for (const target of targets) expect(ids.has(target), `${locale}: #${target}`).toBe(true);
    }
  });
});
