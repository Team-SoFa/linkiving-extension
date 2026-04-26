import { tv } from 'tailwind-variants';

export const style = tv({
  base: 'inline-flex min-h-16 items-center rounded-2xl py-4 pr-8 pl-7 shadow-md transition-opacity duration-300',
  variants: {
    variant: {
      success: 'bg-green500 text-white',
      error: 'bg-red500 text-white',
      info: 'bg-skyblue500 text-white',
      warning: 'bg-yellow500 text-gray900',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});
