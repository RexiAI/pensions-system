import { describe, expect, it } from 'vitest';
import { scanTopRegion, topRegionOf } from '../../web/build/public-plain-language';
import { LOCALES } from '../../web/content/types';
import { metodoPage, cifrasPage, debatePage, storyPage } from '../helpers/story';

/**
 * AC-007-25…26 — the plain-language gate scans the Historia story only (spec 007 T11).
 */
describe('AC-007-25: the top region the gate scans is the Historia story', () => {
  it('AC-007-25: the region runs from <main> to the story strip, not the whole document', () => {
    const html = storyPage('es');
    const region = topRegionOf(html);
    expect(region.startsWith('<main')).toBe(true);
    expect(region).toContain('data-top-step="number"');
    expect(region).not.toContain('class="story__strip"');
    expect(region).not.toContain('class="pager"');
  });

  it('AC-007-25: scanTopRegion reports no hit for the shipped Historia page in any locale', () => {
    for (const locale of LOCALES) {
      expect(scanTopRegion(storyPage(locale), locale), locale).toEqual([]);
    }
  });
});

describe('AC-007-26: the precision pages stay out of the top-region scope', () => {
  it('AC-007-26: Método, Cifras and Debate have no top region to scan', () => {
    for (const page of [metodoPage('es'), cifrasPage('es'), debatePage('es')]) {
      expect(topRegionOf(page)).toBe('');
    }
  });

  it('AC-007-26: #metodo is never the top region, and data-operator stays excluded', () => {
    const method = metodoPage('es');
    expect(method).toContain('id="metodo"');
    expect(topRegionOf(method)).not.toContain('id="metodo"');
    // The operator exclusion still applies inside a real Historia story.
    const withOperator = `<main id="main"><section data-top-step="number"><p>texto</p><details data-operator="true">ratio de dependencia</details></section><div class="story__strip"></div></main>`;
    expect(scanTopRegion(withOperator, 'es')).toEqual([]);
  });

  it('AC-007-26: the gate still fails on a banned term in the Historia story', () => {
    const story = `<main id="main"><section data-top-step="number">La ratio de dependencia sube</section><div class="story__strip"></div></main>`;
    const hits = scanTopRegion(story, 'es');
    expect(hits.map((hit) => hit.term)).toContain('ratio de dependencia');
  });
});
