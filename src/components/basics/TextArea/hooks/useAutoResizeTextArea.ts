import { useCallback, useLayoutEffect, useRef } from 'react';

interface UseAutoResizeTextAreaProps {
  value: string;
  maxHeight?: number;
}

export const useAutoResizeTextArea = ({ value, maxHeight }: UseAutoResizeTextAreaProps) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    el.style.height = '0px';
    const newHeight = el.scrollHeight;

    if (maxHeight && newHeight > maxHeight) {
      el.style.height = `${maxHeight}px`;
      el.style.overflowY = 'auto';
    } else {
      el.style.height = `${newHeight}px`;
      el.style.overflowY = 'hidden';
    }
  }, [maxHeight]);

  useLayoutEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return ref;
};
