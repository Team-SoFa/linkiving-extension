import { ACCESS_TOKEN_COOKIE_NAME } from '@/lib/constants/auth';

const explicitToken =
  process.env.NEXT_PUBLIC_EXTENSION_API_TOKEN ?? process.env.NEXT_PUBLIC_API_TOKEN;

const authBaseUrls = [
  process.env.NEXT_PUBLIC_EXTENSION_AUTH_BASE_URL,
  process.env.NEXT_PUBLIC_EXTENSION_APP_URL,
  'https://linkiving.com',
  process.env.NEXT_PUBLIC_EXTENSION_API_BASE_URL,
  process.env.NEXT_PUBLIC_BASE_API_URL,
].filter((value): value is string => Boolean(value));

function toOrigin(url: string) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function getAuthOrigins() {
  return Array.from(new Set(authBaseUrls.map(toOrigin).filter((value): value is string => Boolean(value))));
}

async function getCookieToken(url: string) {
  if (typeof chrome === 'undefined' || !chrome.cookies?.get) {
    return null;
  }

  try {
    const cookie = await chrome.cookies.get({
      url,
      name: ACCESS_TOKEN_COOKIE_NAME,
    });

    const value = cookie?.value?.trim();
    if (!value) {
      return null;
    }

    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  } catch {
    return null;
  }
}

export async function resolveExtensionAccessToken() {
  for (const origin of getAuthOrigins()) {
    const token = await getCookieToken(origin);
    if (token) {
      return token;
    }
  }

  if (explicitToken?.trim()) {
    return explicitToken.trim();
  }

  return null;
}
