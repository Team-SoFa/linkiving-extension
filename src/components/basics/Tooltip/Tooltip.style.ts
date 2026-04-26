import { tv } from 'tailwind-variants';

export const style = tv({
  base: [
    'pointer-events-none absolute z-50 transform rounded bg-black px-2 py-1 text-xs leading-tight font-medium tracking-wide whitespace-nowrap text-white shadow-lg',
  ],
  variants: {
    side: {
      top: 'bottom-[calc(100%+var(--tooltip-offset))] left-1/2 -translate-x-1/2',
      bottom: 'top-[calc(100%+var(--tooltip-offset))] left-1/2 -translate-x-1/2',
      left: 'top-1/2 right-[calc(100%+var(--tooltip-offset))] -translate-y-1/2',
      right: 'top-1/2 left-[calc(100%+var(--tooltip-offset))] -translate-y-1/2',
    },
  },
  defaultVariants: {
    side: 'bottom',
  },
});
