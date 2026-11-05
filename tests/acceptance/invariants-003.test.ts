import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as homePage from '../../app/(public)/(home)/page';
import * as localePage from '../../app/(public)/[locale]/page';
import * as localeLayout from '../../app/(public)/[locale]/layout';
import { evaluateAdminRequest } from '../../web/admin/routes';
import { PublicPage } from '../../web/components/PublicPage';
import { citationRegistry } from '../../web/content/citations';
import { LOCALES } from '../../web/content/types';
import { metadataFor } from '../../web/seo/metadata';
import { content, dependencyFigure, renderComponent, shareFigure } from '../fixtures/figures';
import { seriesFixtures } from '../fixtures/series';
import { BUILD_PRESENT } from '../helpers/served-app';

const CSS = readFileSync('web/styles/globals.css', 'utf8');
const NEW_SECTION = CSS.slice(CSS.indexOf('/* ---------- Spec 003'));

function page(locale = 'es'): string {
  return renderComponent(PublicPage, {
    content: content(locale),
    figures: [dependencyFigure(), shareFigure()],
    citations: citationRegistry,
    freshnessWindowDays: 45,
    stale: false,
    series: seriesFixtures(),
  });
}

describe('AC-003-44: public routes stay static with correct language', () => {
  it('AC-003-44: both public route modules are force-static over a closed locale set', () => {
    expect(homePage.dynamic).toBe('force-static');
    expect(localePage.dynamic).toBe('force-static');
    expect(localeLayout.dynamicParams).toBe(false);
    expect(localePage.generateStaticParams().map((entry) => entry.locale).sort()).toEqual(
      LOCALES.filter((locale) => locale !== 'es').sort(),
    );
  });

  it('AC-003-44: every route carries hreflang for the five locales plus x-default', () => {
    for (const locale of LOCALES) {
      const languages = Object.keys((metadataFor(locale).alternates?.languages ?? {}) as Record<string, string>);
      expect(languages.sort(), locale).toEqual([...LOCALES, 'x-default'].sort());
    }
  });

  it.skipIf(!BUILD_PRESENT)('AC-003-44: the build prerendered the five routes as HTML with their own lang', () => {
    for (const locale of LOCALES) {
      const file = `.next/server/app/${locale === 'es' ? 'index' : locale}.html`;
      expect(existsSync(file), file).toBe(true);
      expect(readFileSync(file, 'utf8'), file).toContain(`<html lang="${locale}"`);
    }
  });
});

describe('AC-003-45: admin stays fail-closed', () => {
  it('AC-003-45: an unconfigured admin route answers 503 and the public page still renders', () => {
    const plan = evaluateAdminRequest({ method: 'GET', pathname: '/admin', env: {}, now: new Date() });
    expect(plan.status).toBe(503);
    expect(page()).toContain('class="story"');
  });
});

describe('AC-003-46: the thesis register stays uncoloured and separate', () => {
  it('AC-003-46: no new element references thesis content, and the new rules carry no thesis hue', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      const html = page(locale);
      // Spec 004: the story replaces the band and the pending block, and the appendix replaces
      // the hero section. The two new regions are what the thesis must stay out of.
      const story = html.slice(html.indexOf('class="story"'), html.indexOf('id="figuras"'));
      const appendix = html.slice(html.indexOf('id="figuras"'), html.indexOf('id="debate"'));
      for (const region of [story, appendix]) {
        expect(region, locale).not.toContain(local.editorial.thesis.statement);
        for (const paragraph of local.editorial.thesis.paragraphs) expect(region, locale).not.toContain(paragraph);
        expect(region, locale).not.toContain('thesis');
      }
      // The thesis register is still its own section, after the debate and outside the story.
      expect(html.indexOf('data-register="thesis"'), locale).toBeGreaterThan(html.indexOf('id="debate"'));
    }
    expect(NEW_SECTION).not.toMatch(/thesis|--data-deficit|--data-projection/);
    const thesisRule = CSS.slice(CSS.indexOf('.register--thesis {'), CSS.indexOf('}', CSS.indexOf('.register--thesis {')));
    expect(thesisRule).not.toMatch(/--accent|--data-/);
  });
});
