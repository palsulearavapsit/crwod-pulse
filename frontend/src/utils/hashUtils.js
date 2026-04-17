/**
 * hashUtils.js — Browser-native password hashing.
 * Uses Web Crypto API (SHA-256) — no external dependencies.
 */

const SALT = 'crowdpulse-v1-salt';

/**
 * Hashes a password with SHA-256 + a static salt.
 * Returns a hex string.
 */
export async function hashPassword(password) {
  const data = new TextEncoder().encode(password + SALT);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Compares a plain-text password against a stored hash.
 */
export async function verifyPassword(password, storedHash) {
  const hash = await hashPassword(password);
  return hash === storedHash;
}
