import { describe, expect, it } from 'vitest';
import { TOP_STEPS } from '../../web/components/public/top-steps';
import { LOCALES } from '../../web/content/types';
import { content } from '../fixtures/figures';
import { storyPage, storyOf, textOf } from '../helpers/story';
import { publicPathFor, pagePathFor } from '../../web/seo/routes';

/**
 * AC-007-05…07 — Historia is the story and the strip, nothing else (spec 007 T2).
 */
describe('AC-007-05: Historia renders the five-step story and the story strip, nothing else', () => {
  it('AC-007-05: five data-top-step sections in TOP_STEPS order, then the story strip', () => {
    const html = storyPage();
    const ids = [...html.matchAll(/data-top-step="([a-z]+)"/g)].map((match) => match[1]);
    expect(ids).toEqual(TOP_STEPS.map((step) => step.id));
    expect(html).toContain('class="story__strip"');
    expect(html.indexOf('class="story__strip"')).toBeGreaterThan(html.indexOf('data-top-step="meaning"'));
  });

  it('AC-007-05: it carries no plate, no #metodo, no register, no reproduce block and no ledger', () => {
    for (const locale of LOCALES) {
      const html = storyPage(locale);
      expect(html, locale).not.toContain('class="plate"');
      expect(html, locale).not.toContain('id="metodo"');
      expect(html, locale).not.toContain('data-register');
      expect(html, locale).not.toContain('class="reproduce"');
      expect(html, locale).not.toContain('class="assumptions"');
      expect(html, locale).not.toContain('id="figuras"');
    }
  });
});

describe('AC-007-06: exactly one h1, with the kicker above it', () => {
  it('AC-007-06: one h1 carrying the hero statement, with the kicker above it inside step 1', () => {
    for (const locale of LOCALES) {
      const html = storyPage(locale);
      expect(html.split('<h1').length - 1, locale).toBe(1);
      const step = html.slice(html.indexOf('data-top-step="number"'), html.indexOf('data-top-step="breakage"'));
      const kicker = step.indexOf('class="hero__kicker"');
      const heading = step.indexOf('<h1');
      expect(kicker, locale).toBeGreaterThan(-1);
      expect(heading, locale).toBeGreaterThan(kicker);
      expect(textOf(step.slice(step.indexOf('<h1'), step.indexOf('</h1>'))), locale).toBe(
        content(locale).t('hero.statement'),
      );
    }
  });

  it('AC-007-06: the kicker is a p, not the h1 and not an h2', () => {
    const step = storyPage('es');
    expect(step).toContain('<p class="hero__kicker">');
    const kicker = /<p class="hero__kicker">([^<]*)<\/p>/.exec(step)?.[1] ?? '';
    expect(kicker).toBe(content('es').t('kicker.mechanism'));
    expect(kicker).not.toContain('<h1');
    expect(kicker).not.toContain('<h2');
  });
});

describe('AC-007-07: the story strip links to Método, and the share row still renders', () => {
  it('AC-007-07: the method link is the Método page route, never #metodo', () => {
    for (const locale of LOCALES) {
      const html = storyPage(locale);
      const strip = html.slice(html.indexOf('class="story__strip"'), html.indexOf('class="pager"'));
      expect(strip, locale).toContain(`href="${pagePathFor(locale, 'metodo')}"`);
      expect(strip, locale).not.toContain('href="#metodo"');
    }
  });

  it('AC-007-07: the share row renders with its network controls when a countdown has an anchor', () => {
    const html = storyPage('es');
    const strip = html.slice(html.indexOf('class="story__strip"'), html.indexOf('class="pager"'));
    expect(strip).toContain('class="share"');
    expect(strip.split('class="share__control"').length - 1).toBeGreaterThanOrEqual(4);
    expect(publicPathFor('es')).toBe('/');
    expect(storyOf(html)).not.toContain('class="share"');
  });
});
