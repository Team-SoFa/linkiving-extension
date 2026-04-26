'use client';

import AddLinkPanel from '@/components/layout/SideNavigation/components/MenuSection/AddLink';

export default function Page() {
  return (
    <main className="min-h-screen bg-transparent">
      <div className="mx-auto flex w-[40rem] flex-col overflow-hidden rounded-2xl border border-gray100 bg-gray50 shadow-lg">
        <AddLinkPanel />
      </div>
    </main>
  );
}
