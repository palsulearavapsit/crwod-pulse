/**
 * fetchUtils.ts — Generic wrappers for fetch with better error handling.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchJson(url: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${API_URL}${url}`, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err: any) {
    console.error('[Fetch Error]', err.message);
    throw err;
  }
}

export async function postJson(url: string, body: any, adminToken?: string) {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
  
  return fetchJson(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}
