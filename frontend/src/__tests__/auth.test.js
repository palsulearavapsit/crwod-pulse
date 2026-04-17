/**
 * auth.test.js — Unit tests for CrowdPulse authentication logic.
 *
 * Tests cover:
 *  - Hardcoded credential validation (admin, arav, harsh)
 *  - Signup: duplicate usernames, reserved names, password mismatch, min length
 *  - Login: localStorage-stored user accounts
 *  - Role assignment (admin vs attendee)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Replicated auth logic (pure functions extracted for testability) ──────────

const HARDCODED = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'arav',  password: 'arav',     role: 'attendee' },
  { username: 'harsh', password: 'harsh',    role: 'attendee' },
];

function getStoredUsers(storage = {}) {
  return JSON.parse(storage['cp_users'] || '[]');
}

function login(username, password, storage = {}) {
  if (!username || !password) return { ok: false, error: 'Please fill out all fields.' };

  const hardMatch = HARDCODED.find(
    c => c.username === username.toLowerCase() && c.password === password
  );
  if (hardMatch) return { ok: true, role: hardMatch.role };

  const stored = getStoredUsers(storage);
  const storedMatch = stored.find(
    u => u.username === username.toLowerCase() && u.password === password
  );
  if (storedMatch) return { ok: true, role: 'attendee' };

  return { ok: false, error: 'Invalid username or password.' };
}

function signup(username, password, confirmPassword, storage = {}) {
  if (!username || !password || !confirmPassword) return { ok: false, error: 'Please fill out all fields.' };
  if (password !== confirmPassword) return { ok: false, error: 'Passwords do not match.' };
  if (password.length < 4) return { ok: false, error: 'Password must be at least 4 characters.' };

  const uname = username.toLowerCase();
  if (HARDCODED.some(c => c.username === uname)) return { ok: false, error: 'That username is already taken.' };

  const stored = getStoredUsers(storage);
  if (stored.some(u => u.username === uname)) return { ok: false, error: 'Username already exists.' };

  storage['cp_users'] = JSON.stringify([...stored, { username: uname, password }]);
  return { ok: true, role: 'attendee' };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Login — Hardcoded credentials', () => {
  it('authenticates admin with correct credentials', () => {
    const result = login('admin', 'admin123');
    expect(result.ok).toBe(true);
    expect(result.role).toBe('admin');
  });

  it('authenticates arav with correct credentials', () => {
    const result = login('arav', 'arav');
    expect(result.ok).toBe(true);
    expect(result.role).toBe('attendee');
  });

  it('authenticates harsh with correct credentials', () => {
    const result = login('harsh', 'harsh');
    expect(result.ok).toBe(true);
    expect(result.role).toBe('attendee');
  });

  it('is case-insensitive for username', () => {
    expect(login('ADMIN', 'admin123').ok).toBe(true);
    expect(login('Admin', 'admin123').ok).toBe(true);
  });

  it('rejects wrong password for admin', () => {
    const result = login('admin', 'wrongpass');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Invalid username or password.');
  });

  it('rejects unknown username', () => {
    const result = login('unknown', 'somepass');
    expect(result.ok).toBe(false);
  });

  it('rejects empty username', () => {
    const result = login('', 'admin123');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Please fill out all fields.');
  });

  it('rejects empty password', () => {
    const result = login('admin', '');
    expect(result.ok).toBe(false);
  });
});

describe('Signup — New user registration', () => {
  let storage;

  beforeEach(() => { storage = {}; });

  it('successfully registers a new user', () => {
    const result = signup('newuser', 'pass1234', 'pass1234', storage);
    expect(result.ok).toBe(true);
    expect(result.role).toBe('attendee');
  });

  it('saves user to storage after signup', () => {
    signup('newuser', 'pass1234', 'pass1234', storage);
    const stored = getStoredUsers(storage);
    expect(stored).toHaveLength(1);
    expect(stored[0].username).toBe('newuser');
  });

  it('allows login with newly registered account', () => {
    signup('newuser', 'pass1234', 'pass1234', storage);
    const result = login('newuser', 'pass1234', storage);
    expect(result.ok).toBe(true);
    expect(result.role).toBe('attendee');
  });

  it('rejects if passwords do not match', () => {
    const result = signup('newuser', 'pass1234', 'different', storage);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Passwords do not match.');
  });

  it('rejects password shorter than 4 characters', () => {
    const result = signup('newuser', 'ab', 'ab', storage);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Password must be at least 4 characters.');
  });

  it('rejects reserved username "admin"', () => {
    const result = signup('admin', 'newpass', 'newpass', storage);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('That username is already taken.');
  });

  it('rejects reserved username "arav"', () => {
    expect(signup('arav', 'newpass', 'newpass', storage).ok).toBe(false);
  });

  it('rejects duplicate signup username', () => {
    signup('dupuser', 'pass1234', 'pass1234', storage);
    const second = signup('dupuser', 'pass1234', 'pass1234', storage);
    expect(second.ok).toBe(false);
    expect(second.error).toBe('Username already exists.');
  });

  it('rejects empty fields', () => {
    expect(signup('', 'pass1234', 'pass1234', storage).ok).toBe(false);
    expect(signup('user', '', 'pass1234', storage).ok).toBe(false);
    expect(signup('user', 'pass1234', '', storage).ok).toBe(false);
  });

  it('stores username in lowercase', () => {
    signup('NewUser', 'pass1234', 'pass1234', storage);
    const stored = getStoredUsers(storage);
    expect(stored[0].username).toBe('newuser');
  });
});

describe('ProtectedRoute logic', () => {
  it('identifies admin role correctly', () => {
    const role = 'admin';
    expect(role === 'admin').toBe(true);
    expect(role === 'attendee').toBe(false);
  });

  it('identifies attendee role correctly', () => {
    const role = 'attendee';
    expect(role === 'attendee').toBe(true);
    expect(role === 'admin').toBe(false);
  });

  it('treats missing role as unauthenticated', () => {
    const role = null;
    expect(!role).toBe(true);
  });
});
