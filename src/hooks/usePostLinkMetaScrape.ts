import { scrapeLinkMeta } from '@/apis/linkApi';
import type { LinkMetaScrapeData } from '@/types/api/linkApi';
import { useMutation } from '@tanstack/react-query';

export function usePostLinkMetaScrape() {
  return useMutation<LinkMetaScrapeData, Error, string>({
    mutationFn: scrapeLinkMeta,
  });
}
