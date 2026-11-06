import { PublicPage } from '../../web/components/PublicPage';
import { citationRegistry } from '../../web/content/citations';
import { formatDate } from '../../web/content/format';
import type { CountryLocaleContent, Locale } from '../../web/content/types';
import type { DerivedFigure } from '../../web/ingest/types';
import type { DerivedSeries } from '../../web/ingest/series-types';
import { CLOCK_TIME_ZONE } from '../../web/series/clock';
import { COUNTDOWN_BASE, COUNTDOWN_THRESHOLD } from '../../web/series/countdown';
import { content, dependencyFigure, renderComponent, shareFigure } from '../fixtures/figures';
import { countdownValue, seriesFixtures } from '../fixtures/series';

/** The instant every helper in this file renders at: three days out, the instant the clock tests pin. */
const STORY_NOW = Date.parse('2026-10-31T10:00:00Z');

export interface PageOptions {
  figures?: readonly DerivedFigure[];
  series?: readonly DerivedSeries[];
  nowMs?: number;
  stale?: boolean;
}

/** The public page as a reader receives it, with the committed deployment's own fixtures. */
export function storyPage(locale: Locale = 'es', options: PageOptions = {}): string {
  const figures = options.figures ?? [dependencyFigure(), shareFigure()];
  const series = options.series ?? seriesFixtures();
  return renderComponent(PublicPage, {
    content: content(locale),
    figures,
    citations: citationRegistry,
    freshnessWindowDays: 45,
    stale: options.stale === true,
    series,
    now: new Date(options.nowMs ?? STORY_NOW),
  });
}

/** Everything between `<main id="main">` and the story's after-step strip. */
export function storyOf(html: string): string {
  const at = html.indexOf('<main id="main">');
  const end = html.indexOf('class="story__strip"', at === -1 ? 0 : at);
  return at === -1 || end === -1 ? '' : html.slice(at, end);
}

/** One step's markup, from its opening tag to the next step's (or the strip's). */
export function stepOf(html: string, id: string): string {
  const at = html.indexOf(`data-top-step="${id}"`);
  if (at === -1) return '';
  const start = html.lastIndexOf('<section', at);
  const next = ['number', 'breakage', 'why', 'distance', 'meaning'];
  const following = next.slice(next.indexOf(id) + 1);
  const candidates = following
    .map((candidate) => html.indexOf(`data-top-step="${candidate}"`, at))
    .filter((position) => position > -1);
  const end = candidates.length > 0 ? Math.min(...candidates) : html.indexOf('class="story__strip"', at);
  return html.slice(start, end === -1 ? undefined : end);
}

/** The five steps' ids, in document order. */
export function stepIds(html: string): string[] {
  return [...html.matchAll(/data-top-step="([a-z]+)"/g)].map((match) => match[1] ?? '');
}

/** The appendix region: `#figuras` up to `#metodo`. */
export function figuresOf(html: string): string {
  const at = html.indexOf('id="figuras"');
  const end = html.indexOf('id="metodo"', at === -1 ? 0 : at);
  return at === -1 || end === -1 ? '' : html.slice(at, end);
}

/** The method region: `#metodo` up to the debate registers. */
export function methodOf(html: string): string {
  const at = html.indexOf('<section class="method"');
  const end = html.indexOf('id="debate"', at === -1 ? 0 : at);
  return at === -1 || end === -1 ? '' : html.slice(at, end);
}

export interface SectionRange {
  start: number;
  end: number;
}

/**
 * Where the `<section>` carrying `marker` sits in a rendered document: from its opening tag to its
 * closing one. One definition, so two suites cannot disagree about which section a marker names.
 */
export function sectionRangeOf(html: string, marker: string): SectionRange {
  const start = html.lastIndexOf('<section', html.indexOf(marker));
  return { start, end: html.indexOf('</section>', start) };
}

/** The section carrying `marker`, as the substring from its opening tag to its close. */
export function sectionOf(html: string, marker: string): string {
  const { start, end } = sectionRangeOf(html, marker);
  return html.slice(start, end);
}

/** The committed anchor date as the page states it, for the sentences that name it. */
export function anchorDate(locale: Locale): string {
  return formatDate(countdownValue().anchor as string, locale, CLOCK_TIME_ZONE);
}

/**
 * Step 1's one sentence with its variables filled from the committed values — built here from the
 * constants, never from the component, so the assertion stays independent of the code it checks.
 */
export function numberSentence(locale: Locale): string {
  return content(locale).t('steps.number.sentence', {
    date: anchorDate(locale),
    threshold: String(COUNTDOWN_THRESHOLD),
    base: String(COUNTDOWN_BASE),
  });
}

/** Visible text of a markup fragment: tags removed, entities decoded, whitespace collapsed. */
export function textOf(markup: string): string {
  return markup
    .replace(/<[^>]*>/g, ' ')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Every rendered `.clock__label`'s text, in document order: the number group's field labels. */
export function clockLabels(markup: string): string[] {
  return [...markup.matchAll(/class="clock__label">([^<]*)</g)].map((match) => (match[1] ?? '').trim());
}

/** Every `class="…"` token in a fragment, deduplicated. */
export function classesOf(markup: string): string[] {
  return [...new Set([...markup.matchAll(/class="([^"]*)"/g)].flatMap((match) => (match[1] ?? '').split(/\s+/)))].filter(
    (name) => name !== '',
  );
}

/** The locale's content model, for resolving the copy a page is expected to carry. */
export function localeContent(locale: Locale): CountryLocaleContent {
  return content(locale);
}
