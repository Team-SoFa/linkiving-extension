import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
});

function installStorage(initial: Record<string, unknown> = {}) {
  const values = { ...initial };
  const get = vi.fn(async (key: string) => (key in values ? { [key]: values[key] } : {}));
  const set = vi.fn(async (items: Record<string, unknown>) => {
    Object.assign(values, items);
  });

  vi.stubGlobal('chrome', { storage: { local: { get, set } } });
  return { get, set, values };
}

describe('extension analytics context', () => {
  it('reuses a stored GA client id', async () => {
    const storage = installStorage({ linkivingGaClientId: '1234567890.1234567890' });
    const { withAnalyticsContext } = await import('./analytics');

    await expect(withAnalyticsContext({ url: 'https://example.com' })).resolves.toEqual({
      url: 'https://example.com',
      clientId: '1234567890.1234567890',
      source: 'extension',
    });
    expect(storage.set).not.toHaveBeenCalled();
  });

  it('creates one client id and caches it for the page lifetime', async () => {
    const storage = installStorage();
    const { getOrCreateGaClientId } = await import('./analytics');

    const first = await getOrCreateGaClientId();
    const second = await getOrCreateGaClientId();

    expect(first).toMatch(/^\d+\.\d+$/);
    expect(second).toBe(first);
    expect(storage.get).toHaveBeenCalledTimes(1);
    expect(storage.set).toHaveBeenCalledTimes(1);
  });

  it('keeps the extension source when storage is unavailable', async () => {
    vi.stubGlobal('chrome', {});
    const { withAnalyticsContext } = await import('./analytics');

    await expect(withAnalyticsContext({ title: 'Link' })).resolves.toEqual({
      title: 'Link',
      source: 'extension',
    });
  });
});
