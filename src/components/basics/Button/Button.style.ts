import { tv } from 'tailwind-variants';

export const style = tv({
  base: 'inline-flex cursor-pointer items-center justify-center rounded-full whitespace-nowrap transition-all duration-150',
  variants: {
    variant: {
      primary: 'bg-btn-primary border-btn-primary text-btn-primary border',
      secondary: 'bg-btn-secondary border-btn-secondary text-btn-secondary border',
      tertiary_neutral:
        'bg-btn-tertiary-neutral border-btn-tertiary-neutral text-btn-tertiary-neutral border',
      tertiary_subtle: 'text-btn-tertiary-subtle border-btn-tertiary-subtle border',
    },
    radius: {
      md: 'rounded-lg',
      full: 'rounded-full',
    },
    contextStyle: {
      onMain: '',
      onPanel: '',
    },
    size: {
      sm: 'font-label-sm h-8 px-3',
      md: 'font-label-md h-10 px-4',
      lg: 'font-label-lg h-12 px-5',
    },
    disabled: {
      true: 'pointer-events-none cursor-not-allowed',
      false: '',
    },
  },
  compoundVariants: [
    {
      variant: 'tertiary_subtle',
      contextStyle: 'onPanel',
      className: 'bg-btn-tertiary-subtle-onpanel',
    },
    {
      variant: 'tertiary_subtle',
      contextStyle: 'onMain',
      className: 'bg-btn-tertiary-subtle-onmain',
    },
  ],
});
