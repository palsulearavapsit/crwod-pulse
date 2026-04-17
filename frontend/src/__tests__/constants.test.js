/**
 * constants.test.js — Sanity tests for shared constants.
 */
import { describe, it, expect } from 'vitest';
import {
  ROLES, SCENARIOS, CONGESTION, CONGESTION_LABEL,
  CONGESTION_COLOR, CONGESTION_BG, HARDCODED_USERS,
  SUPPORTED_LANGS, SESSION_DURATION_MS
} from '../utils/constants';

describe('ROLES', () => {
  it('defines admin and attendee roles', () => {
    expect(ROLES.ADMIN).toBe('admin');
    expect(ROLES.ATTENDEE).toBe('attendee');
  });
});

describe('SCENARIOS', () => {
  it('has exactly 4 scenarios', () => {
    expect(Object.keys(SCENARIOS)).toHaveLength(4);
  });
  it('all scenarios are non-empty strings', () => {
    Object.values(SCENARIOS).forEach(v => expect(typeof v).toBe('string') && expect(v.length).toBeGreaterThan(0));
  });
});

describe('CONGESTION levels', () => {
  it('has green, yellow, red levels', () => {
    expect(CONGESTION.GREEN).toBe('green');
    expect(CONGESTION.YELLOW).toBe('yellow');
    expect(CONGESTION.RED).toBe('red');
  });

  it('CONGESTION_LABEL maps all levels', () => {
    expect(CONGESTION_LABEL['green']).toBe('Low');
    expect(CONGESTION_LABEL['yellow']).toBe('Moderate');
    expect(CONGESTION_LABEL['red']).toBe('High');
  });

  it('CONGESTION_COLOR maps all levels to CSS classes', () => {
    expect(CONGESTION_COLOR['green']).toContain('emerald');
    expect(CONGESTION_COLOR['yellow']).toContain('amber');
    expect(CONGESTION_COLOR['red']).toContain('rose');
  });

  it('CONGESTION_BG maps all levels', () => {
    ['green', 'yellow', 'red'].forEach(level => {
      expect(CONGESTION_BG[level]).toBeDefined();
      expect(CONGESTION_BG[level].length).toBeGreaterThan(0);
    });
  });
});

describe('HARDCODED_USERS', () => {
  it('has exactly 3 users', () => {
    expect(HARDCODED_USERS).toHaveLength(3);
  });

  it('each user has username, password, and role', () => {
    HARDCODED_USERS.forEach(u => {
      expect(u.username).toBeDefined();
      expect(u.password).toBeDefined();
      expect(u.role).toBeDefined();
    });
  });

  it('admin user has admin role', () => {
    const admin = HARDCODED_USERS.find(u => u.username === 'admin');
    expect(admin).toBeDefined();
    expect(admin.role).toBe(ROLES.ADMIN);
  });

  it('non-admin users have attendee role', () => {
    HARDCODED_USERS.filter(u => u.username !== 'admin').forEach(u => {
      expect(u.role).toBe(ROLES.ATTENDEE);
    });
  });

  it('all usernames are lowercase', () => {
    HARDCODED_USERS.forEach(u => {
      expect(u.username).toBe(u.username.toLowerCase());
    });
  });
});

describe('SUPPORTED_LANGS', () => {
  it('has at least 3 languages', () => {
    expect(SUPPORTED_LANGS.length).toBeGreaterThanOrEqual(3);
  });

  it('each lang has code and label', () => {
    SUPPORTED_LANGS.forEach(l => {
      expect(l.code).toBeDefined();
      expect(l.label).toBeDefined();
    });
  });

  it('includes Spanish, French, Hindi', () => {
    const codes = SUPPORTED_LANGS.map(l => l.code);
    expect(codes).toContain('es');
    expect(codes).toContain('fr');
    expect(codes).toContain('hi');
  });
});

describe('SESSION_DURATION_MS', () => {
  it('is exactly 24 hours in ms', () => {
    expect(SESSION_DURATION_MS).toBe(24 * 60 * 60 * 1000);
  });
});
