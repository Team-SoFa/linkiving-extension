'use client';

import { Slot } from '@radix-ui/react-slot';
import { clsx } from 'clsx';
import React from 'react';

import SVGIcon from '../../Icons/SVGIcon';
import { IconMapTypes, buttonSizeMap } from '../../Icons/icons';
import { style } from './IconButton.style';

export interface IconButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'onClick'
> {
  asChild?: boolean;
  className?: string;
  icon: IconMapTypes; // icon 타입을 .svg 파일로 강제
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'tertiary_neutral' | 'tertiary_subtle';
  contextStyle?: 'onPanel' | 'onMain'; // tertiary_subtle 버튼에서만 사용 (내부적으로 강제됨)
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  ariaLabel: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      asChild = false,
      children,
      className,
      icon,
      type = 'button',
      variant = 'primary',
      contextStyle = 'onMain',
      size = 'md',
      disabled = false,
      ariaLabel,
      onClick,
      ...rest
    },
    ref
  ) => {
    // STYLES
    const classes = style({ variant, contextStyle, size, disabled });

    // 인터랙션 요소 중첩 방지를 위해 Slot 적용
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={clsx(classes, className)}
        disabled={disabled}
        type={type}
        aria-label={ariaLabel}
        onClick={onClick}
        {...rest}
      >
        {asChild ? (
          children
        ) : (
          <SVGIcon icon={icon} size={buttonSizeMap[size]} className="shrink-0" aria-hidden="true" />
        )}
      </Comp>
    );
  }
);

IconButton.displayName = 'IconButton';
export default IconButton;
