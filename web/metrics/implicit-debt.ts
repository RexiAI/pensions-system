/**
 * Metric 4 (T6): present value of accrued obligations minus system assets, always over
 * the four discount rates the task fixes. There is deliberately no single-value export:
 * the rate is an assumption, and one headline number would hide it.
 */
export const DISCOUNT_RATES = [0.01, 0.02, 0.03, 0.04] as const;

export type DiscountRate = (typeof DISCOUNT_RATES)[number];

export interface ImplicitDebtValue {
  readonly rates: readonly number[];
  readonly byRate: Readonly<Record<string, number>>;
  readonly presentValues: Readonly<Record<string, number>>;
  readonly assets: number;
}

/** `PV = sum obligation_t / (1 + r)^t` with the first obligation at t = 1. */
export function presentValue(obligations: readonly number[], rate: number): number {
  return obligations.reduce((sum, obligation, index) => sum + obligation / (1 + rate) ** (index + 1), 0);
}

/** Assets are a point-in-time balance, not a stream: they are subtracted undiscounted. */
export function implicitDebt(obligations: readonly number[], assets: number): ImplicitDebtValue {
  const byRate: Record<string, number> = {};
  const presentValues: Record<string, number> = {};
  for (const rate of DISCOUNT_RATES) {
    const pv = presentValue(obligations, rate);
    presentValues[String(rate)] = pv;
    byRate[String(rate)] = pv - assets;
  }
  return { rates: DISCOUNT_RATES, byRate, presentValues, assets };
}
