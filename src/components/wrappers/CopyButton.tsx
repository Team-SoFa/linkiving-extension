'use client';

import { showToast } from '@/stores/toastStore';
import { useEffect, useState } from 'react';

import IconButton, { IconButtonProps } from '../basics/IconButton/IconButton';
import Tooltip from '../basics/Tooltip/Tooltip';

interface CopyButtonProps extends Omit<IconButtonProps, 'ariaLabel' | 'icon'> {
  value: string;
  successMsg: string;
  failMsg: string;
  tooltipMsg: string;
  tooltipClassName?: string;
}

export default function CopyButton({
  value,
  size = 'sm',
  variant = 'tertiary_subtle',
  contextStyle = 'onMain',
  successMsg,
  failMsg,
  tooltipMsg,
  tooltipClassName,
  disabled,
  onClick,
  ...iconButtonProps
}: CopyButtonProps) {
  const [isClipboardSupported, setIsClipboardSupported] = useState(false);

  useEffect(() => {
    setIsClipboardSupported(Boolean(navigator.clipboard?.writeText));
  }, []);

  const isDisabled = Boolean(disabled) || !value || !isClipboardSupported;

  const handleCopyClick: NonNullable<IconButtonProps['onClick']> = async event => {
    onClick?.(event);
    if (isDisabled) {
      showToast({
        message: failMsg,
        variant: 'error',
        showIcon: true,
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      showToast({
        message: successMsg,
        variant: 'success',
        showIcon: true,
      });
    } catch {
      showToast({
        message: failMsg,
        variant: 'error',
        showIcon: true,
      });
    }
  };

  return (
    <Tooltip content={tooltipMsg} side="bottom" className={tooltipClassName}>
      <IconButton
        icon="IC_Copy"
        size={size}
        variant={variant}
        contextStyle={contextStyle}
        ariaLabel={tooltipMsg}
        disabled={isDisabled}
        onClick={handleCopyClick}
        {...iconButtonProps}
      />
    </Tooltip>
  );
}
