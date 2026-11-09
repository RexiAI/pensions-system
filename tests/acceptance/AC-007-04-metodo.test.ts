import { describe, expect, it } from 'vitest';
import { LOCALES } from '../../web/content/types';
import { metodoPage } from '../helpers/story';

/**
 * AC-007-09 — Método owns the precision and the reproduction chain (spec 007 T4).
 */
describe('AC-007-09: Método renders the method region, the source strip, reproduce and the ledger', () => {
  it('AC-007-09: the four regions render in that order', () => {
    const html = metodoPage('es');
    const method = html.indexOf('id="metodo"');
    const sources = html.indexOf('class="source-strip"');
    const reproduce = html.indexOf('id="reproducir"');
    const ledger = html.indexOf('class="assumptions"');
    expect(method).toBeGreaterThan(-1);
    expect(sources).toBeGreaterThan(method);
    expect(reproduce).toBeGreaterThan(sources);
    expect(ledger).toBeGreaterThan(reproduce);
  });

  it('AC-007-09: one h1, no story step, no plate and no register', () => {
    for (const locale of LOCALES) {
      const html = metodoPage(locale);
      expect(html.split('<h1').length - 1, locale).toBe(1);
      expect(html, locale).not.toContain('data-top-step');
      expect(html, locale).not.toContain('class="plate"');
      expect(html, locale).not.toContain('data-register');
    }
  });

  it('AC-007-09: every in-page href resolves to an id present on this page', () => {
    for (const locale of LOCALES) {
      const html = metodoPage(locale);
      expect(html.split('id="metodo"').length - 1, locale).toBe(1);
      const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
      for (const target of [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1])) {
        expect(ids.has(target), `${locale}: #${target}`).toBe(true);
      }
    }
  });
});
