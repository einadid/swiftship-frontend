/**
 * Small fetch wrapper around the SwiftShip API.
 * - stores JWT access + refresh tokens in localStorage
 * - transparently refreshes the access token on 401 (single in-flight refresh)
 * - normalises error messages so pages can just toast(err.message)
 */
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const ACCESS_KEY = 'sw_access_token';
const REFRESH_KEY = 'sw_refresh_token';

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export function setTokens({ access_token, refresh_token }) {
  if (access_token) localStorage.setItem(ACCESS_KEY, access_token);
  if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token);
}

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

let refreshPromise = null;

async function tryRefresh() {
  const rt = getRefreshToken();
  if (!rt) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: rt }),
    });
    if (!res.ok) return false;
    setTokens(await res.json());
    return true;
  } catch {
    return false;
  }
}

/** Ensure a valid access token; kicks off one shared refresh if needed. */
export async function ensureFreshToken() {
  if (!getAccessToken()) {
    return await tryRefresh();
  }
  return true;
}

export function redirectToLogin(reason) {
  const target = `/login${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`;
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = target;
  }
}

export async function api(path, { method = 'GET', body, auth = true, _retry = false } = {}) {
  let res;
  try {
    const headers = { 'Content-Type': 'application/json' };
    const token = getAccessToken();
    if (auth && token) headers.Authorization = `Bearer ${token}`;
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Network error — please make sure the backend API is running.');
  }

  // Token expired/invalid -> try refresh once, then retry the original call
  if (res.status === 401 && auth && !_retry) {
    const ok = await (refreshPromise ?? (refreshPromise = tryRefresh().finally(() => (refreshPromise = null))));
    if (ok) return api(path, { method, body, auth, _retry: true });
    clearTokens();
    redirectToLogin('Your session expired. Please login again.');
    throw new Error('Session expired. Please login again.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* 204 etc. */
  }

  if (!res.ok) {
    let detail = data?.detail;
    if (Array.isArray(detail)) detail = detail.map((d) => d.msg).join('; ');
    throw new Error(typeof detail === 'string' && detail ? detail : `Request failed (${res.status})`);
  }
  return data;
}

export function qs(params) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (!entries.length) return '';
  return `?${new URLSearchParams(entries).toString()}`;
}

export const fmtMoney = (n) => `৳${Number(n || 0).toFixed(2)}`;
export const fmtDate = (s) => (s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
export const fmtDateTime = (s) =>
  s ? new Date(s).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
