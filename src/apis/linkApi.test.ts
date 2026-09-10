import { beforeEach, describe, expect, it, vi } from 'vitest';

import { backendApiClient } from '@/lib/api/client';
import { withAnalyticsContext } from '@/lib/client/analytics';

import { createLink } from './linkApi';

vi.mock('@/lib/api/client', () => ({
  backendApiClient: vi.fn(),
}));

vi.mock('@/lib/client/analytics', () => ({
  withAnalyticsContext: vi.fn(),
}));

const backendApiClientMock = vi.mocked(backendApiClient);
const withAnalyticsContextMock = vi.mocked(withAnalyticsContext);

beforeEach(() => {
  withAnalyticsContextMock.mockImplementation(async payload => ({
    ...payload,
    clientId: '123.456',
    source: 'extension',
  }));
});

describe('createLink', () => {
  it('sends the analytics-enriched payload to the backend', async () => {
    backendApiClientMock.mockResolvedValue({
      success: true,
      status: 'OK',
      message: 'created',
      data: {
        id: 1,
        url: 'https://example.com',
        title: 'Example',
        summary: null,
      },
    });

    await createLink({ url: 'https://example.com', title: 'Example' });

    expect(backendApiClientMock).toHaveBeenCalledWith('/v1/links', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://example.com',
        title: 'Example',
        clientId: '123.456',
        source: 'extension',
      }),
    });
  });

  it('rejects an unsuccessful API response', async () => {
    backendApiClientMock.mockResolvedValue({
      success: false,
      status: 'BAD_REQUEST',
      message: 'save failed',
      data: null as never,
    });

    await expect(createLink({ url: 'https://example.com', title: 'Example' })).rejects.toThrow(
      'save failed'
    );
  });
});
