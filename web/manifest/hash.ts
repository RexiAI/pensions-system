import { createHash } from 'node:crypto';

/**
 * Hash of the raw input snapshot bytes — the bytes as ingested, not a re-serialisation
 * of a parsed value, so two different snapshots cannot collide through formatting.
 */
export function sha256Hex(input: Uint8Array | string): string {
  return createHash('sha256').update(input).digest('hex');
}

export const SHA256_HEX_LENGTH = 64;

export function isSha256Hex(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
}

export const ISO_UTC_SECONDS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

export function toIsoUtcSeconds(instant: Date): string {
  return instant.toISOString().replace(/\.\d{3}Z$/, 'Z');
}
