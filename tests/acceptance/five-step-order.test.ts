import { describe, expect, it } from 'vitest';
import { TOP_STEPS } from '../../web/components/public/top-steps';
import { LOCALES } from '../../web/content/types';
import { stepIds, stepOf, storyOf, storyPage, textOf } from '../helpers/story';

/**
 * AC-004-01…05 — the five-step contract and the top-of-page order (spec 004 T1).
 *
 * The order lives in `TOP_STEPS` and nowhere else: the page maps over it, so the assertion is
 * that the rendered document and the declaration agree, not that a literal list matches a
 * literal list.
 */
describe('AC-004-01: five steps, in order, from one declaration', () => {
  it('AC-004-01: exactly five elements carry data-top-step, in TOP_STEPS order', () => {
    const html = storyPage();
    expect(stepIds(html)).toEqual(TOP_STEPS.map((step) => step.id));
    expect(stepIds(html)).toEqual(['number', 'breakage', 'why', 'distance', 'meaning']);
  });

  it('AC-004-01: each step is the section its own declaration names', () => {
    const html = storyPage();
    for (const step of TOP_STEPS) {
      expect(html, step.id).toContain(`id="${step.sectionId}"`);
      expect(html, step.id).toContain(`aria-labelledby="${step.headingId}"`);
    }
  });
});

describe('AC-004-02: nothing else renders above the fifth step', () => {
  it('AC-004-02: the story region holds no strip, operator subtree, plate, register key or reproduce block', () => {
    const story = storyOf(storyPage());
    expect(story).not.toBe('');
    expect(story).not.toContain('source-strip');
    expect(story).not.toContain('data-operator="true"');
    expect(story).not.toContain('class="plate"');
    expect(story).not.toContain('register-key');
    expect(story).not.toContain('class="reproduce"');
  });
});

describe('AC-004-03: each step is a labelled section with its own heading', () => {
  it('AC-004-03: five sections, five distinct non-empty h2 ids', () => {
    const html = storyPage();
    const headingIds = [...html.matchAll(/<h2 class="step__label" id="([^"]*)">([^<]*)<\/h2>/g)].map((match) => ({
      id: match[1] ?? '',
      text: textOf(match[2] ?? ''),
    }));
    expect(headingIds).toHaveLength(5);
    expect(new Set(headingIds.map((heading) => heading.id)).size).toBe(5);
    for (const heading of headingIds) expect(heading.text.length).toBeGreaterThan(0);
    for (const step of TOP_STEPS) {
      const section = stepOf(html, step.id);
      expect(section, step.id).toContain('aria-labelledby=');
      expect(section, step.id).toContain(`id="${step.headingId}"`);
    }
  });
});

describe('AC-004-05: the page chrome is not a step', () => {
  it('AC-004-05: nothing before the first step but the header and, when stale, one banner', () => {
    for (const stale of [false, true]) {
      for (const locale of LOCALES) {
        const html = storyPage(locale, { stale });
        const before = html.slice(0, html.indexOf('data-top-step="number"'));
        expect(before, `${locale}/${stale}`).not.toContain('data-top-step');
        expect(before, `${locale}`).toContain('class="site-header"');
        expect(before.split('class="banner"').length - 1, `${locale}`).toBe(stale ? 1 : 0);
      }
    }
  });
});
