'use client';

import AddLinkPanel from '@/components/layout/SideNavigation/components/MenuSection/AddLink';
import ExtensionAuthPanel from '@/components/wrappers/ExtensionAuthPanel';
import ExtensionHeader from '@/components/wrappers/ExtensionHeader';
import { useExtensionAuth } from '@/hooks/useExtensionAuth';
import { useEffect, useRef } from 'react';

export default function Page() {
  const { status, refresh } = useExtensionAuth();
  const panelRef = useRef<HTMLDivElement>(null);
  const authenticated = status === 'authenticated';

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || window.parent === window) return;
    const resize = () => {
      window.parent.postMessage({
        type: 'LINKIVING_RESIZE_OVERLAY',
        height: Math.ceil(panel.getBoundingClientRect().height),
      }, '*');
    };
    const observer = new ResizeObserver(resize);
    observer.observe(panel);
    resize();
    return () => observer.disconnect();
  }, []);

  return (
    <main className="max-h-dvh overflow-y-auto bg-transparent">
      <div
        ref={panelRef}
        className="mx-auto flex w-full max-w-[40rem] flex-col rounded-2xl border border-gray100 bg-gray50"
      >
        <ExtensionHeader />
        {authenticated ? (
          <AddLinkPanel />
        ) : (
          <ExtensionAuthPanel status={status} onRetry={() => void refresh()} />
        )}
      </div>
    </main>
  );
}
