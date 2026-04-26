import { backendApiClient } from '@/lib/api/client';
import type {
  DuplicateLinkApiResponse,
  LinkApiData,
  LinkApiResponse,
  LinkMetaScrapeApiResponse,
} from '@/types/api/linkApi';
import type { CreateLinkPayload, Link, UpdateLinkPayload } from '@/types/link';

const normalizeLink = (data: LinkApiData) => {
  const now = new Date().toISOString();
  const rawSummary = data.summary;
  const summary =
    rawSummary !== null && typeof rawSummary === 'object'
      ? rawSummary.content
      : (rawSummary ?? '');

  return {
    id: data.id ?? 0,
    url: data.url ?? '',
    title: data.title ?? '',
    summary,
    memo: data.memo ?? undefined,
    imageUrl: data.imageUrl ?? '',
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
    summaryStatus: data.summaryStatus,
    summaryProgress: data.summaryProgress,
    summaryUpdatedAt: data.summaryUpdatedAt,
  } satisfies Link;
};

export const createLink = async (payload: CreateLinkPayload): Promise<Link> => {
  const body = await backendApiClient<LinkApiResponse>('/v1/links', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!body?.data || !body.success) {
    throw new Error(body?.message ?? 'Invalid response');
  }

  return normalizeLink(body.data);
};

export const fetchLink = async (id: number): Promise<Link> => {
  const body = await backendApiClient<LinkApiResponse>(`/v1/links/${id}`);

  if (!body?.data || !body.success) {
    throw new Error(body?.message ?? 'Invalid response');
  }

  return normalizeLink(body.data);
};

export const updateLink = async (id: number, payload: UpdateLinkPayload): Promise<Link> => {
  const body = await backendApiClient<LinkApiResponse>(`/v1/links/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  if (!body?.data || !body.success) {
    throw new Error(body?.message ?? 'Invalid response');
  }

  return normalizeLink(body.data);
};

export const checkDuplicateLink = async (url: string) => {
  const usp = new URLSearchParams({ url });
  const body = await backendApiClient<DuplicateLinkApiResponse>(
    `/v1/links/duplicate?${usp.toString()}`
  );

  if (!body?.data || !body.success) {
    throw new Error(body?.message ?? 'Failed to check duplicate');
  }

  return body.data;
};

export const scrapeLinkMeta = async (url: string) => {
  const response = await backendApiClient<LinkMetaScrapeApiResponse>('/v1/links/meta-scrape', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });

  if (!response?.data || !response.success) {
    throw new Error(response?.message ?? 'Invalid response');
  }

  return response.data;
};
