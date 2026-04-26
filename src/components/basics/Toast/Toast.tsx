'use client';

import SVGIcon from '@/components/Icons/SVGIcon';
import { IconMapTypes } from '@/components/Icons/icons';
import { useTimeoutFn } from '@reactuses/core';
import clsx from 'clsx';
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import Button from '../Button/Button';
import { style } from './Toast.style';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  // 동작 관련 props
  id: string;
  message: React.ReactNode;
  duration?: number;

  // 스타일링 관련 props
  variant?: ToastVariant;
  className?: string;
  showIcon?: boolean;
  actionLabel?: string;
  actionLabelIcon?: IconMapTypes;
  onAction?: () => void;

  // 콜백 props
  onClose: (id: string) => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(function Toast(
  {
    id,
    message,
    duration = 5000,
    variant = 'info',
    className,
    showIcon = true,
    actionLabel,
    actionLabelIcon = 'IC_SendOutline',
    onAction,
    onClose,
    ...rest
  },
  ref
) {
  const [isClosing, setIsClosing] = useState(false);
  const hasClosedRef = useRef(false);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => nodeRef.current as HTMLDivElement);

  const FADE_DURATION_MS = 300;

  const closeWithFade = useCallback(() => {
    if (hasClosedRef.current) return;
    hasClosedRef.current = true;
    setIsClosing(true);
    setTimeout(() => onClose(id), FADE_DURATION_MS);
  }, [id, onClose]);

  const [, startAutoClose, clearAutoClose] = useTimeoutFn(() => closeWithFade(), duration, {
    immediate: false,
  });

  // 자동 닫기
  useEffect(() => {
    if (duration && duration > 0) {
      startAutoClose();
      return clearAutoClose;
    }
    return undefined;
  }, [clearAutoClose, duration, startAutoClose]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!nodeRef.current || !target) return;
      if (nodeRef.current.contains(target)) return;
      closeWithFade();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [closeWithFade]);

  const classes = style({ variant });
  const iconMap: Record<ToastVariant, IconMapTypes> = {
    success: 'IC_Complete',
    info: 'IC_Info',
    warning: 'IC_Warning',
    error: 'IC_Error',
  };

  return (
    <div
      ref={nodeRef}
      className={clsx(className, classes, 'pointer-events-auto', {
        'opacity-0': isClosing,
        'opacity-100': !isClosing,
      })}
      role="status"
      aria-live="polite"
      {...rest}
    >
      {showIcon && (
        <SVGIcon
          className="mr-3 shrink-0 text-inherit"
          icon={iconMap[variant]}
          size="xl"
          aria-hidden="true"
        />
      )}
      <div className="flex flex-1 items-center">
        <div className="leading-6 font-semibold whitespace-pre-wrap">{message}</div>
        {actionLabel && (
          <Button
            className={clsx(showIcon ? 'ml-7.5' : 'ml-4')}
            size="sm"
            variant="tertiary_neutral"
            radius="md"
            contextStyle="onPanel"
            icon={actionLabelIcon}
            onClick={onAction}
            label={actionLabel}
          />
        )}
      </div>
    </div>
  );
});

export default Toast;
