import { tv } from 'tailwind-variants';

export const style = tv({
  base: 'block rounded-full transition-colors duration-150',
  variants: {
    orientation: {
      horizontal: 'w-full',
      vertical: 'h-full',
    },
    color: {
      gray100: 'divider-gray100',
      gray200: 'divider-gray200',
      gray300: 'divider-gray300',
      gray400: 'divider-gray400',
    },
  },
});
