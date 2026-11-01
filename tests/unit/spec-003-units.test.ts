import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { FigureStatusRow } from '../../web/components/FigureStatusRow';
import { Hero } from '../../web/components/public/Hero';
import { ReproduceBlock } from '../../web/components/public/ReproduceBlock';
import { bandCountdown } from '../../web/components/series/CountdownBand';
import { Fuse, burnPoint, fuseValueOf } from '../../web/components/series/Fuse';
import { formatWholePercent } from '../../web/content/format';
import { COUNTRY_DOCUMENTS, validateDocument } from '../../web/content/registry';
import { shareCopyProblems } from '../../web/content/share-copy';
import type { LocaleDocument } from '../../web/content/types';
import { computeFuse, displayPercent, drawnFraction } from '../../web/series/fuse';
import { shareHref } from '../../web/share/links';
import { content, dependencyFigure, renderComponent } from '../fixtures/figures';
import { committedPayload, countdownValue, seriesFixtures } from '../fixtures/series';

const ES = content('es');
const URL_ES = 'https://example.org';

function fuse() {
  const entry = seriesFixtures().find((candidate) => candidate.seriesId === 'fuse');
  if (!entry) throw new Error('no fuse');
  return entry;
}

describe('fuse arithmetic', () => {
  it('rounds half up to a whole percent and never caps', () => {
    expect(displayPercent(62.44)).toBe(62);
    expect(displayPercent(62.5)).toBe(63);
    expect(displayPercent(62.49)).toBe(62);
    expect(displayPercent(110)).toBe(110);
    expect(displayPercent(0)).toBe(0);
  });

  it('clamps only the drawn fraction', () => {
    expect(drawnFraction(-5)).toBe(0);
    expect(drawnFraction(0)).toBe(0);
    expect(drawnFraction(62.44)).toBeCloseTo(0.6244, 10);
    expect(drawnFraction(100)).toBe(1);
    expect(drawnFraction(140)).toBe(1);
  });

  it('places the burn point from the inline end', () => {
    expect(burnPoint(0)).toBe(1000);
    expect(burnPoint(62.44)).toBe(375.6);
    expect(burnPoint(100)).toBe(0);
    expect(burnPoint(250)).toBe(0);
  });

  it('property: the drawn fraction is in [0, 1] and the burn point in [0, 1000]', () => {
    fc.assert(
      fc.property(fc.double({ min: -1e6, max: 1e6, noNaN: true }), (percent) => {
        const fraction = drawnFraction(percent);
        const point = burnPoint(percent);
        return fraction >= 0 && fraction <= 1 && point >= 0 && point <= 1000;
      }),
    );
  });

  it('property: the printed percent is within half a point of the stored one', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100_000 }), (hundredths) => {
        const stored = hundredths / 100;
        return Math.abs(displayPercent(stored) - stored) <= 0.5;
      }),
    );
  });

  it('publishes nothing for a non-positive threshold', () => {
    expect(computeFuse({ observed: committedPayload('eurostat-demo-pjan'), threshold: 0 })).toBeNull();
    expect(computeFuse({ observed: committedPayload('eurostat-demo-pjan'), threshold: -50 })).toBeNull();
  });

  it('formats a whole percent with each locale’s typography', () => {
    expect(formatWholePercent(62, 'es')).toBe('62\u00A0%');
    expect(formatWholePercent(62, 'en')).toBe('62%');
    expect(formatWholePercent(1100, 'de')).toBe('1.100\u00A0%');
  });
});

describe('the fuse component', () => {
  it('renders nothing for a missing, unavailable or empty series', () => {
    expect(fuseValueOf(undefined)).toBeUndefined();
    expect(fuseValueOf({ ...fuse(), availability: 'unavailable' })).toBeUndefined();
    expect(fuseValueOf({ ...fuse(), value: null })).toBeUndefined();
    expect(renderComponent(Fuse, { content: ES, series: { ...fuse(), value: null }, freshnessWindowDays: 45 })).toBe('');
  });

  it('draws two rects with no style attribute and links to the reproduce panel', () => {
    const html = renderComponent(Fuse, { content: ES, series: fuse(), freshnessWindowDays: 45 });
    expect(html.split('<rect').length - 1).toBe(2);
    expect(html).not.toContain('style=');
    expect(html).toContain('href="#reproducir"');
  });
});

describe('the band’s countdown guard', () => {
  it('accepts only a computed countdown with an anchor and a year', () => {
    const value = countdownValue();
    expect(bandCountdown(value)).toBe(value);
    expect(bandCountdown({ ...value, anchor: null })).toBeUndefined();
    expect(bandCountdown({ ...value, thresholdYear: null })).toBeUndefined();
    expect(bandCountdown({ ...value, state: 'not-crossed' })).toBeUndefined();
  });
});

describe('share URLs', () => {
  it('telegram carries the URL in its own parameter and drops it from the text', () => {
    const href = new URL(shareHref('telegram', `Texto ${URL_ES}`, URL_ES));
    expect(href.searchParams.get('url')).toBe(URL_ES);
    expect(href.searchParams.get('text')).toBe('Texto');
  });

  it('linkedin reads only the URL; whatsapp and x carry the whole message', () => {
    expect(new URL(shareHref('linkedin', 'ignored', URL_ES)).searchParams.get('url')).toBe(URL_ES);
    expect(new URL(shareHref('linkedin', 'ignored', URL_ES)).search).not.toContain('ignored');
    for (const network of ['whatsapp', 'x'] as const) {
      expect(new URL(shareHref(network, `a & b ${URL_ES}`, URL_ES)).searchParams.get('text')).toBe(`a & b ${URL_ES}`);
    }
  });
});

describe('share copy rules', () => {
  it('is case-insensitive and per locale', () => {
    expect(shareCopyProblems('QUEDAN días', 'es')).toEqual(['quedan']);
    expect(shareCopyProblems('Faltan 3 días para el 1 de enero', 'es')).toEqual([]);
    expect(shareCopyProblems('urgent', 'it')).toEqual([]);
    expect(shareCopyProblems('urgente', 'it')).toEqual(['urgente']);
  });

  it('fails a locale document whose share.* string breaks the rules', () => {
    const [first] = COUNTRY_DOCUMENTS;
    if (!first) throw new Error('no documents');
    const broken: LocaleDocument = { ...first, strings: { ...first.strings, 'share.text': '¡Quedan {days} días!' } };
    const problems = validateDocument(broken).filter((problem) => problem.code === 'share-copy');
    expect(problems.map((problem) => problem.detail)).toEqual(['share.text: "!"', 'share.text: "quedan"']);
    expect(validateDocument(first).filter((problem) => problem.code === 'share-copy')).toEqual([]);
  });
});

describe('the nested status row and the demoted hero', () => {
  it('a nested row steps its title down to h3 and drops the chip', () => {
    const html = renderComponent(FigureStatusRow, { figureNumber: 3, content: ES, state: 'unavailable', nested: true });
    expect(html).toContain('<h3 class="figure-row__title"');
    expect(html).not.toContain('figure-row__chip');
  });

  it('the hero figure is demoted while the band shows, without a countdown in the panel', () => {
    const html = renderComponent(Hero, { content: ES, figures: [dependencyFigure()], bandShown: true });
    expect(html).toContain('hero__value hero__value--demoted');
    expect(html).not.toContain('class="countdown"');
    expect(renderComponent(Hero, { content: ES, figures: [dependencyFigure()] })).not.toContain('hero__value--demoted');
  });

  it('the reproduce panel does not advertise a series that carries no value', () => {
    const series = seriesFixtures().map((entry) => (entry.seriesId === 'fuse' ? { ...entry, value: null } : entry));
    const html = renderComponent(ReproduceBlock, { content: ES, figures: [], series });
    expect(html).not.toContain('--series fuse');
    expect(html).toContain('--series countdown');
  });
});
