/**
 * fetchUtils.js — Centralised fetch utilities.
 *
 * - apiFetch:   wraps fetch with AbortController timeout (default 10s)
 * - adminFetch: adds Authorization header for admin routes
 * - fetchWithRetry: retries on network failure (up to 3 attempts)
 */

import { ADMIN_TOKEN } from './constants';

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Fetch with a configurable AbortController timeout.
 */
export async function apiFetch(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  } finally {
    clearTimeout(tid);
  }
}

/**
 * Admin-authenticated version of apiFetch.
 */
export async function adminFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ADMIN_TOKEN}`,
    ...(options.headers || {}),
  };
  return apiFetch(url, { ...options, headers });
}

/**
 * Retries a fetch call up to `maxRetries` times on network failure.
 */
export async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiFetch(url, options);
    } catch (err) {
      lastError = err;
      if (err.name === 'AbortError') throw err; // don't retry timeouts
      await new Promise(r => setTimeout(r, 500 * (attempt + 1))); // back-off
    }
  }
  throw lastError;
}
