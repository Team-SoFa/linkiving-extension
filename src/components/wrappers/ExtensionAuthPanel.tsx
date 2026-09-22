import Button from '@/components/basics/Button/Button';
import Spinner from '@/components/basics/Spinner/Spinner';
import { openLinkiving } from '@/lib/chrome/navigation';
import type { ExtensionAuthStatus } from '@/stores/extensionAuthStore';

const messages = {
  'signed-out': {
    title: '로그인이 필요합니다.',
    description: '링카이빙 웹사이트에서 로그인한 뒤\n원하는 링크를 저장해 보세요.',
  },
  'logged-out': {
    title: '로그아웃 되었습니다.',
    description: '링크를 저장하려면 다시 로그인해 주세요.\n링카이빙 웹사이트에서 로그인할 수 있습니다.',
  },
  expired: {
    title: '로그아웃 되었습니다.',
    description: '로그인 세션이 만료되어 로그아웃 되었습니다.\n링크를 저장하려면 다시 로그인해 주세요.',
  },
  unavailable: {
    title: '로그인 상태를 확인하지 못했습니다.',
    description: '연결 상태를 확인한 뒤 다시 시도해 주세요.',
  },
};

export default function ExtensionAuthPanel({
  status,
  onRetry,
}: {
  status: Exclude<ExtensionAuthStatus, 'authenticated'>;
  onRetry: () => void;
}) {
  if (status === 'checking') {
    return (
      <div className="text-gray600 flex min-h-48 items-center justify-center gap-3 px-6">
        <Spinner ariaLabel="로그인 상태 확인 중" />
        <span className="font-body-md">로그인 상태 확인 중...</span>
      </div>
    );
  }

  const { title, description } = messages[status];
  return (
    <section aria-labelledby="auth-heading">
      <div className="border-gray100 border-b px-6 py-6 text-center" aria-live="polite">
        <h1 id="auth-heading" className="font-title-md text-gray900 mb-4">
          {title}
        </h1>
        <p className="font-body-md text-gray700 whitespace-pre-line">{description}</p>
      </div>
      <div className="px-6 py-4">
        <Button
          label={status === 'unavailable' ? '다시 시도' : '로그인하러 가기'}
          onClick={status === 'unavailable' ? onRetry : openLinkiving}
          className="w-full rounded-lg bg-gray900 text-white hover:bg-gray800 focus-visible:outline-2 focus-visible:outline-offset-4"
          size="lg"
        />
      </div>
    </section>
  );
}
