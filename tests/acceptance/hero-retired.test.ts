import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LOCALES } from '../../web/content/types';
import { content } from '../fixtures/figures';
import { figuresOf, stepOf, storyPage, textOf } from '../helpers/story';

/** AC-004-50…54 — the hero/band composition is retired (spec 004 T12). */
const CSS = readFileSync('web/styles/globals.css', 'utf8');

describe('AC-004-50: the band is gone', () => {
  it('AC-004-50: no element carries the class, and the stylesheet keeps no rule for it', () => {
    for (const locale of LOCALES) {
      const html = storyPage(locale);
      expect(html, locale).not.toContain('class="band"');
      expect(html, locale).not.toContain('hero--band');
    }
    expect(CSS).not.toContain('hero--band');
    expect(CSS).not.toContain('.band');
    expect(CSS).not.toContain('grid-column: 2');
  });
});

describe('AC-004-51: one lead path', () => {
  it('AC-004-51: neither retired module exists, and no second lead component does', () => {
    expect(existsSync('web/components/series/CountdownBand.tsx')).toBe(false);
    expect(existsSync('web/components/public/HeroLeadBlock.tsx')).toBe(false);
    expect(existsSync('web/components/public/Hero.tsx')).toBe(false);
    const story = readFileSync('web/components/public/PublicStory.tsx', 'utf8');
    expect(story).toContain('TOP_STEPS');
    expect(readFileSync('web/components/PublicPage.tsx', 'utf8')).not.toContain('CountdownBand');
  });
});

describe('AC-004-52: the figure plates live in #figuras', () => {
  it('AC-004-52: every computed plate is inside #figuras and none is above step 5', () => {
    for (const locale of LOCALES) {
      const html = storyPage(locale);
      expect(figuresOf(html).split('class="plate"').length - 1, locale).toBe(2);
      for (const id of ['number', 'breakage', 'why', 'distance', 'meaning']) {
        expect(stepOf(html, id), `${locale}/${id}`).not.toContain('class="plate"');
      }
    }
  });
});

describe('AC-004-53: the lead’s provenance facts move to the figures', () => {
  it('AC-004-53: the four labels are absent from the steps and present beside the plates', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      const html = storyPage(locale);
      const story = ['number', 'breakage', 'why', 'distance', 'meaning'].map((id) => textOf(stepOf(html, id))).join(' ');
      for (const key of ['hero.definitionLabel', 'hero.periodLabel', 'provenance.source', 'provenance.dataset'] as const) {
        // The *fact label* is what moved, not the word: the pyramid's table caption legitimately
        // says `Fuente: Eurostat`, so the assertion is on the definition-list term.
        expect(story, `${locale}/${key}`).not.toContain(`<dt>${local.t(key)}</dt>`);
        expect(figuresOf(html), `${locale}/${key}`).toContain(`<dt>${local.t(key)}</dt>`);
      }
    }
  });
});

describe('AC-004-54: no dead hero surface', () => {
  it('AC-004-54: the hero modules are gone and the page renders with zero figures and zero series', () => {
    for (const file of [
      'web/components/public/HeroLead.tsx',
      'web/components/public/hero-subject.ts',
    ]) {
      expect(existsSync(file), file).toBe(false);
    }
    const html = storyPage('es', { figures: [], series: [] });
    expect(html).toContain('data-top-step="number"');
    expect(html).toContain('id="metodo"');
    expect(html).toContain('data-register="thesis"');
  });
});
