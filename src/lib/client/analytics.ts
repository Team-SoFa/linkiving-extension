const GA_CLIENT_ID_STORAGE_KEY = 'linkivingGaClientId';

let clientIdPromise: Promise<string | null> | null = null;

const createGaClientId = () => {
  const randomDigits = crypto.getRandomValues(new Uint32Array(1))[0] % 9_000_000_000;
  const randomPart = randomDigits + 1_000_000_000;
  const timestampSeconds = Math.floor(Date.now() / 1000);

  return `${randomPart}.${timestampSeconds}`;
};

const resolveGaClientId = async (): Promise<string | null> => {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return null;
  }

  const stored = await chrome.storage.local.get(GA_CLIENT_ID_STORAGE_KEY);
  const clientId = stored[GA_CLIENT_ID_STORAGE_KEY];

  if (typeof clientId === 'string' && clientId.trim()) {
    return clientId;
  }

  const newClientId = createGaClientId();
  await chrome.storage.local.set({ [GA_CLIENT_ID_STORAGE_KEY]: newClientId });
  return newClientId;
};

export const getOrCreateGaClientId = (): Promise<string | null> => {
  clientIdPromise ??= resolveGaClientId().catch(() => null);
  return clientIdPromise;
};

export const withAnalyticsContext = async <T extends object>(
  payload: T
): Promise<T & { clientId?: string; source: 'extension' }> => {
  const clientId = await getOrCreateGaClientId();

  return {
    ...payload,
    ...(clientId ? { clientId } : {}),
    source: 'extension',
  };
};
