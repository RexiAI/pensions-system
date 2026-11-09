import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { PUBLIC_ROUTE_PATHS } from '../../web/seo/routes';
import { LOCALES, PAGE_KINDS } from '../../web/content/types';
import { isPublicRoute } from '../../web/seo/routes';
import { listSourceFiles, readSource } from '../helpers/source-scan';
import { publicPageProps } from '../../web/components/public-page-props';
import { BUILD_PRESENT, startServedApp } from '../helpers/served-app';
import type { ServedApp } from '../helpers/served-app';
import * as localeLayout from '../../app/(public)/[locale]/layout';
import * as cifrasRoute from '../../app/(public)/[locale]/cifras/page';
import * as metodoRoute from '../../app/(public)/[locale]/metodo/page';
import * as debateRoute from '../../app/(public)/[locale]/debate/page';

const EXPECTED = [
  '/', '/en', '/fr', '/de', '/it',
  '/cifras', '/en/cifras', '/fr/cifras', '/de/cifras', '/it/cifras',
  '/metodo', '/en/metodo', '/fr/metodo', '/de/metodo', '/it/metodo',
  '/debate', '/en/debate', '/fr/debate', '/de/debate', '/it/debate',
];

/**
 * AC-007-01…04 — the four-page route model (spec 007 T1).
 */
describe('AC-007-01: twenty static public routes, Spanish slugs, closed locale tuple', () => {
  it('AC-007-01: lists exactly the four pages × five locales, no admin path', () => {
    expect([...PUBLIC_ROUTE_PATHS].sort()).toEqual([...EXPECTED].sort());
    expect(PUBLIC_ROUTE_PATHS).toHaveLength(20);
    for (const path of PUBLIC_ROUTE_PATHS) expect(path.startsWith('/admin'), path).toBe(false);
    for (const path of PUBLIC_ROUTE_PATHS) expect(isPublicRoute(path), path).toBe(true);
  });

  it('AC-007-01: is declared by hand, never from filesystem discovery', () => {
    const source = readFileSync('web/seo/routes.ts', 'utf8');
    expect(source).toContain('PUBLIC_ROUTE_PATHS');
    expect(source).not.toMatch(/readdir|readdirSync|glob\(/);
    // Every sub-page slug is the Spanish name in every locale.
    for (const locale of LOCALES) {
      for (const kind of ['cifras', 'metodo', 'debate'] as const) {
        const slug = kind;
        const path = locale === 'es' ? `/${slug}` : `/${locale}/${slug}`;
        expect(PUBLIC_ROUTE_PATHS).toContain(path);
      }
    }
  });
});

describe('AC-007-02: every public route is force-static and prerendered', () => {
  it('AC-007-02: every public page module declares force-static and none is force-dynamic', () => {
    const pages = listSourceFiles('app/(public)').filter((file) => file.endsWith('/page.tsx'));
    expect(pages.length).toBeGreaterThanOrEqual(8);
    for (const file of pages) {
      const source = readSource(file);
      expect(source, `${file} must be force-static`).toContain("export const dynamic = 'force-static'");
      expect(source, `${file} must not render on demand`).not.toContain('force-dynamic');
      expect(source, file).not.toContain('cookies');
    }
  });

  it('AC-007-02: the locale branch declares its closed set and one-hour revalidation', () => {
    expect(localeLayout.dynamicParams).toBe(false);
    expect(localeLayout.revalidate).toBe(3600);
    for (const route of [cifrasRoute, metodoRoute, debateRoute]) {
      expect(route.dynamic).toBe('force-static');
    }
  });
});

describe('AC-007-03: an unknown locale on a page path is a 404, never an on-demand render', () => {
  it('AC-007-03: dynamicParams stays false and an unknown locale has no props', () => {
    expect(localeLayout.dynamicParams).toBe(false);
    const unknown = routeLocales(cifrasRoute);
    expect(unknown).not.toContain('xx');
    expect(publicPageProps('xx')).toBeNull();
    // The layout rejects it before rendering.
    expect(LOCALES).not.toContain('xx');
  });
});

describe('AC-007-04: the locale branch enumerates the three sub-pages for every non-default locale', () => {
  it('AC-007-04: each sub-page route yields en, fr, de, it and the default locale has static segments', () => {
    for (const route of [cifrasRoute, metodoRoute, debateRoute]) {
      expect(routeLocales(route).sort()).toEqual(['de', 'en', 'fr', 'it']);
    }
    for (const file of [
      'app/(public)/(home)/cifras/page.tsx',
      'app/(public)/(home)/metodo/page.tsx',
      'app/(public)/(home)/debate/page.tsx',
    ]) {
      expect(readSource(file), file).toContain("export const dynamic = 'force-static'");
    }
    expect(PAGE_KINDS).toEqual(['historia', 'cifras', 'metodo', 'debate']);
  });
});

function routeLocales(route: { generateStaticParams(): Array<{ locale: string }> }): string[] {
  return route.generateStaticParams().map((entry) => entry.locale);
}

describe.skipIf(!BUILD_PRESENT)('AC-007-02: the build prerendered every public route', () => {
  it('AC-007-02: all twenty static HTML documents exist', () => {
    for (const path of PUBLIC_ROUTE_PATHS) {
      const file = `.next/server/app/${path === '/' ? 'index' : path.replace(/^\//, '')}.html`;
      expect(existsSync(file), file).toBe(true);
    }
  });
});

describe.skipIf(!BUILD_PRESENT)('AC-007-03: an unknown locale under a page path is a 404', () => {
  let app: ServedApp;
  beforeAll(async () => {
    app = await startServedApp();
  });
  afterAll(async () => {
    await app?.close();
  });

  it('AC-007-03: /xx, /xx/cifras, /xx/metodo and /xx/debate answer 404', async () => {
    for (const path of ['/xx', '/xx/cifras', '/xx/metodo', '/xx/debate']) {
      const response = await fetch(`${app.baseUrl}${path}`, { redirect: 'manual' });
      expect(response.status, path).toBe(404);
    }
  });
});
