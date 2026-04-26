import type { Link } from '@/types/link';

export interface ApiResponseBase<T> {
  success: boolean;
  status: string;
  message: string;
  data: T;
  timestamp?: string;
}

export interface LinkRes {
  id: number;
  url: string;
  title: string;
  summary?: { id: number; content: string } | string;
  memo?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  summaryStatus?: Link['summaryStatus'];
  summaryProgress?: Link['summaryProgress'];
  summaryUpdatedAt?: Link['summaryUpdatedAt'];
}

export type LinkApiData = LinkRes;
export type LinkApiResponse = ApiResponseBase<LinkApiData>;
export type DeleteLinkApiResponse = ApiResponseBase<string> & { timestamp: string };

export type DuplicateLinkApiResponse = ApiResponseBase<{
  exists: boolean;
  linkId?: number;
}>;

export interface LinkMetaScrapeData {
  title: string;
  description: string;
  image: string;
  url: string;
}

export type LinkMetaScrapeApiResponse = ApiResponseBase<LinkMetaScrapeData>;
