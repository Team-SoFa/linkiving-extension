import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('resolveExtensionAccessToken', () => {
  it('reads and decodes the Linkiving login cookie', async () => {
    const get = vi.fn().mockResolvedValue({ value: 'access%20token' });
    vi.stubGlobal('chrome', { cookies: { get } });

    const { resolveExtensionAccessToken } = await import('./auth');

    await expect(resolveExtensionAccessToken()).resolves.toBe('access token');
    expect(get).toHaveBeenCalledWith({
      url: 'https://linkiving.com',
      name: 'accessToken',
    });
  });

  it('returns null when no configured origin has a login cookie', async () => {
    vi.stubGlobal('chrome', { cookies: { get: vi.fn().mockResolvedValue(null) } });

    const { resolveExtensionAccessToken } = await import('./auth');

    await expect(resolveExtensionAccessToken()).resolves.toBeNull();
  });

  it('uses the explicit fallback token only during local development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_EXTENSION_API_TOKEN', ' development-token ');
    vi.stubGlobal('chrome', { cookies: { get: vi.fn().mockResolvedValue(null) } });

    const { resolveExtensionAccessToken } = await import('./auth');

    await expect(resolveExtensionAccessToken()).resolves.toBe('development-token');
  });

  it('ignores the explicit fallback token in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_EXTENSION_API_TOKEN', 'production-token');
    vi.stubGlobal('chrome', { cookies: { get: vi.fn().mockResolvedValue(null) } });

    const { resolveExtensionAccessToken } = await import('./auth');

    await expect(resolveExtensionAccessToken()).resolves.toBeNull();
  });

  it('does not reuse a production login when an explicit auth site is configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_EXTENSION_AUTH_BASE_URL', 'https://preview.linkiving.test/path');
    const get = vi.fn().mockResolvedValue(null);
    vi.stubGlobal('chrome', { cookies: { get } });

    const { resolveExtensionAccessToken } = await import('./auth');

    await expect(resolveExtensionAccessToken()).resolves.toBeNull();
    expect(get.mock.calls.map(([details]) => details.url)).toEqual([
      'https://preview.linkiving.test',
    ]);
  });
});
