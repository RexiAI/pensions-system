import { createHmac, randomBytes } from 'node:crypto';
import { timingSafeStringEqual } from './constant-time';

/** Signed HMAC session cookie (T12). Absolute TTL, no sliding renewal in v1. */
export const SESSION_COOKIE_NAME = 'ps_admin_session';
export const SESSION_TTL_SECONDS = 1800;

export interface SessionPayload {
  sid: string;
  csrf: string;
  issuedAt: number;
  expiresAt: number;
}

export type SessionFailure = 'malformed' | 'signature' | 'expired';

export type SessionResult =
  | { ok: true; session: SessionPayload }
  | { ok: false; reason: SessionFailure };

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function secondsOf(instant: Date): number {
  return Math.floor(instant.getTime() / 1000);
}

export function createSession(params: {
  secret: string;
  now: Date;
  sessionId?: string;
  csrfToken?: string;
}): { token: string; session: SessionPayload } {
  const issuedAt = secondsOf(params.now);
  const session: SessionPayload = {
    sid: params.sessionId ?? randomBytes(16).toString('base64url'),
    csrf: params.csrfToken ?? randomBytes(32).toString('base64url'),
    issuedAt,
    expiresAt: issuedAt + SESSION_TTL_SECONDS,
  };
  const payload = Buffer.from(JSON.stringify(session), 'utf8').toString('base64url');
  return { token: `${payload}.${sign(payload, params.secret)}`, session };
}

function parsePayload(payload: string): SessionPayload | null {
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<SessionPayload>;
    if (
      typeof decoded.sid !== 'string' ||
      typeof decoded.csrf !== 'string' ||
      typeof decoded.issuedAt !== 'number' ||
      typeof decoded.expiresAt !== 'number'
    ) {
      return null;
    }
    return decoded as SessionPayload;
  } catch {
    return null;
  }
}

/** Signature first, then expiry: a tampered token never reaches the expiry branch. */
interface SplitSession {
  payload: string;
  signature: string;
}

function splitSession(token: string | undefined): SplitSession | null {
  if (!token) return null;
  const separator = token.lastIndexOf('.');
  if (separator <= 0 || separator === token.length - 1) return null;
  return { payload: token.slice(0, separator), signature: token.slice(separator + 1) };
}

/** Signature first, then expiry: a tampered token never reaches the expiry branch. */
export function verifySession(token: string | undefined, secret: string, now: Date): SessionResult {
  const parts = splitSession(token);
  if (!parts) return { ok: false, reason: 'malformed' };
  if (!timingSafeStringEqual(parts.signature, sign(parts.payload, secret))) return { ok: false, reason: 'signature' };
  const session = parsePayload(parts.payload);
  if (!session) return { ok: false, reason: 'malformed' };
  if (session.expiresAt <= secondsOf(now)) return { ok: false, reason: 'expired' };
  return { ok: true, session };
}

export function serializeSessionCookie(token: string): string {
  return [
    `${SESSION_COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ].join('; ');
}

export function clearSessionCookie(): string {
  return [`${SESSION_COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'Secure', 'SameSite=Strict', 'Max-Age=0'].join('; ');
}

/** Extracts the session cookie value from a raw `Cookie` header. */
export function sessionTokenFromCookieHeader(header: string | undefined): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === SESSION_COOKIE_NAME) return rest.join('=');
  }
  return undefined;
}
