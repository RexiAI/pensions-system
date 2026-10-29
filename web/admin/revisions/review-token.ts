import { createHmac } from 'node:crypto';
import { timingSafeStringEqual } from '../auth/constant-time';

/**
 * The review token (T14): minted server-side when the review route renders, bound to one
 * revision id, and required in addition to the session and the CSRF token. That makes
 * "the operator saw the diff" a property of the system rather than a hope, and it means
 * no URL alone can publish.
 */
export const REVIEW_TOKEN_TTL_SECONDS = 900;

export type ReviewTokenFailure = 'malformed' | 'signature' | 'expired' | 'wrong-revision';

export type ReviewTokenResult = { ok: true } | { ok: false; reason: ReviewTokenFailure };

interface TokenPayload {
  rev: string;
  iat: number;
}

interface SplitToken {
  payload: string;
  signature: string;
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(`review:${payload}`).digest('base64url');
}

export function mintReviewToken(params: { secret: string; revisionId: string; now: Date }): string {
  const payload = Buffer.from(
    JSON.stringify({ rev: params.revisionId, iat: Math.floor(params.now.getTime() / 1000) } satisfies TokenPayload),
    'utf8',
  ).toString('base64url');
  return `${payload}.${sign(payload, params.secret)}`;
}

function splitToken(token: string | undefined): SplitToken | null {
  if (!token) return null;
  const separator = token.lastIndexOf('.');
  if (separator <= 0 || separator === token.length - 1) return null;
  return { payload: token.slice(0, separator), signature: token.slice(separator + 1) };
}

function readPayload(payload: string): TokenPayload | null {
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<TokenPayload>;
    if (typeof decoded.rev !== 'string' || typeof decoded.iat !== 'number') return null;
    return decoded as TokenPayload;
  } catch {
    return null;
  }
}

function isExpired(issuedAt: number, now: Date): boolean {
  const age = Math.floor(now.getTime() / 1000) - issuedAt;
  return age > REVIEW_TOKEN_TTL_SECONDS || age < 0;
}

export function verifyReviewToken(params: {
  token: string | undefined;
  revisionId: string;
  secret: string;
  now: Date;
}): ReviewTokenResult {
  const parts = splitToken(params.token);
  if (!parts) return { ok: false, reason: 'malformed' };
  if (!timingSafeStringEqual(parts.signature, sign(parts.payload, params.secret))) {
    return { ok: false, reason: 'signature' };
  }
  const decoded = readPayload(parts.payload);
  if (!decoded) return { ok: false, reason: 'malformed' };
  if (decoded.rev !== params.revisionId) return { ok: false, reason: 'wrong-revision' };
  if (isExpired(decoded.iat, params.now)) return { ok: false, reason: 'expired' };
  return { ok: true };
}
