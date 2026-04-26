import { useEffect, useRef, useState } from 'react';

import { usePostLinks } from '@/hooks/usePostLinks';
import { hideToast, showToast } from '@/stores/toastStore';

interface UseCreateLinkErrorOptions {
  createLink: ReturnType<typeof usePostLinks>;
  trimmedUrl: string;
  titleValue: string | undefined;
  memoValue: string | undefined;
  onRetry: (payload: {
    url: string;
    title: string;
    memo?: string;
    imageUrl?: string;
  }) => Promise<void>;
}

export function useCreateLinkError({
  createLink,
  trimmedUrl,
  titleValue,
  memoValue,
  onRetry,
}: UseCreateLinkErrorOptions) {
  const [hasSubmitError, setHasSubmitError] = useState(false);
  const lastSubmitErrorRef = useRef<Error | null>(null);
  const lastSubmitPayloadRef = useRef<{
    url: string;
    title: string;
    memo?: string;
    imageUrl?: string;
  } | null>(null);
  const lastInputsRef = useRef({ trimmedUrl, titleValue, memoValue });

  useEffect(() => {
    const lastInputs = lastInputsRef.current;
    const inputsChanged =
      lastInputs.trimmedUrl !== trimmedUrl ||
      lastInputs.titleValue !== titleValue ||
      lastInputs.memoValue !== memoValue;

    if (!inputsChanged) return;

    lastInputsRef.current = { trimmedUrl, titleValue, memoValue };
    setHasSubmitError(false);

    if (createLink.isError) {
      createLink.reset();
      lastSubmitErrorRef.current = null;
    }
  }, [trimmedUrl, titleValue, memoValue, createLink]);

  useEffect(() => {
    if (!createLink.isError || !createLink.error) return;
    if (lastSubmitErrorRef.current === createLink.error) return;

    lastSubmitErrorRef.current = createLink.error;
    setHasSubmitError(true);
    const message =
      createLink.error.message?.trim() || '링크를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.';

    const toastId = showToast({
      message,
      variant: 'error',
      actionLabel: '다시 시도',
      onAction: () => {
        const payload = lastSubmitPayloadRef.current;
        if (!payload) return;
        hideToast(toastId);
        lastSubmitErrorRef.current = null;
        setHasSubmitError(false);
        void onRetry(payload);
      },
    });
  }, [createLink.isError, createLink.error, onRetry]);

  return { hasSubmitError, lastSubmitPayloadRef };
}
