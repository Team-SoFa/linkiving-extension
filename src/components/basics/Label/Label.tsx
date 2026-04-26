import clsx from 'clsx';
import React, { LabelHTMLAttributes, forwardRef } from 'react';

import { style } from './Label.style';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
  textColor?: string;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, textSize = 'md', textColor = undefined, ...props }, ref) => {
    const classes = style({
      textSize,
    });

    return (
      <label className={clsx(classes, textColor, className)} {...props} ref={ref}>
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';

export default Label;
