'use client';

import SVGIcon from '@/components/Icons/SVGIcon';
import clsx from 'clsx';
import Image from 'next/image';
import { HTMLAttributes, ReactNode, forwardRef, memo, useEffect, useMemo, useState } from 'react';

import { style } from './Anchor.style';

interface AnchorProps extends Omit<
  HTMLAttributes<HTMLAnchorElement>,
  'href' | 'children' | 'target'
> {
  className?: string;
  iconVisible?: boolean;
  ariaLabel?: string;
  children: ReactNode;
  href: string; // 링크 URL
  rel?: 'noopener' | 'noreferrer' | 'nofollow' | 'ugc' | 'sponsored' | (string & {});
  target?: '_self' | '_blank' | '_parent' | '_top';
  size?: 'sm' | 'md';
}

const getFaviconUrl = (href: string) => {
  try {
    const { hostname } = new URL(href);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return null;
  }
};

const Anchor = forwardRef<HTMLAnchorElement, AnchorProps>(function Anchor(
  {
    className,
    iconVisible = true,
    children,
    href,
    target = '_self',
    ariaLabel,
    rel = 'noopener noreferrer',
    size = 'md',
    ...rest
  },
  ref
) {
  const [faviconError, setFaviconError] = useState(false);

  // href 바뀌면 에러 초기화
  useEffect(() => {
    setFaviconError(false);
  }, [href]);
  // === STYLES ===
  const classes = style({ size });

  const sizeMap = {
    sm: 'xs',
    md: 'sm',
  } as const;

  const finalRel = useMemo(() => {
    const tokens = new Set((rel ?? '').split(/\s+/).filter(Boolean));
    if (target === '_blank') tokens.add('noopener'); // window.opener 방지
    return tokens.size ? Array.from(tokens).join(' ') : undefined;
  }, [rel, target]);

  const faviconUrl = useMemo(() => getFaviconUrl(href), [href]);

  const iconSizeMap = { sm: 12, md: 16 } as const;

  return (
    <a
      ref={ref}
      href={href}
      target={target}
      rel={finalRel}
      aria-label={ariaLabel}
      className={clsx(classes, className)}
      {...rest}
    >
      {}
      {iconVisible &&
        (faviconUrl && !faviconError ? (
          <Image
            src={faviconUrl}
            width={iconSizeMap[size]}
            height={iconSizeMap[size]}
            alt=""
            aria-hidden="true"
            onError={() => setFaviconError(true)} // 파비콘 없으면 기존 아이콘으로 폴백
          />
        ) : (
          <SVGIcon icon="IC_LinkOpen" size={sizeMap[size]} aria-hidden="true" className="mb-px" />
        ))}
      <span className="truncate">{children}</span>
    </a>
  );
});

export default memo(Anchor);
