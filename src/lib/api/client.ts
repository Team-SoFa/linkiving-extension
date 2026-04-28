import { createFetchError } from './errors';
import { resolveExtensionAccessToken } from '@/lib/chrome/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_EXTENSION_API_BASE_URL ?? process.env.NEXT_PUBLIC_BASE_API_URL;
const LOGIN_REQUIRED_MESSAGE =
  '로그인이 필요합니다. Linkiving 웹사이트에 로그인한 뒤 다시 시도해 주세요.';

function joinUrl(baseUrl: string, endpoint: string) {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${normalizedBase}${normalizedEndpoint}`;
}

export async function backendApiClient<T>(
  endpoint: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error(
      'Missing environment variable: NEXT_PUBLIC_EXTENSION_API_BASE_URL (or NEXT_PUBLIC_BASE_API_URL)'
    );
  }

  if (!/^https?:\/\//i.test(API_BASE_URL)) {
    throw new Error(
      `Invalid API base URL for extension: ${API_BASE_URL}. Use an absolute http(s) URL.`
    );
  }

  const { timeout = 15_000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const headers = new Headers(fetchOptions.headers ?? {});
  const token = await resolveExtensionAccessToken();

  headers.set('Content-Type', 'application/json');
  if (!token) {
    throw createFetchError(LOGIN_REQUIRED_MESSAGE, {
      status: 401,
    });
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = joinUrl(API_BASE_URL, endpoint);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: fetchOptions.signal ?? controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw createFetchError(LOGIN_REQUIRED_MESSAGE, {
          status: response.status,
        });
      }

      const contentType = response.headers.get('content-type');
      const rawBody = await response.text();

      let message = `Request failed with status ${response.status}`;
      if (contentType?.includes('application/json')) {
        try {
          const parsed = JSON.parse(rawBody || '{}');
          message = parsed.message || message;
        } catch {
          // keep fallback
        }
      }

      throw createFetchError(message, {
        status: response.status,
        body: rawBody,
        contentType,
      });
    }

    const text = await response.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
  } finally {
    clearTimeout(timeoutId);
  }
}
