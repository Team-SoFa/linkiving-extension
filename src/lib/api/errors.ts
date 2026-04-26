export class FetchError extends Error {
  status?: number;
  body?: string;
  contentType: string | null;

  constructor(
    message: string,
    opts?: { status?: number; body?: string; contentType?: string | null }
  ) {
    super(message);
    this.name = 'FetchError';
    this.status = opts?.status;
    this.body = opts?.body;
    this.contentType = opts?.contentType ?? null;
  }
}

export const createFetchError = (
  message: string,
  opts?: { status?: number; body?: string; contentType?: string | null }
) => new FetchError(message, opts);
