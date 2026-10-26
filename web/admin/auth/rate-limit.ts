/**
 * Login rate limiting (T12, open question 16): per-IP lockout after 5 failures inside a
 * 15-minute window, exponential backoff doubling from 1 second, and a global cap of 100
 * attempts per minute across all IPs. The clock is always passed in, never read here.
 */
export interface RateLimitOptions {
  perIpLimit: number;
  windowMs: number;
  globalLimit: number;
  globalWindowMs: number;
  backoffBaseMs: number;
  maxBackoffMs: number;
}

export const DEFAULT_RATE_LIMIT: RateLimitOptions = {
  perIpLimit: 5,
  windowMs: 15 * 60 * 1000,
  globalLimit: 100,
  globalWindowMs: 60 * 1000,
  backoffBaseMs: 1000,
  maxBackoffMs: 15 * 60 * 1000,
};

export type RateLimitMode = 'ip' | 'global';

export interface RateLimitDecision {
  allowed: boolean;
  mode: RateLimitMode;
  retryAfterMs: number;
  failures: number;
}

function prune(timestamps: readonly number[], now: number, windowMs: number): number[] {
  return timestamps.filter((timestamp) => now - timestamp < windowMs);
}

export class LoginRateLimiter {
  private readonly failures = new Map<string, number[]>();
  private globalAttempts: number[] = [];

  constructor(private readonly options: RateLimitOptions = DEFAULT_RATE_LIMIT) {}

  failuresFor(ip: string, now: number): number {
    const recent = prune(this.failures.get(ip) ?? [], now, this.options.windowMs);
    this.failures.set(ip, recent);
    return recent.length;
  }

  /** Exponential backoff for the Nth failure past the limit: 1s, 2s, 4s, ... capped. */
  backoffFor(failures: number): number {
    const over = Math.max(0, failures - this.options.perIpLimit);
    return Math.min(this.options.maxBackoffMs, this.options.backoffBaseMs * 2 ** over);
  }

  check(ip: string, now: number): RateLimitDecision {
    this.globalAttempts = prune(this.globalAttempts, now, this.options.globalWindowMs);
    if (this.globalAttempts.length >= this.options.globalLimit) {
      const oldest = this.globalAttempts[0] ?? now;
      return {
        allowed: false,
        mode: 'global',
        retryAfterMs: Math.max(0, this.options.globalWindowMs - (now - oldest)),
        failures: this.failuresFor(ip, now),
      };
    }
    const failures = this.failuresFor(ip, now);
    if (failures >= this.options.perIpLimit) {
      const oldest = this.failures.get(ip)?.[0] ?? now;
      const windowRemaining = Math.max(0, this.options.windowMs - (now - oldest));
      return {
        allowed: false,
        mode: 'ip',
        retryAfterMs: Math.max(windowRemaining, this.backoffFor(failures)),
        failures,
      };
    }
    return { allowed: true, mode: 'ip', retryAfterMs: 0, failures };
  }

  /** Counts one attempt (failed authentication), so the global cap sees every try. */
  recordFailure(ip: string, now: number): RateLimitDecision {
    this.globalAttempts = [...prune(this.globalAttempts, now, this.options.globalWindowMs), now];
    const recent = prune(this.failures.get(ip) ?? [], now, this.options.windowMs);
    this.failures.set(ip, [...recent, now]);
    return this.check(ip, now);
  }
}
