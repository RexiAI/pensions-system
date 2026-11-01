import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import manifest from '../../app/manifest';
import sitemap from '../../app/sitemap';
import { formatDate } from '../../web/content/format';
import { LOCALES } from '../../web/content/types';
import { metadataFor, pageMetadata } from '../../web/seo/metadata';
import { shareAlt, shareCard } from '../../web/seo/share-card';
import { committedThresholdYear } from '../../web/seo/threshold-year';
import { CLOCK_TIME_ZONE, readClock } from '../../web/series/clock';
import { content } from '../fixtures/figures';
import { countdownAt, countdownSeries, countdownValue, unavailableSeries } from '../fixtures/series';
import { listSourceFiles, readSource } from '../helpers/source-scan';

const YEAR = countdownValue().thresholdYear as number;

function cardText(locale: string, year: number | null = YEAR): string {
  const card = shareCard(locale, year);
  if (!card) throw new Error(`no card for ${locale}`);
  return renderToStaticMarkup(card.element).replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'");
}

/** Every string a static preview artefact carries for one locale. */
function staticStrings(locale: string): string[] {
  const meta = metadataFor(locale);
  const og = meta.openGraph as { title?: string; description?: string } | undefined;
  return [
    String(meta.title),
    String(meta.description),
    String(og?.title),
    String(og?.description),
    shareAlt(locale),
    cardText(locale),
  ];
}

function seriesDirWith(entry: unknown): string {
  const dir = mkdtempSync(join(tmpdir(), 'series-'));
  writeFileSync(join(dir, 'countdown.json'), JSON.stringify(entry), 'utf8');
  return dir;
}

describe('AC-003-34: title and og:title carry the year in every locale', () => {
  it('AC-003-34: both contain the derived year and keep the scope suffix', () => {
    expect(committedThresholdYear()).toBe(YEAR);
    for (const locale of LOCALES) {
      const meta = pageMetadata(locale);
      const country = content(locale).country.name;
      for (const title of [meta.title, meta.ogTitle]) {
        expect(title, locale).toContain(String(YEAR));
        expect(title.endsWith(` · ${country}`), locale).toBe(true);
      }
    }
  });
});

describe('AC-003-35: og:description and the share card carry the year', () => {
  it('AC-003-35: og:description and the card text contain the year; og:image:alt is distinct per locale', () => {
    for (const locale of LOCALES) {
      const og = metadataFor(locale).openGraph as { description?: string };
      expect(og.description, locale).toContain(String(YEAR));
      expect(cardText(locale), locale).toContain(String(YEAR));
      expect(shareAlt(locale), locale).toContain(String(YEAR));
    }
    expect(new Set(LOCALES.map((locale) => shareAlt(locale))).size).toBe(LOCALES.length);
  });
});

describe('AC-003-36: the year is derived, never typed', () => {
  it('AC-003-36: a threshold that yields 2043 moves every preview string to 2043', () => {
    const moved = countdownAt(49).thresholdYear ?? 2043;
    expect(moved).not.toBe(YEAR);
    for (const locale of LOCALES) {
      const meta = pageMetadata(locale, moved);
      for (const text of [meta.title, meta.ogTitle, meta.description, cardText(locale, moved), shareAlt(locale, moved)]) {
        expect(text, locale).toContain(String(moved));
        expect(text, locale).not.toContain(String(YEAR));
      }
    }
  });

  it('AC-003-36: no locale file, component or generated source contains a hand-typed year', () => {
    const locales = LOCALES.map((locale) => `web/content/data/ES/${locale}.json`);
    const files = [
      ...locales,
      ...listSourceFiles('web/components'),
      ...listSourceFiles('web/seo'),
      ...listSourceFiles('web/share'),
      ...listSourceFiles('app'),
      'web/brand/generated.ts',
    ];
    for (const file of files) expect(readSource(file), file).not.toContain(String(YEAR));
  });
});

describe('AC-003-37: no day count in any static artefact', () => {
  it('AC-003-37: title, description, og/twitter strings, card, alt, sitemap and manifest carry no day, time or anchor date', () => {
    const anchor = countdownValue().anchor as string;
    const days = readClock(anchor, Date.now()).days;
    const artefacts = [JSON.stringify(sitemap()), JSON.stringify(manifest())];
    for (const locale of LOCALES) {
      const anchorDate = formatDate(anchor, locale, CLOCK_TIME_ZONE);
      const strings = [...staticStrings(locale), ...artefacts];
      for (const text of strings) {
        expect(text, locale).not.toContain(anchorDate);
        expect(text.replace(/\D/g, ' ').split(' '), locale).not.toContain(String(days));
        expect(text.replace(/\D/g, ' ').split(' '), locale).not.toContain(String(days - 1));
        expect(text, locale).not.toMatch(/\b\d{1,2}:\d{2}\b/);
      }
      expect(JSON.stringify(metadataFor(locale)), locale).not.toContain('twitter');
    }
  });
});

describe('AC-003-38: no threshold year, no year in the preview', () => {
  it('AC-003-38: not-crossed, unavailable and withheld resolve no year', () => {
    const notCrossed = { ...countdownSeries(), value: countdownAt(90) };
    for (const entry of [notCrossed, unavailableSeries(countdownSeries()), { ...countdownSeries(), value: null }]) {
      expect(committedThresholdYear(seriesDirWith(entry))).toBeNull();
    }
    expect(committedThresholdYear(join(tmpdir(), 'no-such-series-dir'))).toBeNull();
  });

  it('AC-003-38: the year-free strings carry no year and no substitute', () => {
    for (const locale of LOCALES) {
      const meta = pageMetadata(locale, null);
      for (const text of [meta.title, meta.ogTitle, meta.description, cardText(locale, null), shareAlt(locale, null)]) {
        expect(text, locale).not.toMatch(/\b(19|20)\d\d\b/);
      }
      expect(meta.description).toBe(content(locale).t('hero.sub'));
    }
  });
});
