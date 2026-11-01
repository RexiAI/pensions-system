import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import { canonicalUrl } from '../../web/content/site';
import { publicPathFor } from '../../web/seo/routes';
import { CHROME_PATH, launchBrowser, type Browser } from '../helpers/chromium';
import { BUILD_PRESENT, routePath, startServedApp, type ServedApp } from '../helpers/served-app';

/**
 * Spec 003's layout and network criteria, measured in a real Chromium against the built app
 * (`npm run build`), the way the spec states them: computed font sizes, bounding boxes against
 * the viewport, the request log and the cookie jar. The file skips where there is no build or no
 * Chromium binary; the measured numbers are also recorded, with their date, in
 * `countdown-band.test.ts`, which never skips.
 */
const READY = BUILD_PRESENT && CHROME_PATH !== undefined;

interface Box {
  top: number;
  bottom: number;
  width: number;
}

interface Measurement {
  daysPx: number;
  h1Px: number;
  secondsPx: number;
  yearsPx: number;
  heroValueClass: string;
  textDisplay: string;
  maxNumeralPx: number;
  clock: { top: number; bottom: number };
  fuse: Box | null;
  fuseGroup: Box | null;
  h1: Box | null;
  share: Box | null;
  band: Box;
  contentWidth: number;
  siblingsInBandRow: number;
  overflowX: boolean;
  betweenFuseAndShare: string[];
  fuseProvenance: { scope: string; summary: string; hash: string; open: boolean; expanded: string };
  disclosures: { anchor: boolean; definition: boolean; arithmetic: boolean; inDetails: boolean };
}

const MEASURE = `(() => {
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { top: b.top, bottom: b.bottom, width: b.width }; };
  const fs = (el) => parseFloat(getComputedStyle(el).fontSize);
  const visible = (el) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const days = document.querySelector('.band .clock__value--days');
  const secs = document.querySelectorAll('.band .clock__value--sub')[2];
  const band = document.querySelector('.band');
  const page = document.querySelector('.page');
  const pcs = getComputedStyle(page);
  let maxNumeralPx = 0;
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('');
    if (/\\d/.test(own)) maxNumeralPx = Math.max(maxNumeralPx, fs(el));
  }
  const bandBox = band.getBoundingClientRect();
  const siblingsInBandRow = [...band.parentElement.children].filter((el) => {
    if (el === band) return false;
    const b = el.getBoundingClientRect();
    return b.height > 0 && b.top < bandBox.bottom && b.bottom > bandBox.top;
  }).length;
  const shown = (sel) => visible(document.querySelector(sel));
  const fuse = document.querySelector('.fuse');
  const fuseGroup = document.querySelector('.fuse-group');
  const share = document.querySelector('.share');
  const fuseBox = box(fuse);
  const fuseGroupBox = box(fuseGroup);
  const shareBox = box(share);
  // Everything that renders text and sits strictly between the fuse block's bottom edge and the
  // share row's top edge: AC-003-48 allows the band's own spacing there and nothing else.
  const betweenFuseAndShare = fuseGroupBox && shareBox ? [...band.querySelectorAll('*')].filter((el) => {
    if (el.closest('details') || el.closest('svg') || el.closest('.fuse-group') || el.closest('.share')) return false;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('');
    if (!own) return false;
    const b = el.getBoundingClientRect();
    return b.height > 0 && b.top >= fuseGroupBox.bottom - 0.5 && b.bottom <= shareBox.top + 0.5;
  }).map((el) => el.className || el.tagName) : [];
  const details = document.querySelector('.fuse-group details');
  const scope = details ? details.getAttribute('open') === null ? 'closed' : 'open' : 'absent';
  return {
    daysPx: fs(days), h1Px: fs(document.querySelector('h1')), secondsPx: fs(secs),
    yearsPx: fs(document.querySelector('.band .countdown__numeral')),
    heroValueClass: document.querySelector('.hero__value')?.className ?? '',
    textDisplay: getComputedStyle(document.documentElement).getPropertyValue('--text-display').trim(),
    maxNumeralPx,
    clock: { top: days.getBoundingClientRect().top, bottom: secs.parentElement.getBoundingClientRect().bottom },
    fuse: fuseBox,
    fuseGroup: fuseGroupBox,
    h1: box(document.querySelector('h1')),
    share: shareBox,
    band: box(band),
    contentWidth: page.clientWidth - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight),
    siblingsInBandRow,
    overflowX: document.documentElement.scrollWidth > innerWidth,
    betweenFuseAndShare,
    fuseProvenance: {
      scope: details ? (details.closest('.band') ? 'in-band' : 'outside-band') : 'absent',
      summary: details?.querySelector('summary')?.textContent ?? '',
      hash: details?.querySelector('.hash')?.textContent ?? '',
      open: details?.hasAttribute('open') ?? false,
      expanded: details?.querySelector('.provenance__fields') ? 'fields-present' : 'fields-absent',
    },
    disclosures: {
      anchor: shown('.band .clock__anchor'), definition: shown('.band .clock__definition'),
      arithmetic: shown('.band .clock__arithmetic'),
      inDetails: !!document.querySelector('details .clock__anchor, details .clock__definition, details .clock__arithmetic'),
    },
  };
})()`;

const VIEWPORTS = [
  [390, 844],
  [1366, 768],
  [1440, 900],
] as const;

let app: ServedApp;
let browser: Browser;
const measured = new Map<string, Measurement>();
const key = (locale: Locale, width: number, height: number) => `${locale} ${width}x${height}`;
const thirdParty = (requests: readonly string[], base: string) =>
  requests.filter((url) => !url.startsWith(base) && !url.startsWith('data:') && !url.startsWith('about:'));

describe.skipIf(!READY)('spec 003 in a real Chromium against the built app', () => {
  beforeAll(async () => {
    app = await startServedApp();
    browser = await launchBrowser();
    for (const locale of LOCALES) {
      for (const [width, height] of VIEWPORTS) {
        const page = await browser.open(`${app.baseUrl}${routePath(locale)}`, { width, height });
        measured.set(key(locale, width, height), await page.evaluate<Measurement>(MEASURE));
        await page.close();
      }
    }
  }, 240_000);

  afterAll(async () => {
    browser?.close();
    await app?.close();
  });

  it('AC-003-01: the band spans the full content width, with no block beside it', () => {
    for (const [name, m] of measured) {
      expect(m.band.width, name).toBeCloseTo(m.contentWidth, 1);
      expect(m.siblingsInBandRow, name).toBe(0);
      expect(m.overflowX, name).toBe(false);
    }
  });

  it('AC-003-02: the day numeral is on --text-num-xl and strictly larger than the h1', () => {
    for (const locale of LOCALES) {
      expect(measured.get(key(locale, 390, 844))?.daysPx, locale).toBe(44);
      for (const [width, height] of [[1366, 768], [1440, 900]] as const) {
        expect(measured.get(key(locale, width, height))?.daysPx, `${locale} ${width}`).toBe(80);
      }
    }
    for (const [name, m] of measured) {
      expect(m.daysPx, name).toBeGreaterThan(m.h1Px);
      expect(m.textDisplay, name).toBe('clamp(2.5rem, 4.9vw, 4rem)');
    }
  });

  it('AC-003-03: no numeral on the page is larger than the day numeral; 16 años is 32px; the hero figure is demoted', () => {
    for (const [name, m] of measured) {
      expect(m.maxNumeralPx, name).toBeLessThanOrEqual(m.daysPx);
      expect(m.yearsPx, name).toBe(32);
      expect(m.heroValueClass, name).toContain('hero__value--demoted');
    }
  });

  it('AC-003-04: the seconds field is at least 32px on a desktop', () => {
    for (const locale of LOCALES) {
      for (const [width, height] of [[1366, 768], [1440, 900]] as const) {
        expect(measured.get(key(locale, width, height))?.secondsPx, `${locale} ${width}`).toBeGreaterThanOrEqual(32);
      }
    }
  });

  it('AC-003-05: anchor, projection sentence and two-reference sentence are visible, outside any details', () => {
    for (const [name, m] of measured) {
      expect(m.disclosures, name).toEqual({ anchor: true, definition: true, arithmetic: true, inDetails: false });
    }
  });

  it('AC-003-06: the clock and the fuse are in the first viewport at 390x844, 1366x768 and 1440x900', () => {
    for (const locale of LOCALES) {
      for (const [width, height] of VIEWPORTS) {
        const m = measured.get(key(locale, width, height));
        if (!m || !m.fuse) throw new Error(`${locale} ${width}: not measured`);
        expect(m.clock.top, `${locale} ${width}`).toBeGreaterThanOrEqual(0);
        expect(m.clock.bottom, `${locale} ${width}`).toBeLessThanOrEqual(height);
        expect(m.fuse.top, `${locale} ${width}`).toBeGreaterThanOrEqual(0);
        expect(m.fuse.bottom, `${locale} ${width}`).toBeLessThanOrEqual(height);
      }
    }
  });

  it('AC-003-48: h1, then the day numeral, then the fuse, then the share row — nothing between fuse and share', () => {
    for (const [name, m] of measured) {
      if (!m.h1 || !m.share || !m.fuse || !m.fuseGroup) throw new Error(`${name}: not measured`);
      expect(m.h1.top, name).toBeLessThan(m.clock.top);
      expect(m.clock.top, name).toBeLessThan(m.fuse.top);
      // The fuse's bottom edge is the fuse block's, disclosures included: the share row follows
      // the block, and nothing else renders text in the gap.
      expect(m.fuseGroup.bottom, name).toBeLessThanOrEqual(m.share.top + 0.5);
      expect(m.betweenFuseAndShare, name).toEqual([]);
    }
  });

  it('AC-003-49: the h1 sits inside the first viewport at all three widths, at --text-display', () => {
    for (const locale of LOCALES) {
      for (const [width, height] of VIEWPORTS) {
        const m = measured.get(key(locale, width, height));
        if (!m?.h1) throw new Error(`${locale} ${width}: no h1`);
        expect(m.h1.top, `${locale} ${width}`).toBeGreaterThanOrEqual(0);
        expect(m.h1.top, `${locale} ${width}`).toBeLessThan(height);
        // The move relocates the element: the h1 keeps --text-display's resolved size.
        expect(m.h1Px, `${locale} ${width}`).toBe(width === 390 ? 40 : 64);
      }
    }
  });

  it('AC-003-50: the share row starts inside the first viewport at both desktop widths', () => {
    for (const locale of LOCALES) {
      for (const [width, height] of [[1440, 900], [1366, 768]] as const) {
        const m = measured.get(key(locale, width, height));
        if (!m?.share) throw new Error(`${locale} ${width}: no share row`);
        expect(m.share.top, `${locale} ${width}`).toBeGreaterThanOrEqual(0);
        expect(m.share.top, `${locale} ${width}`).toBeLessThan(height);
      }
    }
  });

  it('AC-003-51: the fuse provenance is a closed disclosure in the band that still carries the digest', async () => {
    for (const [name, m] of measured) {
      expect(m.fuseProvenance, name).toMatchObject({
        scope: 'in-band',
        open: false,
        expanded: 'fields-present',
      });
      expect(m.fuseProvenance.hash, name).toMatch(/^[0-9a-f]{16,}$/);
      expect(m.fuseProvenance.summary.length, name).toBeGreaterThan(0);
    }
    // Expanding it reveals the four provenance fields and the reproduce path.
    const page = await browser.open(`${app.baseUrl}/`, { width: 1366, height: 768 });
    const expanded = await page.evaluate<{ summary: string; fields: number; reproduce: string; paths: string }>(`(() => {
      const details = document.querySelector('.fuse-group details');
      details.open = true;
      const rows = [...details.querySelectorAll('.provenance__detail dd code')].map((code) => code.textContent);
      return {
        summary: details.querySelector('summary').textContent,
        fields: details.querySelectorAll('.provenance__field').length,
        reproduce: document.querySelector('.fuse-group .fuse__reproduce')?.getAttribute('href') ?? '',
        paths: rows.join(' | '),
      };
    })()`);
    await page.close();
    expect(expanded.fields).toBe(4);
    expect(expanded.reproduce).toBe('#reproducir');
    // The published command and the derived file are both in the disclosure.
    expect(expanded.paths).toContain('scripts/compute.ts');
    expect(expanded.paths).toContain('data/derived/series/fuse.json');
    expect(expanded.summary).toBe(measured.get(key('es', 1440, 900))?.fuseProvenance.summary);
  });

  it('AC-003-22: the fuse is in the first viewport and resolves --accent and --ink-3 in both themes', async () => {
    const page = await browser.open(`${app.baseUrl}/`, { width: 1366, height: 768 });
    for (const theme of ['light', 'dark']) {
      const colours = await page.evaluate<{ fills: string[]; accent: string; ink3: string; deficit: string }>(`(() => {
        document.documentElement.dataset.theme = '${theme}';
        const probe = (v) => { const s = document.createElement('span'); s.style.color = 'var(' + v + ')'; document.body.append(s); const c = getComputedStyle(s).color; s.remove(); return c; };
        return { fills: [...document.querySelectorAll('.fuse rect')].map((r) => getComputedStyle(r).fill),
          accent: probe('--accent'), ink3: probe('--ink-3'), deficit: probe('--data-deficit') };
      })()`);
      expect(colours.fills, theme).toEqual([colours.ink3, colours.accent]);
      expect(colours.fills, theme).not.toContain(colours.deficit);
    }
    await page.close();
    for (const locale of LOCALES) {
      const fuse = measured.get(key(locale, 390, 844))?.fuse;
      expect(fuse?.bottom, locale).toBeLessThanOrEqual(844);
    }
  });

  it('AC-003-07: reduced motion hides the sub-day fields and shows the render instant’s day count', async () => {
    const page = await browser.open(`${app.baseUrl}/`, { width: 390, height: 844, reducedMotion: true });
    const state = await page.evaluate<{ sub: string[]; days: string; expected: number }>(`(() => ({
      sub: [...document.querySelectorAll('.clock__field--sub')].map((e) => getComputedStyle(e).display),
      days: document.querySelector('.clock__value--days').textContent.replace(/\\D/g, ''),
      expected: Math.floor((Date.parse('2042-01-01T00:00:00+01:00') - Date.now()) / 86400000),
    }))()`);
    await page.close();
    expect(state.sub).toEqual(['none', 'none', 'none']);
    expect(Number(state.days)).toBe(state.expected);
  });

  it('AC-003-21: the fuse geometry and text do not change while the clock ticks for 3 seconds', async () => {
    const page = await browser.open(`${app.baseUrl}/`, { width: 1366, height: 768 });
    const snapshot = `JSON.stringify({ html: document.querySelector('.fuse').outerHTML, box: document.querySelector('.fuse').getBoundingClientRect().toJSON() })`;
    const before = await page.evaluate<string>(snapshot);
    await new Promise((resolve) => setTimeout(resolve, 3100));
    const after = await page.evaluate<string>(snapshot);
    await page.close();
    expect(after).toBe(before);
  });

  it('AC-003-27: no native-share button without navigator.share; with it, the same text and URL as the links', async () => {
    const plain = await browser.open(`${app.baseUrl}/`, { width: 1366, height: 768 });
    expect(await plain.evaluate<number>(`document.querySelectorAll('.share button').length`)).toBe(1);
    await plain.close();
    const stubbed = await browser.open(`${app.baseUrl}/`, {
      width: 1366,
      height: 768,
      preload: 'navigator.share = async (data) => { window.__shared = data; };',
    });
    const result = await stubbed.evaluate<{ shared: { text: string; url: string }; whatsapp: string }>(`(async () => {
      let whatsapp = '';
      window.addEventListener('click', (e) => { const a = e.target.closest('a'); if (a) { whatsapp = a.href; e.preventDefault(); } });
      document.querySelector('.share a').click();
      document.querySelector('.share button').click();
      await new Promise((r) => setTimeout(r, 100));
      return { shared: window.__shared, whatsapp };
    })()`);
    await stubbed.close();
    expect(result.shared.url).toBe(canonicalUrl(publicPathFor('es')));
    expect(new URL(result.whatsapp).searchParams.get('text')).toBe(result.shared.text);
  });

  it('AC-003-28: copy link writes the canonical URL and shows the locale confirmation', async () => {
    await browser.grant(app.baseUrl, ['clipboardReadWrite', 'clipboardSanitizedWrite']);
    const page = await browser.open(`${app.baseUrl}/en`, { width: 1366, height: 768 });
    const result = await page.evaluate<{ clipboard: string; status: string; label: string }>(`(async () => {
      const button = [...document.querySelectorAll('.share button')].at(-1);
      button.click();
      await new Promise((r) => setTimeout(r, 200));
      return { clipboard: await navigator.clipboard.readText(), status: document.querySelector('.share [role=status]').textContent, label: button.textContent };
    })()`);
    await page.close();
    expect(result.clipboard).toBe(canonicalUrl(publicPathFor('en')));
    expect(result.status).toBe('Link copied');
    expect(result.label).toBe('Link copied');
  });

  it('AC-003-30: loading a public route and idling 3 seconds requests only the site’s own origin', async () => {
    for (const locale of LOCALES) {
      const page = await browser.open(`${app.baseUrl}${routePath(locale)}`, { width: 1366, height: 768 });
      await new Promise((resolve) => setTimeout(resolve, 3000));
      expect(page.requests.length, locale).toBeGreaterThan(0);
      expect(thirdParty(page.requests, app.baseUrl), locale).toEqual([]);
      await page.close();
    }
  });

  it('AC-003-31 and AC-003-32: sharing makes no third-party request from the page and sets no cookie', async () => {
    for (const locale of LOCALES) {
      const page = await browser.open(`${app.baseUrl}${routePath(locale)}`, {
        width: 1366,
        height: 768,
        preload: 'navigator.share = async () => undefined;',
      });
      await page.evaluate(`(async () => {
        for (const control of document.querySelectorAll('.share a, .share button')) control.click();
        await new Promise((r) => setTimeout(r, 1500));
        return true;
      })()`);
      expect(thirdParty(page.requests, app.baseUrl), locale).toEqual([]);
      const { cookies } = (await page.send('Network.getCookies', { urls: [app.baseUrl] })) as { cookies: unknown[] };
      expect(cookies, locale).toEqual([]);
      await page.close();
    }
  }, 60_000);
});
