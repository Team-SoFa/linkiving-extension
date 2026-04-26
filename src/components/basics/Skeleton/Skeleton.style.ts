import { tv } from 'tailwind-variants';

export const styles = tv({
  base: 'bg-gray100 relative isolate overflow-hidden text-transparent select-none',
  variants: {
    radius: {
      none: 'rounded-none',
      sm: 'rounded',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    },
    animated: {
      true: 'animate-pulse',
      false: '',
    },
  },
});
