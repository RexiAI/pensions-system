/** Small null-normalising helpers, so view code has no inline `??` chains. */
export function nullable(value: number | null | undefined): number | null {
  return value ?? null;
}

export function zero(value: number | null | undefined): number {
  return value ?? 0;
}

export function fallback(value: string | undefined, replacement: string): string {
  return value ?? replacement;
}
