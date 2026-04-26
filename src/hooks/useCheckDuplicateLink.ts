import { checkDuplicateLink } from '@/apis/linkApi';
import type { DuplicateLinkApiResponse } from '@/types/api/linkApi';
import { useMutation } from '@tanstack/react-query';

type DuplicateResult = NonNullable<DuplicateLinkApiResponse['data']>;

export const useDuplicateLinkMutation = () => {
  return useMutation<DuplicateResult, Error, string>({
    mutationFn: async (url: string) => {
      const normalizedUrl = url.trim();
      if (!normalizedUrl) {
        throw new Error('URL is required');
      }
      return checkDuplicateLink(normalizedUrl);
    },
  });
};
