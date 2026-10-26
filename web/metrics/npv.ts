/**
 * Net present value and root finding shared by the cohort-return (T5) and
 * implicit-debt (T6) kernels. Flows are indexed from t = 0.
 */
export function npv(rate: number, cashflows: readonly number[]): number {
  return cashflows.reduce((sum, flow, t) => sum + flow / (1 + rate) ** t, 0);
}

/** Number of sign changes in the flow sequence; one change means a unique real root. */
export function countSignChanges(cashflows: readonly number[]): number {
  const signs = cashflows.filter((flow) => flow !== 0).map((flow) => Math.sign(flow));
  let changes = 0;
  for (let i = 1; i < signs.length; i += 1) {
    if (signs[i] !== signs[i - 1]) changes += 1;
  }
  return changes;
}

export interface IrrOptions {
  lower?: number;
  upper?: number;
  /** Absolute NPV tolerance at the returned rate. */
  tolerance?: number;
  maxIterations?: number;
}

interface ResolvedOptions {
  lower: number;
  upper: number;
  tolerance: number;
  maxIterations: number;
}

/**
 * IRR is invariant to scaling every flow by the same constant, so the solve runs on
 * flows normalised by their largest magnitude. That keeps the absolute tolerance
 * meaningful for amounts expressed in cents (T6) as well as in abstract units (T5).
 */
function normalise(cashflows: readonly number[]): { flows: number[]; scale: number } {
  const scale = Math.max(...cashflows.map((flow) => Math.abs(flow)));
  if (scale === 0) return { flows: [...cashflows], scale: 1 };
  return { flows: cashflows.map((flow) => flow / scale), scale };
}

function resolveOptions(options: IrrOptions): ResolvedOptions {
  return {
    lower: options.lower ?? -0.9999,
    upper: options.upper ?? 10,
    tolerance: options.tolerance ?? 1e-6,
    maxIterations: options.maxIterations ?? 300,
  };
}

interface Bracket {
  low: number;
  high: number;
  npvLow: number;
}

type Step = { done: true; rate: number } | ({ done: false } & Bracket);

function bisectStep(bracket: Bracket, cashflows: readonly number[], tolerance: number): Step {
  const mid = (bracket.low + bracket.high) / 2;
  const npvMid = npv(mid, cashflows);
  const converged = Math.abs(npvMid) <= tolerance || (bracket.high - bracket.low) / 2 <= Number.EPSILON;
  if (converged) return { done: true, rate: mid };
  if (Math.sign(npvMid) === Math.sign(bracket.npvLow)) {
    return { done: false, low: mid, high: bracket.high, npvLow: npvMid };
  }
  return { done: false, low: bracket.low, high: mid, npvLow: bracket.npvLow };
}

function initialBracket(cashflows: readonly number[], config: ResolvedOptions): Bracket | null {
  const npvLow = npv(config.lower, cashflows);
  const npvHigh = npv(config.upper, cashflows);
  if (Math.sign(npvLow) === Math.sign(npvHigh)) return null;
  return { low: config.lower, high: config.upper, npvLow };
}

/**
 * Bisection on NPV. Returns `null` when there is no root in the bracket (for example
 * all-negative flows, where no finite IRR exists), so the caller can distinguish
 * "undefined" from "-100%".
 */
export function irrBisection(cashflows: readonly number[], options: IrrOptions = {}): number | null {
  if (countSignChanges(cashflows) !== 1) return null;
  const config = resolveOptions(options);
  const { flows, scale } = normalise(cashflows);
  // The tolerance is absolute on the original flows, so on the normalised problem it is
  // divided by the scale. Floored at float epsilon so a huge scale cannot loop forever.
  const tolerance = Math.max(config.tolerance / scale, Number.EPSILON);
  let bracket = initialBracket(flows, config);
  if (!bracket) return null;
  for (let iteration = 0; iteration < config.maxIterations; iteration += 1) {
    const step = bisectStep(bracket, flows, tolerance);
    if (step.done) return step.rate;
    bracket = { low: step.low, high: step.high, npvLow: step.npvLow };
  }
  return (bracket.low + bracket.high) / 2;
}
