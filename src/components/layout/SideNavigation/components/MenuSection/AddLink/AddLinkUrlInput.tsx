'use client';

import clsx from 'clsx';
import React from 'react';

import TextArea, { type TextAreaProps } from '@/components/basics/TextArea/TextArea';
import CopyButton from '@/components/wrappers/CopyButton';

interface AddLinkUrlInputProps extends Omit<
  TextAreaProps,
  | 'value'
  | 'onChange'
  | 'heightLines'
  | 'maxHeightLines'
  | 'radius'
  | 'color'
  | 'textSize'
  | 'showMax'
> {
  value: string;
  errorMessage?: string;
  onChange: (value: string) => void;
}

const AddLinkUrlInput = React.forwardRef<HTMLTextAreaElement, AddLinkUrlInputProps>(
  (
    {
      value,
      errorMessage,
      onChange,
      placeholder = 'URL 주소를 입력해주세요.',
      id,
      name,
      onBlur,
      autoComplete = 'url',
      inputMode = 'url',
      ...rest
    },
    ref
  ) => {
    const trimmedValue = value.trim();
    const hasError = Boolean(errorMessage);
    const inputId = id ?? name ?? 'add-link-url-input';
    const errorId = hasError ? `${inputId}-error` : undefined;

    const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = e => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    };

    return (
      <div className="flex flex-col gap-1.5">
        <div className="relative">
          <TextArea
            ref={ref}
            id={inputId}
            name={name}
            value={value}
            onBlur={onBlur}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            inputMode={inputMode}
            aria-invalid={hasError}
            aria-describedby={errorId}
            radius="lg"
            heightLines={1}
            maxHeightLines={1}
            textSize="md"
            className={clsx(
              'min-h-[3rem] pr-11 text-[1rem]',
              hasError
                ? 'border-red500 focus-within:border-red500 focus-within:ring-red200 bg-white focus-within:ring-1'
                : 'border-gray200 hover:border-gray300 focus-within:border-blue400 focus-within:ring-blue200 bg-white focus-within:ring-1'
            )}
            onKeyDown={handleKeyDown}
            {...rest}
          />
          <div className="absolute inset-y-0 right-2 flex items-center">
            <CopyButton
              value={trimmedValue}
              successMsg="링크가 클립보드에 복사되었습니다."
              failMsg="링크 복사에 실패했습니다."
              tooltipMsg="링크 복사하기"
            />
          </div>
        </div>
        {hasError ? (
          <span id={errorId} className="text-red500 text-xs">
            {errorMessage}
          </span>
        ) : null}
      </div>
    );
  }
);

AddLinkUrlInput.displayName = 'AddLinkUrlInput';
export default AddLinkUrlInput;
