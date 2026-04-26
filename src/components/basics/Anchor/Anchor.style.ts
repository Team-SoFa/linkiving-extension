import { tv } from 'tailwind-variants';

export const style = tv({
  base: 'text-anchor flex items-center gap-1 hover:underline [&>svg]:shrink-0 [&>svg]:text-inherit [&>svg]:transition-colors [&>svg]:duration-150 [&>svg]:ease-in-out',
  variants: {
    size: {
      sm: 'font-anchor-sm',
      md: 'font-anchor-md',
    },
  },
});
