/**
 * hashUtils.test.js — Tests for SHA-256 password hashing utility.
 */
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../utils/hashUtils';

describe('hashPassword', () => {
  it('returns a 64-character hex string (SHA-256 output)', async () => {
    const hash = await hashPassword('testPass');
    expect(typeof hash).toBe('string');
    expect(hash).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
  });

  it('is deterministic — same input always returns same hash', async () => {
    const h1 = await hashPassword('hello');
    const h2 = await hashPassword('hello');
    expect(h1).toBe(h2);
  });

  it('produces different hashes for different passwords', async () => {
    const h1 = await hashPassword('password1');
    const h2 = await hashPassword('password2');
    expect(h1).not.toBe(h2);
  });

  it('handles empty password', async () => {
    const hash = await hashPassword('');
    expect(hash).toHaveLength(64);
  });

  it('is case-sensitive', async () => {
    const h1 = await hashPassword('Admin');
    const h2 = await hashPassword('admin');
    expect(h1).not.toBe(h2);
  });

  it('handles special characters', async () => {
    const hash = await hashPassword('p@$$w0rd!#%^');
    expect(hash).toHaveLength(64);
  });
});

describe('verifyPassword', () => {
  it('returns true when password matches stored hash', async () => {
    const hash   = await hashPassword('mypassword');
    const result = await verifyPassword('mypassword', hash);
    expect(result).toBe(true);
  });

  it('returns false when password does not match', async () => {
    const hash   = await hashPassword('mypassword');
    const result = await verifyPassword('wrongpassword', hash);
    expect(result).toBe(false);
  });

  it('returns false for tampered hash', async () => {
    const hash    = await hashPassword('secure');
    const tampered = hash.slice(0, -4) + 'aaaa';
    const result  = await verifyPassword('secure', tampered);
    expect(result).toBe(false);
  });
});
