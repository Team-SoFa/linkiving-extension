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

  it('checks a configured auth origin before the default origin', async () => {
    vi.stubEnv('NEXT_PUBLIC_EXTENSION_AUTH_BASE_URL', 'https://preview.linkiving.test/path');
    const get = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ value: 'default-token' });
    vi.stubGlobal('chrome', { cookies: { get } });

    const { resolveExtensionAccessToken } = await import('./auth');

    await expect(resolveExtensionAccessToken()).resolves.toBe('default-token');
    expect(get.mock.calls.map(([details]) => details.url)).toEqual([
      'https://preview.linkiving.test',
      'https://linkiving.com',
    ]);
  });
});
