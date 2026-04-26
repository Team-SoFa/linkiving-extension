import { fetchLink } from '@/apis/linkApi';
import { useDuplicateLinkMutation } from '@/hooks/useCheckDuplicateLink';
import type { Link } from '@/types/link';
import { useEffect, useRef, useState } from 'react';

interface UseDuplicateCheckResult {
  isDuplicate: boolean;
  duplicateLinkId: number | null;
  duplicateLinkData: Link | null;
}

export function useDuplicateCheck(
  trimmedUrl: string,
  isValidUrl: boolean
): UseDuplicateCheckResult {
  const { mutateAsync } = useDuplicateLinkMutation();
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateLinkId, setDuplicateLinkId] = useState<number | null>(null);
  const [duplicateLinkData, setDuplicateLinkData] = useState<Link | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!trimmedUrl || !isValidUrl) {
      requestIdRef.current += 1;
      setIsDuplicate(false);
      setDuplicateLinkId(null);
      setDuplicateLinkData(null);
      return;
    }

    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    setIsDuplicate(false);
    setDuplicateLinkId(null);
    setDuplicateLinkData(null);

    const timeoutId = setTimeout(() => {
      mutateAsync(trimmedUrl)
        .then(async ({ exists, linkId }) => {
          if (requestId !== requestIdRef.current) return;
          if (exists && linkId) {
            setIsDuplicate(true);
            setDuplicateLinkId(linkId);
            try {
              const link = await fetchLink(linkId);
              if (requestId !== requestIdRef.current) return;
              setDuplicateLinkData(link);
            } catch {
              setDuplicateLinkData(null);
            }
          } else {
            setIsDuplicate(false);
            setDuplicateLinkId(null);
            setDuplicateLinkData(null);
          }
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setIsDuplicate(false);
          setDuplicateLinkId(null);
          setDuplicateLinkData(null);
        });
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [trimmedUrl, isValidUrl, mutateAsync]);

  return { isDuplicate, duplicateLinkId, duplicateLinkData };
}
