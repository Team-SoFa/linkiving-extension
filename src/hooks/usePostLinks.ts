import { createLink } from '@/apis/linkApi';
import type { CreateLinkPayload, Link } from '@/types/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UsePostLinksOptions {
  skipInvalidate?: boolean;
}

export function usePostLinks({ skipInvalidate = false }: UsePostLinksOptions = {}) {
  const qc = useQueryClient();

  return useMutation<Link, Error, CreateLinkPayload>({
    mutationFn: createLink,
    onSuccess: () => {
      if (!skipInvalidate) {
        qc.invalidateQueries({ queryKey: ['links'], exact: false });
      }
    },
  });
}
