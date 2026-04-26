export type LinkSummaryStatus = 'idle' | 'generating' | 'ready' | 'failed';

export interface LinkSummaryState {
  summaryStatus?: LinkSummaryStatus;
  summaryProgress?: number;
  summaryUpdatedAt?: string;
}

export interface Link extends LinkSummaryState {
  id: number;
  url: string;
  title: string;
  summary: string;
  memo?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type AtLeastOne<T, Keys extends keyof T = keyof T> = Partial<T> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Omit<T, K>> }[Keys];

type OptionalLinkFields = Pick<Link, 'memo' | 'imageUrl'>;

export type CreateLinkPayload = Pick<Link, 'url' | 'title'> & Partial<OptionalLinkFields>;

type UpdatableLinkFields = {
  title?: string | null;
  memo?: string | null;
  imageUrl?: string | null;
};

export type UpdateLinkPayload = AtLeastOne<UpdatableLinkFields>;
