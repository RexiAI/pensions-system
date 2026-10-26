import { timingSafeEqual } from 'node:crypto';

/**
 * Constant-time string comparison for token-like values. A length mismatch is a mismatch,
 * not a throw: both operands are fixed-shape tokens, so the length itself is not a secret.
 * One implementation so every signature/CSRF check compares the same way.
 */
export function timingSafeStringEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
