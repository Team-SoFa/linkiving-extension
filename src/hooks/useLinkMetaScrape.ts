import { usePostLinkMetaScrape } from '@/hooks/usePostLinkMetaScrape';
import { FetchError } from '@/lib/api/errors';
import { useEffect, useRef, useState } from 'react';
import type {
  FieldValues,
  Path,
  PathValue,
  UseFormGetValues,
  UseFormSetValue,
} from 'react-hook-form';

const META_SCRAPE_FAILURE_MESSAGE =
  '링크 정보를 불러오지 못했습니다. 제목을 직접 입력해 주세요.';

type MetaData = {
  title: string;
  description: string;
  image: string;
  url: string;
};

type LinkMetaScrapeOptions<T extends FieldValues & { title?: string; memo?: string }> = {
  url: string;
  isValidUrl: boolean;
  dirtyFields: Partial<Record<keyof T, boolean>>;
  getValues: UseFormGetValues<T>;
  setValue: UseFormSetValue<T>;
  skipAutoFill?: boolean;
};

export function useLinkMetaScrape<T extends FieldValues & { title?: string; memo?: string }>({
  url,
  isValidUrl,
  dirtyFields,
  getValues,
  setValue,
  skipAutoFill,
}: LinkMetaScrapeOptions<T>) {
  const metaScrape = usePostLinkMetaScrape();
  const metaScrapeRef = useRef(metaScrape);
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaErrorMessage, setMetaErrorMessage] = useState<string | null>(null);
  const lastScrapedUrl = useRef<string | null>(null);
  const metaRequestId = useRef(0);
  const titlePath = 'title' as Path<T>;
  const memoPath = 'memo' as Path<T>;
  const dirtyTitleRef = useRef(false);
  const dirtyMemoRef = useRef(false);
  const skipAutoFillRef = useRef(skipAutoFill);

  useEffect(() => {
    metaScrapeRef.current = metaScrape;
  }, [metaScrape]);

  useEffect(() => {
    dirtyTitleRef.current = Boolean(dirtyFields.title);
    dirtyMemoRef.current = Boolean(dirtyFields.memo);
  }, [dirtyFields.title, dirtyFields.memo]);

  useEffect(() => {
    skipAutoFillRef.current = skipAutoFill;
  }, [skipAutoFill]);

  useEffect(() => {
    if (!url || !isValidUrl) {
      metaRequestId.current += 1;
      if (metaScrapeRef.current.status !== 'idle') {
        metaScrapeRef.current.reset();
      }
      setMetaLoading(false);
      setMetaData(null);
      setMetaErrorMessage(null);
      if (!dirtyTitleRef.current && !skipAutoFillRef.current) {
        setValue(titlePath, '' as PathValue<T, typeof titlePath>, { shouldValidate: true });
      }
      if (!dirtyMemoRef.current && !skipAutoFillRef.current) {
        setValue(memoPath, '' as PathValue<T, typeof memoPath>, { shouldValidate: true });
      }
      lastScrapedUrl.current = null;
      return;
    }

    if (url === lastScrapedUrl.current) return;

    setMetaData(null);
    setMetaErrorMessage(null);
    if (!dirtyFields.title && getValues(titlePath)) {
      setValue(titlePath, '' as PathValue<T, typeof titlePath>, { shouldValidate: true });
    }
    if (!dirtyFields.memo && getValues(memoPath)) {
      setValue(memoPath, '' as PathValue<T, typeof memoPath>, { shouldValidate: true });
    }

    metaRequestId.current += 1;
    const requestId = metaRequestId.current;
    setMetaLoading(true);

    const timeoutId = setTimeout(() => {
      lastScrapedUrl.current = url;
      metaScrapeRef.current
        .mutateAsync(url)
        .then(data => {
          if (requestId !== metaRequestId.current) return;

          setMetaData(data);
          setMetaLoading(false);
          if (!data.title?.trim()) {
            setMetaErrorMessage(META_SCRAPE_FAILURE_MESSAGE);
          }
          if (!dirtyTitleRef.current && !skipAutoFillRef.current) {
            setValue(titlePath, (data.title ?? '') as PathValue<T, typeof titlePath>, {
              shouldValidate: true,
            });
          }
          if (!dirtyMemoRef.current && !skipAutoFillRef.current) {
            setValue(memoPath, (data.description ?? '') as PathValue<T, typeof memoPath>, {
              shouldValidate: true,
            });
          }
        })
        .catch(error => {
          if (requestId !== metaRequestId.current) return;
          if (process.env.NODE_ENV !== 'production') {
            console.error('[meta-scrape] failed', error instanceof FetchError ? {
              message: error.message,
              status: error.status,
              body: error.body,
            } : error);
          }
          setMetaErrorMessage(META_SCRAPE_FAILURE_MESSAGE);
          setMetaLoading(false);
        });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [url, isValidUrl, setValue, getValues, dirtyFields.title, dirtyFields.memo, titlePath, memoPath]);

  return { metaData, metaLoading, metaErrorMessage };
}
