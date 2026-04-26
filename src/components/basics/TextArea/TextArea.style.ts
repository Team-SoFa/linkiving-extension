import { tv } from 'tailwind-variants';

export const wholeBoxStyle = tv({
  base: 'relative inline-block w-full pt-2 pr-1 pl-3',
  variants: {
    radius: {
      md: 'rounded',
      lg: 'rounded-lg',
      full: 'rounded-full',
    },
    color: {
      white: 'border-gray100 focus-within:border-gray300 border bg-white',
      blue: 'bg-blue50',
    },
    showMax: {
      true: 'pb-8',
      false: '',
    },
    disabled: {
      true: 'border-gray200 bg-gray100 text-gray500 pointer-events-none',
      false: '',
    },
  },
});

export const textAreaStyle = tv({
  base: 'placeholder:text-gray500 text-gray900 custom-scrollbar w-full resize-none pr-3 focus:outline-none',
  variants: {
    textSize: {
      sm: 'font-body-sm',
      md: 'font-body-md',
      lg: 'font-body-lg',
    },
  },
});
