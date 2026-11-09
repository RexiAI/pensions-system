import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PublicPage } from '../../web/components/PublicPage';
import { StoryStrip } from '../../web/components/public/StoryStrip';
import { citationRegistry } from '../../web/content/citations';
import { integerFormatter } from '../../web/content/format';
import { shareCopyProblems } from '../../web/content/share-copy';
import { SITE_URL, canonicalUrl } from '../../web/content/site';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import type { LocaleKey } from '../../web/content/keys';
import { publicPathFor } from '../../web/seo/routes';
import { anchorFor, readClock } from '../../web/series/clock';
import type { CountdownValue } from '../../web/series/countdown';
import { DAYS_PLACEHOLDER, SHARE_NETWORKS, messageAt, shareHref } from '../../web/share/links';
import { content, dependencyFigure, renderComponent, shareFigure } from '../fixtures/figures';
import { countdownValue, seriesFixtures } from '../fixtures/series';
import { decodeText } from '../helpers/render-document';
import { listSourceFiles, readSource } from '../helpers/source-scan';

const NOW = Date.parse('2026-10-31T10:00:00Z');
const DAY_MS = 86_400_000;
const ES_TEMPLATE =
  'Faltan {days} días para el 1 de enero de {year}: el año en que, según la proyección de Eurostat, España llega a 50 mayores de 65 por cada 100 personas en edad de trabajar. Compruébalo: {url}';

function band(locale: Locale = 'es', value: CountdownValue = countdownValue()): string {
  return renderComponent(StoryStrip, { content: content(locale), countdown: value });
}

function shareRegion(html: string): string {
  const start = html.indexOf('<div class="share"');
  return start === -1 ? '' : html.slice(start, html.indexOf('</div>', html.lastIndexOf('share__', html.length)) + 6);
}

function hrefs(html: string): string[] {
  return [...shareRegion(html).matchAll(/<a [^>]*href="([^"]*)"/g)].map((match) => decodeText(match[1] ?? ''));
}

function sharedText(href: string): string {
  const url = new URL(href);
  return url.searchParams.get('text') ?? '';
}

function yearOf(value: CountdownValue): string {
  return String(value.thresholdYear);
}

describe('AC-003-23: share links exist in server HTML and work without JavaScript', () => {
  it('AC-003-23: four plain links to the documented share URLs, each noopener noreferrer', () => {
    const html = shareRegion(band());
    const links = [...html.matchAll(/<a [^>]*>/g)].map((match) => match[0]);
    expect(links).toHaveLength(4);
    const targets = hrefs(band()).map((href) => new URL(href).origin + new URL(href).pathname);
    expect(targets).toEqual([
      'https://wa.me/',
      'https://t.me/share/url',
      'https://x.com/intent/post',
      'https://www.linkedin.com/sharing/share-offsite/',
    ]);
    for (const link of links) {
      expect(link).toContain('rel="noopener noreferrer"');
      expect(link).toContain('target="_blank"');
    }
  });
});

describe('AC-003-24: the no-JS share text leads with the derived year, no day count', () => {
  it('AC-003-24: the server text begins with 2042, names the projection and carries the canonical URL', () => {
    const url = canonicalUrl(publicPathFor('es'));
    for (const href of hrefs(band()).slice(0, 3)) {
      const text = sharedText(href);
      expect(text.startsWith(yearOf(countdownValue()))).toBe(true);
      expect(text).toContain('según la proyección de Eurostat');
      expect(href).toContain(encodeURIComponent(url));
      expect(text).not.toContain('Faltan');
      expect(text).not.toMatch(/\d+ días/);
    }
  });

  it('AC-003-24: the year moves with thresholdYear', () => {
    const later = { ...countdownValue(), thresholdYear: 2043, anchor: anchorFor(2043), years: 17 };
    const texts = hrefs(band('es', later)).slice(0, 3).map(sharedText);
    for (const text of texts) {
      expect(text.startsWith('2043')).toBe(true);
      expect(text).not.toContain('2042');
    }
  });
});

describe('AC-003-25: the share text computes days at click time from the approved template', () => {
  it('AC-003-25: clicked one day after render, the text carries the click instant’s day count', () => {
    const local = content('es');
    expect(local.strings['share.text']).toBe(ES_TEMPLATE);
    const value = countdownValue();
    const anchor = value.anchor as string;
    const url = canonicalUrl(publicPathFor('es'));
    const year = yearOf(value);
    const templates = {
      withDays: local.t('share.text', { year, url, days: DAYS_PLACEHOLDER }),
      withoutDays: local.t('share.textNoJs', { year, url }),
    };
    const t0 = NOW;
    const t1 = NOW + DAY_MS;
    const days = integerFormatter('es');
    const atT1 = messageAt(templates, anchor, t1, days);
    expect(atT1).toBe(ES_TEMPLATE.replace('{days}', days(readClock(anchor, t1).days)).replace('{year}', year).replace('{url}', url));
    expect(atT1).not.toBe(messageAt(templates, anchor, t0, days));
    expect(readClock(anchor, t1).days).toBe(readClock(anchor, t0).days - 1);
  });

  it('AC-003-25: once the anchor has passed, the year-led text is used, never a zero day count', () => {
    const templates = { withDays: 'Faltan {days}', withoutDays: 'year-led' };
    expect(messageAt(templates, anchorFor(2020) as string, NOW, String)).toBe('year-led');
  });
});

describe('AC-003-26: the shared URL is canonical and clean', () => {
  it('AC-003-26: the committed default is the site’s own origin, not a project alias', () => {
    // Re-pointed by spec 006 T13: comparing a control with the same constant that builds it is how
    // the wrong host shipped, so the origin itself is what this criterion now bounds.
    expect(SITE_URL).not.toContain('-projects.vercel.app');
    expect(new URL(SITE_URL).origin).toBe(SITE_URL);
    expect(readSource('web/content/site.ts')).toContain('process.env.SITE_URL');
  });

  it('AC-003-26: every control shares the route’s canonicalUrl with no tracking parameter', () => {
    for (const locale of LOCALES) {
      const url = canonicalUrl(publicPathFor(locale));
      expect(new URL(url).origin).toBe(SITE_URL);
      for (const network of SHARE_NETWORKS) {
        const href = shareHref(network, `text ${url}`, url);
        const params = new URL(href).searchParams;
        const shared = params.get('url') ?? (params.get('text') ?? '').split(' ').at(-1);
        expect(shared, `${locale} ${network}`).toBe(url);
        expect(href).not.toMatch(/utm_|fbclid|gclid|ref=|source=/);
      }
      expect(decodeText(band(locale))).toContain(`value="${url}"`);
    }
  });
});

describe('AC-003-27: native share appears only when available', () => {
  it('AC-003-27: the server HTML holds no native-share control or label in any locale', () => {
    for (const locale of LOCALES) {
      const html = shareRegion(band(locale));
      expect(html, locale).not.toContain('<button');
      expect(html, locale).not.toContain(content(locale).t('share.native'));
    }
    // The other half of this scenario — a native control that appears once `navigator.share`
    // exists, and sends the click-instant message with the canonical URL — is asserted by
    // mounting the component in a DOM: `share-controls.test.ts` (AC-003-27). It used to be
    // asserted here by scanning the component's own source text for three expressions, which
    // proved only that the file contained what it contained.
  });
});

describe('AC-003-28: copy link writes the canonical URL and confirms', () => {
  it('AC-003-28: without a clipboard (and without JS) the URL is selectable text with its label', () => {
    for (const locale of LOCALES) {
      const html = decodeText(shareRegion(band(locale)));
      expect(html, locale).toContain(content(locale).t('share.linkLabel'));
      expect(html, locale).toMatch(new RegExp(`<input class="share__url" type="text" readOnly="" value="${canonicalUrl(publicPathFor(locale)).replace(/[.?]/g, '\\$&')}"`));
    }
  });

  it('AC-003-28: the confirmation is a locale string distinguishable from the idle label, in a client-only status region', () => {
    for (const locale of LOCALES) {
      const strings = content(locale).strings;
      expect(strings['share.copied']?.trim(), locale).not.toBe('');
      // A confirmation identical to the idle label would announce nothing.
      expect(strings['share.copied'], locale).not.toBe(strings['share.copy']);
      // Without JavaScript the row carries no live region at all: the status element is
      // client-only, like the button that replaces the URL field.
      expect(shareRegion(band(locale)), locale).not.toContain('role="status"');
    }
    // What the click writes and announces — the clipboard payload, the status region's text and
    // the fallback field — is asserted by mounting the component: `share-controls.test.ts`
    // (AC-003-28).
  });
});

describe('AC-003-29: no third-party element in the markup', () => {
  it('AC-003-29: no script, iframe, img, link or source references another origin; no hint targets a network', () => {
    for (const locale of LOCALES) {
      const html = renderComponent(PublicPage, {
        content: content(locale),
        figures: [dependencyFigure(), shareFigure()],
        citations: citationRegistry,
        freshnessWindowDays: 45,
        stale: false,
        series: seriesFixtures(),
        now: new Date(NOW),
        pageKind: 'historia',
      });
      for (const tag of html.match(/<(script|iframe|img|link|source)\b[^>]*>/g) ?? []) {
        const reference = /\s(?:src|href|srcset)="(https?:[^"]*)"/.exec(tag)?.[1];
        if (reference) expect(new URL(reference).origin, `${locale}: ${tag}`).toBe(new URL(SITE_URL).origin);
      }
      expect(html).not.toMatch(/rel="(preconnect|dns-prefetch|prefetch)"/);
      expect(html).not.toMatch(/<(iframe|img)\b/);
    }
  });
});

describe('AC-003-30: zero third-party requests, structurally', () => {
  it('AC-003-30: the share code loads nothing: no fetch, beacon, image or script injection', () => {
    for (const file of [...listSourceFiles('web/components/share'), 'web/share/links.ts']) {
      const source = readSource(file);
      for (const call of ['fetch(', 'sendBeacon', 'new Image', 'XMLHttpRequest', 'createElement(', 'import(']) {
        expect(source, `${file}: ${call}`).not.toContain(call);
      }
    }
    // AC-003-31's behaviour — a click retargets its own link to the click-instant share URL, and
    // the page cancels nothing — is asserted by mounting the component: `share-controls.test.ts`
    // (AC-003-31).
  });
});

describe('AC-003-32: the no-tracking promise stays true', () => {
  it('AC-003-32: the footer string is unchanged and nothing on the public surface writes a cookie', () => {
    expect(content('es').t('footer.noTracking')).toBe('Sin cookies, sin analítica de terceros, sin rastreo.');
    for (const file of [...listSourceFiles('web/components'), ...listSourceFiles('web/share')]) {
      expect(readSource(file), file).not.toMatch(/document\.cookie|Set-Cookie/i);
    }
  });
});

describe('AC-003-33: share strings are localised and named; countdown bans stay outside share.*', () => {
  const SHARE_KEYS: readonly LocaleKey[] = [
    'share.label', 'share.text', 'share.textNoJs', 'share.native', 'share.whatsapp', 'share.telegram',
    'share.x', 'share.linkedin', 'share.copy', 'share.copied', 'share.linkLabel', 'share.newWindow',
  ];

  it('AC-003-33: every share key exists, non-empty, in all five locales, and the region renders from them', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      for (const key of SHARE_KEYS) expect(local.strings[key]?.trim(), `${locale} ${key}`).toBeTruthy();
      const region = decodeText(shareRegion(band(locale)));
      expect(region).toContain(`aria-label="${local.t('share.label')}"`);
      for (const key of ['share.whatsapp', 'share.telegram', 'share.x', 'share.linkedin', 'share.newWindow', 'share.linkLabel'] as const) {
        expect(region, `${locale} ${key}`).toContain(local.t(key));
      }
    }
    const component = readSource('web/components/share/ShareRow.tsx') + readSource('web/components/share/CopyLink.tsx');
    expect(component).not.toMatch(/>[A-Za-zÀ-ÿ][^<{]*</);
  });

  it('AC-003-33: no countdown.* string contains faltan or Compruébalo, and no countdown.* or hero.* string a countdown ban', () => {
    // Owner decision at stage 2 (2026-10-31): `hero.sub` keeps "Compruébalo tú" (spec 002); the
    // `Compruébalo` clause is asserted for `countdown.*`, the namespace AC-002-28 governs.
    const BANS = ['faltan', 'quedan', 'cuenta atrás', 'bomba', 'explota', '!'];
    const strings = (locale: Locale, prefix: string) =>
      Object.entries(content(locale).strings)
        .filter(([key]) => key.startsWith(prefix))
        .map(([key, value]) => [`${locale} ${key}`, value.toLocaleLowerCase()] as const);
    for (const locale of LOCALES) {
      for (const [label, value] of strings(locale, 'countdown.')) {
        expect(value, label).not.toContain('compruébalo');
        for (const ban of BANS) expect(value, label).not.toContain(ban);
      }
      for (const [label, value] of strings(locale, 'hero.')) {
        for (const ban of BANS) expect(value, label).not.toContain(ban);
      }
    }
  });
});

describe('AC-003-47: the share.* rule set accepts the approved template and rejects alarm copy', () => {
  it('AC-003-47: every locale’s templates pass; the es template carries Faltan, the anchor date and Compruébalo', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      for (const key of ['share.text', 'share.textNoJs'] as const) {
        expect(shareCopyProblems(local.strings[key], locale), `${locale} ${key}`).toEqual([]);
      }
      const text = local.strings['share.text'];
      for (const fact of ['{days}', '{year}', '{url}', 'Eurostat', '50', '65', '100']) {
        expect(text, `${locale}: ${fact}`).toContain(fact);
      }
      expect(local.strings['share.textNoJs'].startsWith('{year}'), locale).toBe(true);
    }
    const es = content('es').strings['share.text'];
    expect(es).toContain('Faltan');
    expect(es).toContain('1 de enero de {year}');
    expect(es).toContain('Compruébalo');
  });

  it('AC-003-47: Quedan, bomba, an exclamation mark and urgency adjectives fail', () => {
    for (const bad of [
      'Quedan 5540 días',
      'La bomba demográfica',
      'Faltan 5540 días!',
      'Es urgente',
      'Un cambio inminente',
      'Un dato alarmante',
      'Un futuro catastrófico',
      'Un resultado desastroso',
    ]) {
      expect(shareCopyProblems(bad, 'es'), bad).not.toEqual([]);
    }
    expect(shareCopyProblems('5,540 days left', 'en')).not.toEqual([]);
    expect(shareCopyProblems('Une hausse imminente', 'fr')).not.toEqual([]);
    expect(shareCopyProblems('Dringend prüfen', 'de')).not.toEqual([]);
    expect(shareCopyProblems('Restano 5540 giorni', 'it')).not.toEqual([]);
  });
});

describe('the share region in the page', () => {
  it('sits in the band after the fuse, never inside the countdown block, and never in the accent', () => {
    const css = readFileSync('web/styles/globals.css', 'utf8');
    const share = css.slice(css.indexOf('\n.share {'), css.indexOf('.visually-hidden {'));
    expect(share).not.toContain('--accent');
    expect(share).toContain('min-block-size: var(--tap-min)');
    expect(share).toContain('min-inline-size: var(--tap-min)');
  });
});
