'use client';

import { Slot } from '@radix-ui/react-slot';
import { clsx } from 'clsx';
import React from 'react';

import SVGIcon from '../../Icons/SVGIcon';
import { IconMapTypes, buttonSizeMap } from '../../Icons/icons';
import Spinner from '../Spinner/Spinner';
import { style } from './Button.style';

export interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled' | 'onClick'
> {
  asChild?: boolean;
  className?: string;
  icon?: IconMapTypes;
  label?: string;
  variant?: 'primary' | 'secondary' | 'tertiary_neutral' | 'tertiary_subtle';
  contextStyle?: 'onPanel' | 'onMain';
  radius?: 'md' | 'full';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      children,
      className,
      icon,
      label,
      type = 'button',
      variant = 'primary',
      contextStyle = 'onPanel',
      radius = 'md',
      size = 'md',
      disabled = false,
      loading = false,
      onClick,
      ...rest
    },
    ref
  ) => {
    // STYLES
    const isDisabled = disabled || loading;
    const classes = style({
      variant,
      radius,
      contextStyle,
      size,
      disabled,
    });

    const Comp = asChild ? Slot : 'button'; // 인터랙션 요소 중첩 방지를 위해 Slot 적용

    return (
      <Comp
        ref={ref}
        className={clsx(classes, className)}
        disabled={isDisabled}
        type={type}
        aria-disabled={isDisabled}
        aria-busy={loading || undefined}
        onClick={isDisabled ? undefined : onClick}
        {...rest}
      >
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner size={size} />
            {label && <span className="sr-only">{label}</span>}
          </div>
        ) : asChild ? (
          children
        ) : (
          <div className="flex items-center gap-x-1">
            {icon && <SVGIcon icon={icon} size={buttonSizeMap[size]} />}
            <span className={icon ? 'pr-1' : ''}>{label}</span>
          </div>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';
export default Button;
