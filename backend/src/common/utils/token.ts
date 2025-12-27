import { randomBytes } from 'crypto';

/**
 * Secure token for authentication, invites, password reset, etc.
 */
export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}

/**
 * Lightweight non-secure token (UI, temp IDs, client-only usage).
 * DO NOT use for auth or invites.
 */
export function generateRandomToken(length = 16): string {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join('');
}
