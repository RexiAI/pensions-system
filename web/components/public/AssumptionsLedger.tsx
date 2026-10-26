import type { LocaleKey } from '../../content/keys';
import { formatValue } from '../../content/format';
import type { CountryLocaleContent } from '../../content/types';
import { COHORT_ASSUMPTIONS } from '../../metrics/cohort-irr';
import { DISCOUNT_RATES } from '../../metrics/implicit-debt';
import { ASSUMED_INFLATION, ASSUMED_REAL_WAGE_GROWTH, PROJECTION_HORIZON } from '../../ingest/figures';

interface LedgerRow {
  label: LocaleKey;
  consequence: LocaleKey;
  value: string;
}

interface LedgerCluster {
  label: LocaleKey;
  rows: LedgerRow[];
}

function Ledger({ cluster, content }: { cluster: LedgerCluster; content: CountryLocaleContent }) {
  return (
    <div>
      <h3>{content.t(cluster.label)}</h3>
      <dl>
        {cluster.rows.map((row) => (
          <div key={row.label}>
            <dt>{content.t(row.label)}</dt>
            <dd>{row.value}</dd>
            <dd>{content.t(row.consequence)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export interface AssumptionsLedgerProps {
  content: CountryLocaleContent;
  freshnessWindowDays: number;
  lifeExpectancy: number | null;
}

/** Every assumption behind T3 to T7, with its consequence, never in an appendix. */
export function AssumptionsLedger({ content, freshnessWindowDays, lifeExpectancy }: AssumptionsLedgerProps) {
  const number = (value: number) => formatValue(value, 'decimal', content.locale, content.t('table.notDefined'));
  const percent = (value: number) => formatValue(value, 'percent', content.locale, content.t('table.notDefined'));
  const notDefined = content.t('table.notDefined');
  const clusters: LedgerCluster[] = [
    {
      label: 'assumptions.cluster.cohort',
      rows: [
        { label: 'assumptions.entryAge.label', consequence: 'assumptions.entryAge.consequence', value: number(COHORT_ASSUMPTIONS.entryAge) },
        { label: 'assumptions.retirementAge.label', consequence: 'assumptions.retirementAge.consequence', value: number(COHORT_ASSUMPTIONS.retirementAge) },
        { label: 'assumptions.pagas.label', consequence: 'assumptions.pagas.consequence', value: number(COHORT_ASSUMPTIONS.pensionPayments) },
        { label: 'assumptions.lifeExpectancy.label', consequence: 'assumptions.lifeExpectancy.consequence', value: lifeExpectancy === null ? notDefined : number(lifeExpectancy) },
      ],
    },
    {
      label: 'assumptions.cluster.rates',
      rows: [
        { label: 'assumptions.inflation.label', consequence: 'assumptions.inflation.consequence', value: percent(ASSUMED_INFLATION) },
        { label: 'assumptions.gWage.label', consequence: 'assumptions.gWage.consequence', value: percent(ASSUMED_REAL_WAGE_GROWTH) },
        { label: 'assumptions.discountRates.label', consequence: 'assumptions.discountRates.consequence', value: DISCOUNT_RATES.map((rate) => percent(rate)).join(' · ') },
      ],
    },
    {
      label: 'assumptions.cluster.data',
      rows: [
        { label: 'assumptions.horizon.label', consequence: 'assumptions.horizon.consequence', value: `${PROJECTION_HORIZON.from} - ${PROJECTION_HORIZON.to}` },
        { label: 'assumptions.freshness.label', consequence: 'assumptions.freshness.consequence', value: number(freshnessWindowDays) },
      ],
    },
  ];
  return (
    <section className="assumptions" id="supuestos" aria-labelledby="assumptions-heading">
      <h2 id="assumptions-heading">{content.t('assumptions.heading')}</h2>
      <div className="assumptions__clusters">
        {clusters.map((cluster) => (
          <Ledger key={cluster.label} cluster={cluster} content={content} />
        ))}
      </div>
    </section>
  );
}
