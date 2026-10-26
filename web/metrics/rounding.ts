/** Round half away from zero to `decimals` places, the reporting precision the tasks fix. */
export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.sign(value) * Math.round(Math.abs(value) * factor) / factor;
}

/** Fixed-decimal string for display. Never used to compute (see formatValue in content). */
export function formatFixed(value: number, decimals: number): string {
  return roundTo(value, decimals).toFixed(decimals);
}
