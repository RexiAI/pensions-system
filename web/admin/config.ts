import { adminT } from '../content/admin';

/**
 * Fail-closed configuration (T13). The admin surface exists only when both the password
 * hash and the session secret are configured; anything else is the closed state, never
 * an open one. Nothing here reports which key is missing (AC-001-56).
 */
export interface AdminConfig {
  passwordHash: string;
  sessionSecret: string;
  freshnessWindowDays: number;
  environment: 'production' | 'preview';
}

export type AdminEnv = Readonly<Record<string, string | undefined>>;

export type AdminConfigResult =
  | { ok: true; config: AdminConfig }
  | { ok: false; kind: 'config.unconfigured' };

export const DEFAULT_FRESHNESS_WINDOW_DAYS = 45;
const MIN_SECRET_LENGTH = 32;

function parseWindow(raw: string | undefined): number {
  if (!raw) return DEFAULT_FRESHNESS_WINDOW_DAYS;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_FRESHNESS_WINDOW_DAYS;
}

/** An argon2id PHC string is the only accepted credential shape. */
export function looksLikeArgon2idHash(value: string | undefined): boolean {
  return typeof value === 'string' && /^\$argon2id\$v=\d+\$m=\d+,t=\d+,p=\d+\$[^$]+\$[^$]+$/.test(value);
}

export function loadAdminConfig(env: AdminEnv): AdminConfigResult {
  const passwordHash = env.ADMIN_PASSWORD_HASH;
  const sessionSecret = env.ADMIN_SESSION_SECRET;
  if (!looksLikeArgon2idHash(passwordHash)) return { ok: false, kind: 'config.unconfigured' };
  if (typeof sessionSecret !== 'string' || sessionSecret.length < MIN_SECRET_LENGTH) {
    return { ok: false, kind: 'config.unconfigured' };
  }
  return {
    ok: true,
    config: {
      passwordHash: passwordHash as string,
      sessionSecret,
      freshnessWindowDays: parseWindow(env.ADMIN_FRESHNESS_WINDOW_DAYS),
      environment: env.VERCEL_ENV === 'production' ? 'production' : 'preview',
    },
  };
}

/** The fixed body of the closed state: no key name, no value, no credential hint. */
export function unconfiguredBody(): string {
  return `${adminT('admin.config.chip')}. ${adminT('admin.config.title')}. ${adminT('admin.config.body')}`;
}
