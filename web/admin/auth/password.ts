import { randomBytes } from 'node:crypto';
import { hash, verify, type Algorithm } from '@node-rs/argon2';

/** Argon2id = 2 in the binding's enum; referenced numerically because it is a const enum. */
const ARGON2ID = 2 as Algorithm;

/**
 * argon2id with the parameters the task fixes (10-tasks.md open question 11): m = 64 MiB,
 * t = 3, p = 1, 16-byte salt, 32-byte hash. The parameters travel inside the PHC string,
 * so they can be raised later without invalidating stored hashes.
 */
export const ARGON2_PARAMETERS = {
  algorithm: ARGON2ID,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 1,
  outputLen: 32,
} as const;

export const SALT_BYTES = 16;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, { ...ARGON2_PARAMETERS, salt: randomBytes(SALT_BYTES) });
}

/**
 * Constant-time verification is argon2's own compare. Any parse or parameter failure is a
 * `false`, never a throw and never an early-exit string comparison.
 */
export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}
