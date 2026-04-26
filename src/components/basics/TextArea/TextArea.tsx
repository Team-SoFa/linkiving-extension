'use client';

import Skeleton from '@/components/basics/Skeleton/Skeleton';
import clsx from 'clsx';
import React from 'react';

import { textAreaStyle, wholeBoxStyle } from './TextArea.style';
import { useAutoResizeTextArea } from './hooks/useAutoResizeTextArea';

export const LINE_HEIGHTS = { sm: 19, md: 26, lg: 29 };
export interface TextAreaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onChange' | 'onSubmit'
> {
  className?: string;
  color?: 'white' | 'blue';
  textSize?: 'sm' | 'md' | 'lg';
  heightLines: number; // 줄 수
  maxHeightLines?: number; // 줄 수
  radius?: 'md' | 'lg' | 'full';
  maxLength?: number;
  showMax?: boolean;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit?: (e?: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isLoading?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    className,
    color = 'white',
    maxLength = 0,
    showMax = false,
    placeholder = '무엇이든 물어보세요',
    value,
    textSize = 'md',
    heightLines,
    maxHeightLines,
    radius = 'md',
    isLoading = false,
    disabled = false,
    onChange,
    onSubmit,
    ...rest
  },
  forwardedRef
) {
  const lineHeight = LINE_HEIGHTS[textSize];
  const minHeight = lineHeight * heightLines;
  const maxPxHeight = maxHeightLines ? lineHeight * maxHeightLines : undefined;

  const canShowMax = showMax && maxLength > 0;
  const skeletonHeight = minHeight + 8 + (canShowMax ? 32 : 0);

  const internalRef = useAutoResizeTextArea({ value, maxHeight: maxPxHeight });

  // 불필요한 훅 호출 방지를 위해 forwardedRef와 internalRef를 모두 설정
  const ref = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      internalRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef, internalRef]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // IME(한글 등) 조합 중 Enter 잘못 제출되는 상황 방지
    const isComposing =
      (e.nativeEvent as KeyboardEvent).isComposing ||
      (e as unknown as { isComposing?: boolean }).isComposing;
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault(); // 줄바꿈 방지
      onSubmit?.();
    }
  };

  if (isLoading) {
    return (
      <Skeleton
        radius={radius}
        animated
        width="100%"
        className={clsx('h-full min-h-0', className)}
        style={{ height: skeletonHeight }}
      />
    );
  }

  return (
    <div
      className={clsx(wholeBoxStyle({ radius, color, showMax: canShowMax, disabled }), className)}
      aria-disabled={disabled}
    >
      <textarea
        ref={ref}
        className={clsx(
          textAreaStyle({ textSize }),
          disabled && 'text-gray500 placeholder:text-gray500 cursor-not-allowed'
        )}
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={maxLength && maxLength > 0 ? maxLength : undefined}
        style={{ minHeight: `${minHeight}px` }}
        disabled={disabled}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        {...rest}
      />
      {maxLength > 0 && showMax && (
        <div
          className={clsx(
            'font-detail absolute right-2 bottom-2 select-none',
            value.length > maxLength ? 'text-red200' : 'text-gray300'
          )}
          aria-live="polite"
          aria-atomic="true"
          role="status"
        >
          ({value.length}/{maxLength})
        </div>
      )}
    </div>
  );
});

export default TextArea;
