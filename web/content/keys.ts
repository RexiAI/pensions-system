import type { PageKind } from './types';

/**
 * Every user-facing string on the public surface resolves through one of these keys.
 * The list is the contract: a locale document missing any key is incomplete and is
 * rejected by `validateDocument` (never rendered with a silent fallback).
 */
export const REQUIRED_KEYS = [
  'site.wordmark',
  'site.skipLink',
  // Spec 007: the header nav becomes four page links; Historia is the one name without a key.
  'nav.historia',
  'nav.figures',
  'nav.method',
  'nav.debate',
  'nav.reading',
  'nav.index',
  'nav.localeLabel',
  'locale.es',
  'locale.en',
  'locale.fr',
  'locale.de',
  'locale.it',
  'locale.group',
  'theme.label',
  'theme.system',
  'theme.light',
  'theme.dark',
  'hero.statement',
  'hero.sub',
  // Spec 007 T8: the mechanism kicker above the h1, verbatim from the operator's copy.
  'kicker.mechanism',
  'hero.ctaPrimary',
  'hero.ctaSecondary',
  'hero.comparisonFirst',
  'hero.comparisonSecond',
  'hero.comparisonLatest',
  'hero.snapshotLabel',
  'hero.panelFooter',
  // Spec 004: the five-step story. One label per step (the step's own `<h2>`) and one
  // sentence where the step has one; the wording is content, never a literal in a component.
  'steps.number.label',
  'steps.number.sentence',
  'steps.breakage.label',
  'steps.breakage.sentence',
  'steps.why.label',
  'steps.why.annotation.reference',
  'steps.why.annotation.measured',
  'steps.why.annotation.projected',
  'steps.distance.label',
  'steps.distance.sentence',
  'steps.meaning.label',
  'steps.meaning.sentence',
  'sources.calcLink',
  'register.key.heading',
  'register.instrument.label',
  'register.instrument.sample',
  'register.consensus.label',
  'register.consensus.sample',
  'register.dispute.label',
  'register.dispute.sample',
  'register.thesis.label',
  'register.thesis.sample',
  'fig.label',
  'fig.readoutLabel',
  'fig.tableSummary',
  'fig.tableCaption',
  'fig.limitLabel',
  'fig.sourceCount',
  'fig.01.title',
  'fig.01.caption',
  'fig.01.unit',
  'fig.01.limit',
  'fig.02.title',
  'fig.02.caption',
  'fig.02.unit',
  'fig.02.limit',
  'fig.03.title',
  'fig.03.caption',
  'fig.03.unit',
  'fig.03.limit',
  'fig.04.title',
  'fig.04.caption',
  'fig.04.unit',
  'fig.04.limit',
  'fig.05.title',
  'fig.05.caption',
  'fig.05.unit',
  'fig.05.limit',
  'fig.06.title',
  'fig.06.caption',
  'fig.06.unit',
  'fig.06.limit',
  'fig.07.title',
  'fig.07.caption',
  'fig.07.unit',
  'fig.07.limit',
  'fig.01.definition',
  'fig.02.definition',
  'fig.03.definition',
  'fig.04.definition',
  'fig.05.definition',
  'fig.06.definition',
  'fig.07.definition',
  'fig.03.reason',
  'fig.04.reason',
  'fig.05.reason',
  'fig.06.reason',
  'fig.07.reason',
  'fig.definitionLabel',
  'readout.latest',
  'readout.mean10',
  'readout.first',
  'readout.gap',
  'readout.yearsBelow',
  'readout.min',
  'readout.central',
  'readout.max',
  'readout.rate',
  'readout.pv',
  'readout.assets',
  'readout.implicitDebt',
  'readout.gRequired',
  'readout.gProj',
  'readout.difference',
  'readout.surplus',
  'table.month',
  'table.year',
  'table.pensioners',
  'table.affiliates',
  'table.ratio',
  'table.contributions',
  'table.expenditure',
  'table.cover',
  'table.gap',
  'table.cohort',
  'table.contribution',
  'table.pension',
  'table.lifeExpectancy',
  'table.yearsContributing',
  'table.yearsDrawing',
  'table.min',
  'table.central',
  'table.max',
  'table.rate',
  'table.pv',
  'table.assets',
  'table.implicitDebt',
  'table.gWage',
  'table.gRequired',
  'table.gProj',
  'table.notDefined',
  'provenance.source',
  'plate.null.dependencyRatio',
  'plate.null.contributionCover',
  'plate.null.cohortIrr',
  'plate.null.implicitDebt',
  'plate.null.requiredBaseGrowth',
  'banner.stale',
  'agreement.label',
  'dispute.label',
  'thesis.label',
  'citation.document',
  'citation.reference',
  'citation.date',
  'thesis.disclaimer',
  'thesis.figuresLabel',
  'reproduce.heading',
  'reproduce.body',
  'revisions.heading',
  'revisions.empty',
  'assumptions.heading',
  'assumptions.cluster.cohort',
  'assumptions.cluster.rates',
  'assumptions.cluster.data',
  'assumptions.entryAge.label',
  'assumptions.entryAge.consequence',
  'assumptions.retirementAge.label',
  'assumptions.retirementAge.consequence',
  'assumptions.pagas.label',
  'assumptions.pagas.consequence',
  'assumptions.lifeExpectancy.label',
  'assumptions.lifeExpectancy.consequence',
  'assumptions.inflation.label',
  'assumptions.inflation.consequence',
  'assumptions.gWage.label',
  'assumptions.gWage.consequence',
  'assumptions.discountRates.label',
  'assumptions.discountRates.consequence',
  'assumptions.horizon.label',
  'assumptions.horizon.consequence',
  'assumptions.freshness.label',
  'assumptions.freshness.consequence',
  'footer.doesNotClaimHeading',
  'footer.noTracking',
  'footer.contact',
  'footer.canonical',
  'footer.snapshot',
  'footer.sourcesHeading',
  'footer.licence',
  'error.notFound.title',
  'error.notFound.body',
  'error.locale.title',
  'error.locale.body',
  'error.home',
  'figure.unavailable.chip',
  'figure.unavailable.reason',
  'figure.withheld.chip',
  'figure.withheld.reason',
  'figure.null.reason',
  'figure.ledgerNote',
  'figure.methodLink',
  'provenance.dataset',
  'provenance.observedAt',
  'provenance.original',
  'provenance.sourcesCount',
  'provenance.disclosure.formula',
  'provenance.disclosure.source',
  'provenance.disclosure.series',
  'provenance.disclosure.observedAt',
  'provenance.disclosure.hash',
  'provenance.disclosure.reproduce',
  'provenance.disclosure.freshness',
  'provenance.digestMeaning',
  'provenance.copy',
  'provenance.copied',
  'hero.ctaMethod',
  'hero.definitionLabel',
  'hero.periodLabel',
  'table.beneficiaries',
  'table.employed',
  'table.share',
  // Revision 2: the countdown, the age structure, the scope mark and the truthful reproduce
  // section. Every public string on those surfaces resolves through one of these keys.
  'countdown.eyebrow',
  'countdown.unit',
  'countdown.yearLabel',
  'countdown.definition',
  'countdown.range',
  'countdown.source',
  'countdown.notCrossed',
  'countdown.backCast',
  // Revision 3: the anchored clock. Seven copy slots, ten keys.
  'countdown.clock.anchor',
  'countdown.clock.anchorLabel',
  'countdown.clock.definition',
  'countdown.clock.arithmetic',
  'countdown.clock.a11y',
  'countdown.clock.elapsed',
  'countdown.clock.days',
  'countdown.clock.hours',
  'countdown.clock.minutes',
  'countdown.clock.seconds',
  'demography.heading',
  'demography.finding',
  'demography.readout.over65',
  'demography.readout.under20',
  'demography.year.observed',
  'demography.year.projected',
  'demography.variant',
  'demography.table.summary',
  'demography.table.caption',
  'demography.axis.percent',
  'demography.sex.male',
  'demography.sex.female',
  'provenance.scope',
  'series.pyramid.title',
  'series.countdown.title',
  'reproduce.count.figures',
  'reproduce.count.figure',
  'reproduce.count.series',
  'reproduce.count.serie',
  'reproduce.omitted',
  'series.fuse.title',
  'fuse.label',
  'fuse.definition',
  'fuse.reproduce',
  'share.label',
  'share.text',
  'share.textNoJs',
  'share.native',
  'share.whatsapp',
  'share.telegram',
  'share.x',
  'share.linkedin',
  'share.copy',
  'share.copied',
  'share.linkLabel',
  'share.newWindow',
  'meta.title',
  // Spec 007 T8/T9: one leading string per sub-page title; the scope suffix is appended by
  // `pageMetadata`, so the shape stays `page-name · {year} · wordmark · country`.
  'meta.cifras.title',
  'meta.metodo.title',
  'meta.debate.title',
  'pager.label',
  'pager.previous',
  'pager.next',
  'meta.description',
  'card.eyebrow',
  'card.sentence',
] as const;

export type LocaleKey = (typeof REQUIRED_KEYS)[number];

export const LOCALE_KEY_SET: ReadonlySet<string> = new Set(REQUIRED_KEYS);

export function missingKeys(strings: Readonly<Record<string, string>>): string[] {
  return REQUIRED_KEYS.filter((key) => {
    const value = strings[key];
    return typeof value !== 'string' || value.trim() === '';
  });
}

export function unknownKeys(strings: Readonly<Record<string, string>>): string[] {
  return Object.keys(strings).filter((key) => !LOCALE_KEY_SET.has(key));
}

export const FIGURE_NUMBERS = [1, 2, 3, 4, 5, 6, 7] as const;

export type FigureNumber = (typeof FIGURE_NUMBERS)[number];

export interface FigureKeys {
  title: LocaleKey;
  caption: LocaleKey;
  unit: LocaleKey;
  limit: LocaleKey;
  /** The published translation of the figure's definition (T1, AC-001-77). */
  definition: LocaleKey;
}

/** Figure copy keys, written out so a missing figure key is a compile error. */
export const FIGURE_KEYS: Readonly<Record<FigureNumber, FigureKeys>> = {
  1: {
    title: 'fig.01.title',
    caption: 'fig.01.caption',
    unit: 'fig.01.unit',
    limit: 'fig.01.limit',
    definition: 'fig.01.definition',
  },
  2: {
    title: 'fig.02.title',
    caption: 'fig.02.caption',
    unit: 'fig.02.unit',
    limit: 'fig.02.limit',
    definition: 'fig.02.definition',
  },
  3: {
    title: 'fig.03.title',
    caption: 'fig.03.caption',
    unit: 'fig.03.unit',
    limit: 'fig.03.limit',
    definition: 'fig.03.definition',
  },
  4: {
    title: 'fig.04.title',
    caption: 'fig.04.caption',
    unit: 'fig.04.unit',
    limit: 'fig.04.limit',
    definition: 'fig.04.definition',
  },
  5: {
    title: 'fig.05.title',
    caption: 'fig.05.caption',
    unit: 'fig.05.unit',
    limit: 'fig.05.limit',
    definition: 'fig.05.definition',
  },
  6: {
    title: 'fig.06.title',
    caption: 'fig.06.caption',
    unit: 'fig.06.unit',
    limit: 'fig.06.limit',
    definition: 'fig.06.definition',
  },
  7: {
    title: 'fig.07.title',
    caption: 'fig.07.caption',
    unit: 'fig.07.unit',
    limit: 'fig.07.limit',
    definition: 'fig.07.definition',
  },
};

/**
 * The specific reason a figure has no value in this deployment. A figure with a computed
 * path has no specific reason key: it falls back to the generic `unavailable` sentence,
 * which is only reachable if its inputs disappear.
 */
const FIGURE_REASON_KEYS: Partial<Record<FigureNumber, LocaleKey>> = {
  3: 'fig.03.reason',
  4: 'fig.04.reason',
  5: 'fig.05.reason',
  6: 'fig.06.reason',
  7: 'fig.07.reason',
};

export function figureReasonKey(number: FigureNumber): LocaleKey {
  return FIGURE_REASON_KEYS[number] ?? 'figure.unavailable.reason';
}

/**
 * The figure key set for a figure id, by lookup. R6's watch item: deriving a key from the id
 * string (`Number(id.slice(-1))`) works only while every id is `fig-0N`, and the moment a
 * non-numbered artefact enters the section it silently picks the wrong label.
 */
export const FIGURE_ID_KEYS: Readonly<Record<string, FigureKeys>> = {
  'fig-01': FIGURE_KEYS[1],
  'fig-02': FIGURE_KEYS[2],
  'fig-03': FIGURE_KEYS[3],
  'fig-04': FIGURE_KEYS[4],
  'fig-05': FIGURE_KEYS[5],
  'fig-06': FIGURE_KEYS[6],
  'fig-07': FIGURE_KEYS[7],
};

/** The derived series' public titles, by lookup, for the same reason. */
export const SERIES_TITLE_KEYS: Readonly<Record<string, LocaleKey>> = {
  pyramid: 'series.pyramid.title',
  countdown: 'series.countdown.title',
  fuse: 'series.fuse.title',
};

/**
 * The four page names, in reading order. The header nav, the pager and each sub-page's `<h1>`
 * all read this one map, so a page cannot be called two things on two surfaces.
 */
export const PAGE_NAME_KEYS: Readonly<Record<PageKind, LocaleKey>> = {
  historia: 'nav.historia',
  cifras: 'nav.figures',
  metodo: 'nav.method',
  debate: 'nav.debate',
};

/**
 * The leading string of each page's `<title>`. Historia keeps the existing `meta.title` (the
 * promise framing); the three sub-pages take their own page-name-plus-year template.
 */
export const PAGE_TITLE_KEYS: Readonly<Record<PageKind, LocaleKey>> = {
  historia: 'meta.title',
  cifras: 'meta.cifras.title',
  metodo: 'meta.metodo.title',
  debate: 'meta.debate.title',
};
