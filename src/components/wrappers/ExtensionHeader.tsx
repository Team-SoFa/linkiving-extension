import SVGIcon from '@/components/Icons/SVGIcon';
import { closeExtensionPanel, openLinkiving } from '@/lib/chrome/navigation';

export default function ExtensionHeader() {
  return (
    <header className="border-gray100 flex h-14 shrink-0 items-center justify-between border-b px-6">
      <button
        type="button"
        className="font-label-md text-gray500 flex items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
        onClick={openLinkiving}
      >
        <SVGIcon icon="IC_LinkOpen" size="xs" aria-hidden />
        <span>링카이빙 바로가기</span>
      </button>
      <button
        type="button"
        className="text-gray500 hover:text-gray800 flex h-10 w-10 items-center justify-center rounded-lg focus-visible:outline-2"
        aria-label="닫기"
        onClick={closeExtensionPanel}
      >
        <SVGIcon icon="IC_Close" size="xs" aria-hidden />
      </button>
    </header>
  );
}
