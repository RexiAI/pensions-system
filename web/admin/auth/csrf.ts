import { timingSafeStringEqual } from './constant-time';
import type { SessionPayload } from './session';

export const CSRF_HEADER = 'x-csrf-token';

/**
 * Synchronizer token (open question 17): one per session, required as a header on every
 * state-changing request. A missing or mismatched token is a rejection, never a warning.
 */
export function verifyCsrf(headerValue: string | undefined, session: SessionPayload): boolean {
  if (typeof headerValue !== 'string') return false;
  return timingSafeStringEqual(headerValue, session.csrf);
}

export const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'] as const;

export function isStateChanging(method: string): boolean {
  return (STATE_CHANGING_METHODS as readonly string[]).includes(method.toUpperCase());
}
