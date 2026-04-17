/**
 * protectedRoute.test.js — Tests for session expiry and role-based routing logic.
 * Tests the pure logic (no React rendering needed).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ROLES } from '../utils/constants';

// ── Pure auth guard logic (mirrors ProtectedRoute) ─────────────────────────────
function checkAccess(storage, requiredRole = null) {
  const role   = storage['userRole'];
  const expiry = storage['cp_sessionExpiry'];

  if (!role) return { redirect: '/login', reason: 'not_authenticated' };

  if (expiry && Date.now() > Number(expiry)) {
    return { redirect: '/login', reason: 'session_expired' };
  }

  if (requiredRole && role !== requiredRole) {
    return {
      redirect: role === ROLES.ADMIN ? '/admin' : '/attendee',
      reason: 'wrong_role',
    };
  }

  return { allowed: true };
}

describe('ProtectedRoute — Not authenticated', () => {
  it('redirects to /login when no userRole present', () => {
    const result = checkAccess({});
    expect(result.redirect).toBe('/login');
    expect(result.reason).toBe('not_authenticated');
  });

  it('redirects admin-only route to /login when not logged in', () => {
    const result = checkAccess({}, ROLES.ADMIN);
    expect(result.redirect).toBe('/login');
  });
});

describe('ProtectedRoute — Session expiry', () => {
  it('redirects when session has expired', () => {
    const expired = String(Date.now() - 1000); // 1 second in the past
    const result  = checkAccess({ userRole: 'attendee', cp_sessionExpiry: expired });
    expect(result.redirect).toBe('/login');
    expect(result.reason).toBe('session_expired');
  });

  it('allows access when session is still valid', () => {
    const valid  = String(Date.now() + 3_600_000); // 1 hour in future
    const result = checkAccess({ userRole: 'attendee', cp_sessionExpiry: valid });
    expect(result.allowed).toBe(true);
  });

  it('allows access when no expiry is set (legacy session)', () => {
    const result = checkAccess({ userRole: 'attendee' });
    expect(result.allowed).toBe(true);
  });
});

describe('ProtectedRoute — Role guards', () => {
  it('allows admin on admin-only route', () => {
    const result = checkAccess({ userRole: ROLES.ADMIN }, ROLES.ADMIN);
    expect(result.allowed).toBe(true);
  });

  it('blocks attendee from admin-only route and redirects to /attendee', () => {
    const result = checkAccess({ userRole: ROLES.ATTENDEE }, ROLES.ADMIN);
    expect(result.redirect).toBe('/attendee');
    expect(result.reason).toBe('wrong_role');
  });

  it('allows attendee on attendee-only route', () => {
    const result = checkAccess({ userRole: ROLES.ATTENDEE }, ROLES.ATTENDEE);
    expect(result.allowed).toBe(true);
  });

  it('blocks admin from attendee-only route and redirects to /admin', () => {
    const result = checkAccess({ userRole: ROLES.ADMIN }, ROLES.ATTENDEE);
    expect(result.redirect).toBe('/admin');
    expect(result.reason).toBe('wrong_role');
  });

  it('allows any authenticated user on unguarded route (no requiredRole)', () => {
    expect(checkAccess({ userRole: ROLES.ADMIN }).allowed).toBe(true);
    expect(checkAccess({ userRole: ROLES.ATTENDEE }).allowed).toBe(true);
  });
});
