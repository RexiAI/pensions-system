import { describe, expect, it } from 'vitest';
import { AGE_BANDS, bandLabel } from '../../web/series/age-bands';
import type { PyramidValue } from '../../web/series/age-structure';
import type { CountdownValue } from '../../web/series/countdown';
import { citationRegistry } from '../../web/content/citations';
import { formatValue } from '../../web/content/format';
import { decodeText } from '../helpers/render-document';
import { PublicPage } from '../../web/components/PublicPage';
import { BreakageStep } from '../../web/components/public/BreakageStep';
import { CountdownPrecision } from '../../web/components/public/CountdownPrecision';
import { FiguresRegion } from '../../web/components/public/FiguresRegion';
import { MeaningStep } from '../../web/components/public/MeaningStep';
import { MethodRegion } from '../../web/components/public/MethodRegion';
import { PyramidStep } from '../../web/components/public/PyramidStep';
import { RegisterKey } from '../../web/components/public/RegisterKey';
import { SubjectFacts } from '../../web/components/public/SubjectFacts';
import { TopStepSection } from '../../web/components/public/TopStepSection';
import { TOP_STEPS } from '../../web/components/public/top-steps';
import { PyramidPlate } from '../../web/components/series/PyramidPlate';
import { BANNED_TOP_TERMS, scanTopRegion, topRegionOf } from '../../web/build/public-plain-language';
import { content, cohortFigure, coverFigure, makeFigure, renderComponent, shareFigure, shareValue } from '../fixtures/figures';
import { countdownValue, pyramidSeries, seriesFixtures, unavailableSeries } from '../fixtures/series';
import { publisherForUrl } from '../../web/sources/labels';

/**
 * Mutation-killing tests for spec 004 (stage 5a). Every block names the surviving mutant it kills,
 * so a later reader can tell a real gap from a deliberately unpinned variant.
 *
 * These are assertions about behaviour that the stage-5a run found untested — never rewrites of an
 * existing test. Where a mutant cannot be killed from any reachable state it is recorded in
 * `specs/004-plain-countdown/30-report.md` as equivalent instead of being tested here.
 */

const ES = content('es');
const NOW = Date.parse('2026-10-31T10:00:00Z');

const INE = 'https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/TM1657?nult=5';
const EUROSTAT = 'https://ec.europa.eu/eurostat/databrowser/view/proj_23np/default/table';

function stepNamed(id: string) {
  const step = TOP_STEPS.find((candidate) => candidate.id === id);
  if (!step) throw new Error(`no step ${id}`);
  return step;
}

describe('public-plain-language: the region boundary', () => {
  /** Kills `topRegionOf`'s three survivors at L57 (whole document, `? html : …`, `end === +1`). */
  it('ends the region at the after-story strip rather than at the end of the document', () => {
    const html = '<body><main id="main"><p>uno</p></main><div class="story__strip">STRIP-MARKER</div></body>';
    const region = topRegionOf(html);
    expect(region.startsWith('<main')).toBe(true);
    expect(region).not.toContain('STRIP-MARKER');
  });

  /** Kills the same survivors from the other side: a document with no strip runs to the end. */
  it('takes the whole tail when the document carries no after-story strip', () => {
    const html = '<body><main id="main"><p>uno</p></main></body>';
    expect(topRegionOf(html)).toBe('<main id="main"><p>uno</p></main></body>');
  });

  /** Kills the `trim()` survivor at L61: a slice that ends on the strip's own whitespace is trimmed. */
  it('trims the whitespace a bounded context window ends on', () => {
    const html = '<main id="main">ratio de dependencia <div class="story__strip"></div></main>';
    const hit = scanTopRegion(html, 'es').find((candidate) => candidate.term === 'ratio de dependencia');
    expect(hit?.context).toBe('<main id="main">ratio de dependencia <div');
  });

  /** Kills the four `contextAround` mutants at L61 (bounds, `index + CONTEXT`, lost collapse). */
  it('bounds the context window around the hit and collapses its whitespace', () => {
    const pad = `${'z'.repeat(70)}\n  ${'z'.repeat(7)}`;
    const html = `<main id="main">\n<p>\n${pad} la ratio de dependencia ${pad}\n</p>\n</main>`;
    const hits = scanTopRegion(html, 'es');
    const hit = hits.find((candidate) => candidate.term === 'ratio de dependencia');
    expect(hit).toBeDefined();
    expect(hit?.context).toContain('ratio de dependencia');
    expect(hit?.context).not.toContain('\n');
    expect(hit?.context).not.toContain('  ');
    // One context window is 2 * CONTEXT characters wide: a raw text or an unbounded slice is not.
    expect((hit?.context ?? '').length).toBeLessThanOrEqual(2 * 60 + 'ratio de dependencia'.length);
  });

  /**
   * Kills the four `scanTopRegion` survivors at L72 and L79: a non-empty default term list, an
   * empty term not skipped, a whitespace-only term not skipped, and a `trim()` that is not applied.
   */
  it('skips empty and blank caller terms and carries no default terms of its own', () => {
    expect(scanTopRegion('<main id="main"><p>texto llano</p></main>', 'es', ['', ' ', '\n'])).toEqual([]);
    // No third argument: the point is that the *default* term list is empty for benign text.
    // `'es'` is inert here — `scanTopRegion` ignores its locale — and matches the sibling call
    // one line above, so both assertions read as one shape of call.
    expect(scanTopRegion('<main id="main"><p>Stryker was here</p></main>', 'es')).toEqual([]);
    expect(BANNED_TOP_TERMS.every((term) => term.trim() !== '')).toBe(true);
  });
});

describe('CountdownPrecision: each precision line is conditional', () => {
  const rendered = (countdown: CountdownValue, nowMs = NOW) =>
    renderComponent(CountdownPrecision, { content: ES, countdown, nowMs });

  /** Kills the L15 survivor: a null threshold year must render no year line at all. */
  it('renders no year line when the projection crosses no threshold', () => {
    const html = rendered({ ...countdownValue(), thresholdYear: null, anchor: null, years: null });
    expect(html).not.toContain('countdown__year');
    // No anchor is not an elapsed clock: the definition stays in the future tense.
    expect(html).toContain(ES.t('countdown.clock.definition', { date: '' }));
    expect(html).not.toContain(ES.t('countdown.clock.elapsed', { date: '' }));
  });

  /** Kills the L50 survivor: a null back-cast must render no comparison. */
  it('renders no back-cast line when the projection carries none', () => {
    const html = rendered({ ...countdownValue(), backCast: null });
    expect(html).not.toContain('countdown__backcast');
  });

  /** Kills the L70 survivor: the definition's tense is the clock's state, both ways. */
  it('writes the definition in the tense the anchor selects', () => {
    const past = rendered({ ...countdownValue(), anchor: '2020-01-01T00:00:00+01:00' }, Date.parse('2026-10-31T10:00:00Z'));
    expect(past).toContain(ES.t('countdown.clock.elapsed', { date: '1 de enero de 2020' }));
    expect(past).not.toContain(ES.t('countdown.clock.definition', { date: '1 de enero de 2020' }));

    const future = rendered(countdownValue(), NOW);
    expect(future).toContain(ES.t('countdown.clock.definition', { date: '1 de enero de 2042' }));
    expect(future).not.toContain(ES.t('countdown.clock.elapsed', { date: '1 de enero de 2042' }));
  });

  /** Kills the two `{' '}` survivors at L42 and L115: the label and its value stay separated. */
  it('separates the anchor label, the anchor date and the observed year by a space', () => {
    const html = rendered(countdownValue());
    expect(html).toContain('</span> <span class="clock__anchor-date">');
    const note = /<p class="method__note">([\s\S]*?)<\/p>/.exec(html)?.[1] ?? '';
    expect(note).toContain(`${ES.t('provenance.observedAt')} `);
    expect(note.trim().endsWith('2026')).toBe(true);
  });
});

describe('FiguresRegion: the heading and the one ledger note', () => {
  /** Kills the L64 survivors: no heading without a published figure, and the heading names itself. */
  it('heads the appendix only where a figure is published, with its own label', () => {
    const empty = renderComponent(FiguresRegion, {
      content: ES,
      figures: [makeFigure({ figureId: 'fig-06', unit: 'ratio', value: null, availability: 'unavailable' })],
      freshnessWindowDays: 45,
    });
    expect(empty).not.toContain('region__heading');
    expect(empty).toContain('<div id="figuras"></div>');

    const full = renderComponent(FiguresRegion, {
      content: ES,
      figures: [makeFigure({ figureId: 'fig-02', unit: 'percent', value: shareValue() })],
      freshnessWindowDays: 45,
    });
    expect(full).toContain(`<h2 class="region__heading">${ES.t('nav.figures')}</h2>`);
  });

  /** Kills the L72 survivor: the ledger note leads the first ledger-state figure, not every one. */
  it('renders the ledger note once, above the first figure in a ledger state', () => {
    const html = renderComponent(FiguresRegion, {
      content: ES,
      figures: [
        makeFigure({ figureId: 'fig-02', unit: 'percent', value: shareValue() }),
        // Published as `computed` but carrying no value: promoted to `withheld`, which is a
        // ledger state and therefore the figure the note belongs above.
        makeFigure({ figureId: 'fig-03', unit: 'percent', value: null, availability: 'computed' }),
        makeFigure({ figureId: 'fig-04', unit: 'EUR', value: null, availability: 'computed' }),
      ],
      freshnessWindowDays: 45,
    });
    expect(html.split('class="figure-ledger-note"').length - 1).toBe(1);
  });
});

describe('the step shells: the label, the id and the class are the structure', () => {
  /** Kills the L26 survivor in `TopStepSection`: an empty class list stops naming the step. */
  it('renders a section whose class, id and label all come from the step', () => {
    const html = renderComponent(TopStepSection, {
      step: stepNamed('number'),
      content: ES,
      children: null,
    });
    expect(html).toContain('class="step step--number"');
    expect(html).toContain('id="paso-number"');
    expect(html).toContain('aria-labelledby="paso-number-heading"');
    expect(html).toContain('id="paso-number-heading"');
  });

  /** Kills the L15 survivor in `MeaningStep`: the sentence is the content model's, not empty. */
  it('states the meaning sentence and the one action', () => {
    const html = renderComponent(MeaningStep, { step: stepNamed('meaning'), content: ES });
    expect(html).toContain(`<p class="step__statement">${ES.t('steps.meaning.sentence')}</p>`);
    expect(html).toContain(`href="#figuras">${ES.t('hero.ctaPrimary')}</a>`);
  });

  /** Kills the L32 survivor in `RegisterKey`: the key's first link names the figure it points at. */
  it('names each figure the register key links to', () => {
    const html = renderComponent(RegisterKey, { content: ES });
    expect(html).toContain(`>${ES.t('fig.01.title')}</a>`);
  });
});

describe('MethodRegion: it renders without the material it documents', () => {
  /** Kills the L45 and L69 survivors: no series means no strip, and the heading is its own. */
  it('renders the method heading and no strip when nothing is published', () => {
    const html = renderComponent(MethodRegion, {
      content: ES,
      sources: {},
      freshnessWindowDays: 45,
      nowMs: NOW,
      countries: [],
    });
    expect(html).toContain(`<h2 class="method__heading" id="metodo-heading">${ES.t('nav.method')}</h2>`);
    expect(html).not.toContain('provenance__field');
    expect(html).not.toContain('fuse__label');
  });
});

describe('the story with nothing published', () => {
  /** Kills the `PublicPage` survivors at L52, L81, L83 and L87. */
  it('renders the shell from content alone, with no series and no figures', () => {
    const html = renderComponent(PublicPage, {
      content: ES,
      figures: [],
      citations: citationRegistry,
      freshnessWindowDays: 45,
      stale: false,
      series: [],
      now: new Date(NOW),
    });
    expect(html).toContain(`<a class="skip-link" href="#main">${ES.t('site.skipLink')}</a>`);
    expect(html).toContain('<div id="figuras"></div>');
    // The scope mark falls back to this country's own record.
    expect(html).toContain('class="scope" data-scope="text"');
    expect(html).toContain(`<span class="scope__name">${ES.country.name}</span>`);
    // No figure, so no snapshot date and no publisher in the source strip.
    expect(html).toContain('<time dateTime=""></time>');
  });

  /** Kills the L83 survivor: a page with figures lists their publisher in the source strip. */
  it('lists each publisher once in the source strip', () => {
    const html = renderComponent(PublicPage, {
      content: ES,
      figures: [
        makeFigure({ figureId: 'fig-02', unit: 'percent', value: shareValue() }),
        makeFigure({ figureId: 'fig-01', unit: 'ratio', value: shareValue() }),
      ],
      citations: citationRegistry,
      freshnessWindowDays: 45,
      stale: false,
      series: seriesFixtures(),
      now: new Date(NOW),
    });
    expect(html).toContain('<span>Instituto Nacional de Estadística (INE)</span>');
  });

  /** Kills the ten `lifeExpectancyOf` survivors: the ledger states the cohort's own assumption. */
  it('reads the life expectancy from the cohort figure that publishes it', () => {
    const html = renderComponent(PublicPage, {
      content: ES,
      figures: [
        // fig-03 is deliberately not first: the cohort lookup must find the figure, not the head.
        makeFigure({ figureId: 'fig-02', unit: 'percent', value: shareValue() }),
        { ...cohortFigure(), assumptions: { lifeExpectancyAtRetirement: 21.5 } },
      ],
      citations: citationRegistry,
      freshnessWindowDays: 45,
      stale: false,
      series: seriesFixtures(),
      now: new Date(NOW),
    });
    expect(html).toContain(`<dt>${ES.t('assumptions.lifeExpectancy.label')}</dt><dd>21,5</dd>`);
  });

  /**
   * Kills the L42:10 survivor: an assumption that is not a number is not formatted as one.
   * `DerivedFigure['assumptions']` admits a string, so this is a reachable payload, and the
   * ledger's own `notDefined` label is the answer — not a number parsed out of the string.
   */
  it('reports a non-numeric assumption as not defined', () => {
    const html = renderComponent(PublicPage, {
      content: ES,
      figures: [{ ...cohortFigure(), assumptions: { lifeExpectancyAtRetirement: '21,5' } }],
      citations: citationRegistry,
      freshnessWindowDays: 45,
      stale: false,
      series: seriesFixtures(),
      now: new Date(NOW),
    });
    expect(html).toContain(`<dt>${ES.t('assumptions.lifeExpectancy.label')}</dt><dd>${ES.t('table.notDefined')}</dd>`);
    expect(html).not.toContain('<dd>21,5</dd>');
  });

  /** Kills the L52 survivor: an unavailable countdown is no countdown, not a null one. */
  it('publishes no clock when the countdown series is unavailable', () => {
    const countdown = unavailableSeries(seriesFixtures().find((entry) => entry.seriesId === 'countdown') as never);
    const html = renderComponent(PublicPage, {
      content: ES,
      figures: [],
      citations: citationRegistry,
      freshnessWindowDays: 45,
      stale: false,
      series: [countdown, ...seriesFixtures().filter((entry) => entry.seriesId !== 'countdown')],
      now: new Date(NOW),
    });
    expect(html).not.toContain('data-clock-state');
    expect(html).not.toContain('class="share"');
  });
});

describe('the countdown step without a clock', () => {
  /** Kills the L47 survivor in `NumberStep`: a computed countdown with no anchor claims no number. */
  it('renders the label and the action but no clock when there is no anchor', () => {
    const html = renderComponent(PublicPage, {
      content: ES,
      figures: [],
      citations: citationRegistry,
      freshnessWindowDays: 45,
      stale: false,
      series: seriesFixtures().map((entry) =>
        entry.seriesId === 'countdown'
          ? { ...entry, value: { ...(entry.value as CountdownValue), anchor: null } }
          : entry,
      ),
      now: new Date(NOW),
    });
    expect(html).toContain('data-top-step="number"');
    expect(html).not.toContain('clock__value--days');
    expect(html).not.toContain('class="share"');
  });

  /** Kills the L37 survivor in `NumberStep`: the unit's label is the content model's. */
  it('labels the one unit from the content model', () => {
    const html = renderComponent(PublicPage, {
      content: ES,
      figures: [],
      citations: citationRegistry,
      freshnessWindowDays: 45,
      stale: false,
      series: seriesFixtures(),
      now: new Date(NOW),
    });
    expect(html).toContain(`<span class="clock__label">${ES.t('countdown.clock.days')}</span>`);
    expect(html).not.toContain(`<span class="clock__label">${ES.t('countdown.clock.seconds')}</span>`);
  });
});

describe('a step whose data is absent does not exist', () => {
  /** Kills the two `PyramidStep` survivors at L20. */
  it('renders nothing without a series, and nothing for an unavailable one', () => {
    expect(renderComponent(PyramidStep, { step: stepNamed('why'), content: ES, freshnessWindowDays: 45 })).toBe('');
    const unavailable = unavailableSeries(pyramidSeries());
    expect(
      renderComponent(PyramidStep, { step: stepNamed('why'), content: ES, series: unavailable, freshnessWindowDays: 45 }),
    ).toBe('');
  });
});

describe('SubjectFacts: the period is stated only when its points publish a label', () => {
  const periodOf = (value: unknown): string => {
    const figure = makeFigure({ figureId: 'fig-02', unit: 'percent', value });
    const html = decodeText(renderComponent(SubjectFacts, { content: ES, figure }));
    const cells = [...html.matchAll(/<dt>([^<]*)<\/dt>/g)].map((match) => match[1] ?? '');
    return cells.includes(ES.t('hero.periodLabel')) ? 'stated' : 'absent';
  };

  /** Kills the `span` guard survivors at L27 and the point-label survivor at L33. */
  it('leaves the period out when either end of the series publishes no label', () => {
    expect(periodOf({ ...shareValue(), points: [{ percent: 9 }, { year: 2024 }] })).toBe('absent');
    expect(periodOf({ ...shareValue(), points: [{ year: 1995 }, { percent: 13 }] })).toBe('absent');
    expect(periodOf({ ...shareValue(), points: [{ percent: 9 }, { percent: 13 }] })).toBe('absent');
  });

  /** Kills the L28 survivor: one point is one label, never a dash onto itself. */
  it('states one label for a one-point series', () => {
    const figure = makeFigure({ figureId: 'fig-02', unit: 'percent', value: { ...shareValue(), points: [{ year: 2024 }] } });
    const html = decodeText(renderComponent(SubjectFacts, { content: ES, figure }));
    expect(html).toContain(`<dt>${ES.t('hero.periodLabel')}</dt><dd>2024</dd>`);
  });

  /** Kills the L19 and L57 survivors: a value with no points has no period row at all. */
  it('omits the period row for a figure whose value publishes no points', () => {
    const html = decodeText(
      renderComponent(SubjectFacts, { content: ES, figure: makeFigure({ figureId: 'fig-04', unit: 'EUR', value: { debt: 1 } }) }),
    );
    expect(html).not.toContain(ES.t('hero.periodLabel'));
    expect(html.match(/<dt>/g)?.length).toBe(3);
  });
});

describe('PyramidPlate: the chart, the annotation and the disclosure', () => {
  const VALUE = pyramidSeries().value as PyramidValue;
  const HTML = decodeText(renderComponent(PyramidPlate, { content: ES, series: pyramidSeries() }));
  const PANELS = [...HTML.matchAll(/<div class="demography__panel demography__panel--([a-z]+)" data-projection="([a-z]+)">/g)].map(
    (match) => ({ hue: match[1], state: match[2] }),
  );
  const bars = (markup: string) =>
    [...markup.matchAll(/<rect class="demography__bar" x="([^"]*)" y="([^"]*)" width="([^"]*)" height="10"><\/rect>/g)].map(
      (match) => ({ x: match[1], y: match[2], width: match[3] }),
    );

  /** One panel's own markup, from its opening tag to the next panel's. */
  function panelAt(index: number): string {
    const starts = [...HTML.matchAll(/<div class="demography__panel /g)].map((match) => match.index ?? 0);
    const start = starts[index] ?? 0;
    const end = starts[index + 1] ?? HTML.length;
    return HTML.slice(start, end);
  }

  /** Kills the L288 survivors: no computed value, no plate. */
  it('renders nothing when the series is unavailable rather than empty', () => {
    expect(renderComponent(PyramidPlate, { content: ES, series: unavailableSeries(pyramidSeries()) })).toBe('');
  });

  /** Kills the `viewBox`, panel-hue and panel-state survivors at L123, L128 and L163. */
  it('gives each panel its year, its state and its own hue', () => {
    expect(PANELS).toEqual([
      { hue: 'reference', state: 'observed' },
      { hue: 'measured', state: 'observed' },
      { hue: 'projected', state: 'projected' },
    ]);
    expect(HTML).toContain('viewBox="0 0 360 320"');
    expect(panelAt(0)).toContain(`<title id="demography-1995-title">1995 · ${ES.t('demography.year.observed')}</title>`);
  });

  /** Kills the L70, L73, L78, L79 and L80 survivors: the shared axis is drawn where it says. */
  it('draws one axis with a tick at 2 and 4 per side', () => {
    const axis = panelAt(0);
    expect(axis).toContain('<line class="demography__baseline" x1="201" y1="6" x2="201" y2="304"></line>');
    expect(axis).toContain('<line class="demography__grid" x1="267.7" y1="6" x2="267.7" y2="304"></line>');
    expect(axis).toContain('<line class="demography__grid" x1="334.3" y1="6" x2="334.3" y2="304"></line>');
    expect(axis).toContain('<text class="demography__tick" x="267.7" y="318" text-anchor="middle">2\u00A0%</text>');
    expect(axis).toContain('<text class="demography__tick" x="334.3" y="318" text-anchor="middle">4\u00A0%</text>');
  });

  /** Kills the `barY` and bar-rect survivors at L33, L34, L62 and L144. */
  it('plots the bands foot-first, each bar against the shared centre', () => {
    const first = bars(panelAt(0));
    expect(first).toHaveLength(AGE_BANDS.length * 2);
    expect(first[0]).toEqual({ x: '117', y: '290', width: '84' });
    expect(first[1]).toEqual({ x: '201', y: '290', width: '79' });
    expect(first[first.length - 1]?.y).toBe('10');
    // The age label sits on the bar's baseline, not a bar height above it.
    expect(panelAt(0)).toContain('<text class="demography__age demography__age--major" x="38" y="300" text-anchor="end">0–4</text>');
  });

  /** Kills the L142 survivors: every fifth band is a major label, and only those. */
  it('marks a major age label at each twenty-year boundary', () => {
    const major = panelAt(0).split('demography__age demography__age--major').length - 1;
    expect(major).toBe(AGE_BANDS.filter((band) => band % 20 === 0).length);
    expect(panelAt(0).split('class="demography__age"').length - 1).toBe(AGE_BANDS.length - major);
  });

  /** Kills the `annotatedBand` survivors at L91, L92 and L93 and the `annotated` prop at L136. */
  it('annotates one band per panel, naming the band it marks', () => {
    expect(HTML.split('data-annotated="true"').length - 1).toBe(3);
    const annotations = [...HTML.matchAll(/<p class="demography__annotation">([^<]*)<\/p>/g)].map((match) => match[1] ?? '');
    expect(annotations).toEqual([
      ES.t('steps.why.annotation.reference', { band: bandLabel(0) }),
      ES.t('steps.why.annotation.measured', { band: bandLabel(45) }),
      ES.t('steps.why.annotation.projected', { band: bandLabel(0) }),
    ]);
    // The marked bar group is the annotated band's, in that panel.
    expect(panelAt(1)).toContain(`<g class="demography__bar-group demography__bar-group--measured" data-annotated="true"><rect class="demography__bar" x="61.69999999999999" y="164"`);
  });

  /** Kills the readout survivors at L190, L191, L194 and L195. */
  it('reads out both shares for every published year', () => {
    const pairs = [...HTML.matchAll(/<dt>([^<]*)<\/dt><dd>([^<]*)<\/dd>/g)].map((match) => `${match[1]} = ${match[2]}`);
    const expected = VALUE.years.flatMap((year) => [
      `${ES.t('demography.readout.over65')} · ${year.year} = ${formatValue(year.readout.over65, 'percentPoints', 'es', '')}`,
      `${ES.t('demography.readout.under20')} · ${year.year} = ${formatValue(year.readout.under20, 'percentPoints', 'es', '')}`,
    ]);
    expect(pairs).toEqual(expected);
  });

  /** Kills the finding-sentence survivors at L204, L206, L207 and L208. */
  it('states the finding sentence for the first and last published year', () => {
    const first = VALUE.years[0] as PyramidValue['years'][number];
    const last = VALUE.years[VALUE.years.length - 1] as PyramidValue['years'][number];
    const sentence = ES.t('demography.finding', {
      first: first.year,
      last: last.year,
      over65First: formatValue(first.readout.over65, 'percentPoints', 'es', ''),
      over65Last: formatValue(last.readout.over65, 'percentPoints', 'es', ''),
      under20First: formatValue(first.readout.under20, 'percentPoints', 'es', ''),
      under20Last: formatValue(last.readout.under20, 'percentPoints', 'es', ''),
    });
    expect(HTML).toContain(`<p class="demography__finding">${sentence}</p>`);
  });

  /** Kills the table-caption survivors at L241, L242, L245, L246, L250 and L251. */
  it('captions the table with its years, its publishers, its series and its totals', () => {
    const caption = ES.t('demography.table.caption', {
      heading: ES.t('demography.heading'),
      years: VALUE.years.map((year) => year.year).join(', '),
      source: 'Eurostat',
      series: ES.t('series.pyramid.title'),
      variant: ES.t('demography.variant'),
      totals: VALUE.years
        .map((year) => `${year.year}: ${formatValue(year.population, 'integer', 'es', '')}`)
        .join(' · '),
      scope: ES.country.name,
    });
    expect(HTML).toContain(`<caption>${caption}</caption>`);
  });

  /** Kills the column-header survivors at L219, L220 and L223, and the summary at L261. */
  it('heads one column per sex and published year, under its own summary', () => {
    const heads = [...HTML.matchAll(/<th scope="col">([^<]*)<\/th>/g)].map((match) => match[1] ?? '');
    expect(heads).toEqual([
      '',
      ...VALUE.years.flatMap((year) => [`${ES.t('demography.sex.male')} ${year.year}`, `${ES.t('demography.sex.female')} ${year.year}`]),
    ]);
    expect(HTML).toContain(`<summary>${ES.t('demography.table.summary', { count: AGE_BANDS.length })}</summary>`);
  });

  /** Kills the L242 survivor: the caption separates two publishers with a comma. */
  it('names both publishers of a two-source pyramid, separated by a comma', () => {
    const series = pyramidSeries();
    const twoSources = { ...series, manifest: { ...series.manifest, sourceUrl: [INE, EUROSTAT] } };
    const html = decodeText(renderComponent(PyramidPlate, { content: ES, series: twoSources }));
    expect(html).toContain(`${publisherForUrl(INE)}, ${publisherForUrl(EUROSTAT)}`);
  });
});

describe('PlateBody: the chart frame names its figure and keeps its reference', () => {
  function pageWith(figure: ReturnType<typeof coverFigure>): string {
    return renderComponent(PublicPage, {
      content: ES,
      figures: [figure],
      citations: citationRegistry,
      freshnessWindowDays: 45,
      stale: false,
      series: [],
      now: new Date(NOW),
    });
  }

  /** Kills the L10 survivor: the chart is labelled by its own figure's title. */
  it('labels every chart with the plate title it belongs to', () => {
    const html = pageWith(coverFigure());
    expect(html).toContain('aria-labelledby="fig-07-title"');
    // Both chart variants carry the frame's own label: an empty one is a nameless chart.
    expect(html).not.toContain('aria-labelledby=""');
  });

  /** Kills the L23 survivor: a plotted reference is drawn, not silently dropped. */
  it('draws the reference line when the view publishes one', () => {
    expect(pageWith(coverFigure())).toContain('class="chart__ref"');
    expect(pageWith(shareFigure())).not.toContain('class="chart__ref"');
  });
});

describe('BreakageStep: both numbers come from their own source', () => {
  /** Documents the shape the two surviving literal mutants live in (see 30-report §equivalent). */
  it('states the threshold per hundred from the countdown parameter and the ratio base', () => {
    const html = renderComponent(BreakageStep, { step: stepNamed('breakage'), content: ES });
    expect(html).toContain(`<p class="step__statement">${ES.t('steps.breakage.sentence', { threshold: '50', base: '100' })}</p>`);
  });
});
