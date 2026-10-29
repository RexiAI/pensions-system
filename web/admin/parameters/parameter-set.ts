import { adminT } from '../../content/admin';
import { interpolate } from '../../content/types';

/**
 * The enumerated legal-parameter set (T15). Small, typed, closed: a change that targets
 * anything outside it is rejected, and there is no open string key.
 */
export const PARAMETER_IDS = [
  'pension_payment_count',
  'retirement_age',
  'contribution_base_limits',
  'revaluation_rule',
] as const;

export type ParameterId = (typeof PARAMETER_IDS)[number];

export function isParameterId(value: unknown): value is ParameterId {
  return typeof value === 'string' && (PARAMETER_IDS as readonly string[]).includes(value);
}

export type ParameterValue =
  | { kind: 'integer'; value: number }
  | { kind: 'range'; minMinor: number; maxMinor: number; currency: 'EUR' }
  | { kind: 'choice'; choice: string };

export interface ParameterSnapshot {
  id: ParameterId;
  value: ParameterValue;
}

/**
 * The only handle the proposal path has: it can set an enumerated parameter and nothing
 * else. There is no derived-figure method here, so a proposal is structurally incapable
 * of writing a computed figure.
 */
export interface ParameterWriter {
  setParameter(id: ParameterId, value: ParameterValue): void;
}

export interface ParameterReader {
  getParameter(id: ParameterId): ParameterValue | undefined;
  all(): ParameterSnapshot[];
}

export function createParameterStore(
  initial: readonly ParameterSnapshot[] = [],
): ParameterReader & ParameterWriter {
  const parameters = new Map<ParameterId, ParameterValue>(initial.map((entry) => [entry.id, entry.value]));
  return {
    getParameter: (id) => parameters.get(id),
    all: () => [...parameters.entries()].map(([id, value]) => ({ id, value })),
    setParameter: (id, value) => {
      parameters.set(id, value);
    },
  };
}

const MONEY = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function parameterName(id: ParameterId): string {
  return adminT(`admin.parameter.name.${id}`);
}

/** A parameter is rendered as a full sentence, never as a bare JSON value. */
export function describeParameter(id: ParameterId, value: ParameterValue): string {
  switch (value.kind) {
    case 'integer':
      return interpolate(adminT(`admin.parameter.${id}`), { value: value.value });
    case 'range':
      return interpolate(adminT(`admin.parameter.${id}`), {
        min: MONEY.format(value.minMinor / 100),
        max: MONEY.format(value.maxMinor / 100),
      });
    case 'choice':
    default:
      return interpolate(adminT(`admin.parameter.${id}`), { value: value.choice });
  }
}

export function sameParameterValue(a: ParameterValue | undefined, b: ParameterValue): boolean {
  if (!a) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}
