import Constants from 'expo-constants';

const DEFAULT_API_BASE_URL = 'https://f9swh48l-8000.inc1.devtunnels.ms';

function normalizeBaseUrl(url: string | undefined | null): string {
  return (url?.trim() || '').replace(/\/+$/, '');
}

function resolveApiBaseUrl(): string {
  const fromExtra = normalizeBaseUrl(
    Constants.expoConfig?.extra?.apiBaseUrl as string | undefined
  );
  const fromEnv = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);
  return fromExtra || fromEnv || DEFAULT_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();

export const API_V1_PREFIX = '/api/v1';

export const API_REQUEST_TIMEOUT_MS = 20_000;

export function apiUrl(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${p}`;
}

/** Prefix path with `/api/v1` when not already present. */
export function apiV1Path(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (p.startsWith(API_V1_PREFIX)) return p;
  return `${API_V1_PREFIX}${p}`;
}
