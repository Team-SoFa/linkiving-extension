import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useExtensionAuthStore } from '@/stores/extensionAuthStore';

const resolveToken = vi.hoisted(() => vi.fn());
vi.mock('@/lib/chrome/auth', () => ({ resolveExtensionAccessToken: resolveToken }));

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_EXTENSION_API_BASE_URL', 'https://api.example.test');
  useExtensionAuthStore.setState({ status: 'checking', hasAuthenticated: false });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
  resolveToken.mockReset();
});

describe('extension authentication failures', () => {
  it('shows first-login guidance without making a request when there is no cookie', async () => {
    resolveToken.mockResolvedValue(null);
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const { backendApiClient } = await import('./client');

    await expect(backendApiClient('/v1/member/me')).rejects.toMatchObject({ status: 401 });
    expect(fetch).not.toHaveBeenCalled();
    expect(useExtensionAuthStore.getState().status).toBe('signed-out');
  });

  it('switches an authenticated session to the expired screen on HTTP 401', async () => {
    resolveToken.mockResolvedValue('expired-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    const { backendApiClient } = await import('./client');
    const { useExtensionAuthStore: store } = await import('@/stores/extensionAuthStore');
    store.setState({ status: 'authenticated', hasAuthenticated: true });

    await expect(backendApiClient('/v1/links')).rejects.toMatchObject({ status: 401 });
    expect(store.getState().status).toBe('expired');
  });

  it('does not invalidate a new login because of an older request’s HTTP 401', async () => {
    resolveToken.mockResolvedValueOnce('old-token').mockResolvedValueOnce('new-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    const { backendApiClient } = await import('./client');
    const { useExtensionAuthStore: store } = await import('@/stores/extensionAuthStore');
    store.setState({ status: 'authenticated', hasAuthenticated: true });

    await expect(backendApiClient('/v1/links')).rejects.toMatchObject({ status: 401 });
    expect(store.getState().status).toBe('authenticated');
  });

  it('keeps server failures separate from expired authentication', async () => {
    resolveToken.mockResolvedValue('valid-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })));
    const { backendApiClient } = await import('./client');
    const { useExtensionAuthStore: store } = await import('@/stores/extensionAuthStore');
    store.setState({ status: 'authenticated', hasAuthenticated: true });

    await expect(backendApiClient('/v1/links')).rejects.toMatchObject({ status: 500 });
    expect(store.getState().status).toBe('authenticated');
  });
});
