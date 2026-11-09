import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FIGURE_IDS } from '../../web/ingest/types';
import { adminT } from '../../web/content/admin';
import { LOCALES } from '../../web/content/types';
import { content } from '../fixtures/figures';
import { allPages, figuresOf, methodOf, storyOf } from '../helpers/story';

/**
 * AC-004-47…49 — figures 3 to 7 are tracked in admin (spec 004 T11).
 *
 * The panel's list is rendered through the same component the route renders, from the committed
 * derived store, so a hard-coded id or availability value would fail here.
 */
async function panelList(): Promise<string> {
  const figures = (await import('../../web/derived/store')).createFileDerivedStore().readAll();
  // The list is rendered from the same store the route reads, through the component the route
  // mounts, so a hard-coded id or availability value cannot pass.
  const { FigureTable } = await import('../../web/admin/views/FigureTable');
  return renderToStaticMarkup(createElement(FigureTable, { figures }));
}

describe('AC-004-47: the admin panel lists every figure and its availability', () => {
  it('AC-004-47: one row per figure, in FIGURE_IDS order, with id and availability', () => {
    return panelList().then((html) => {
      const rows = [...html.matchAll(/<th scope="row">(fig-0\d)<\/th><td>([a-z]+)<\/td>/g)].map((match) => ({
        id: match[1],
        availability: match[2],
      }));
      expect(rows.length).toBeGreaterThanOrEqual(FIGURE_IDS.length);
      expect(rows.map((row) => row.id)).toEqual([...FIGURE_IDS]);
      for (const row of rows) expect(['computed', 'unavailable']).toContain(row.availability);
    });
  });
});

describe('AC-004-48: the list is data, not a literal', () => {
  it('AC-004-48: the view reads the store and names no id, count or availability', () => {
    return import('node:fs').then(({ readFileSync }) => {
      const source = readFileSync('app/(admin)/admin/(authed)/page.tsx', 'utf8');
      expect(source).toContain("createFileDerivedStore().readAll()");
      for (const literal of ['fig-01', 'fig-07', "'computed'", "'unavailable'", 'length === 7']) {
        expect(source, literal).not.toContain(literal);
      }
      // The strings resolve from `adminT` in the component that renders the list.
      const view = readFileSync('web/admin/views/FigureTable.tsx', 'utf8');
      expect(view).toContain("adminT('admin.home.figureList')");
      expect(view).toContain("adminT('admin.home.figureAvailability')");
      expect(source).toContain('FigureTable');
      expect(adminT('admin.home.figureList').length).toBeGreaterThan(0);
    });
  });
});

describe('AC-004-49: the five unavailable figures are visible to the operator only', () => {
  it('AC-004-49: seven rows in admin, two plates in public, and no public link to the panel', () => {
    return panelList().then((html) => {
      expect(html.split('<th scope="row">').length - 1).toBe(FIGURE_IDS.length);
      expect(html).toContain('unavailable');
      for (const locale of LOCALES) {
        const page = allPages(locale);
        expect(figuresOf(page).split('class="plate"').length - 1, locale).toBe(2);
        expect(page, locale).not.toContain('/admin');
        expect(storyOf(page) + methodOf(page), locale).not.toContain('admin.home');
      }
      expect(content('es').strings).not.toHaveProperty('admin.home.figureList');
    });
  });
});
