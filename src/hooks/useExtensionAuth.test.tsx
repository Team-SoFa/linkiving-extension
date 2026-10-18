// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ExtensionAuthPanel from '@/components/wrappers/ExtensionAuthPanel';
import { useExtensionAuthStore } from '@/stores/extensionAuthStore';
import { useExtensionAuth } from './useExtensionAuth';

const { resolveToken, request } = vi.hoisted(() => ({
  resolveToken: vi.fn(), request: vi.fn(),
}));
vi.mock('@/lib/chrome/auth', () => ({ resolveExtensionAccessToken: resolveToken }));
vi.mock('@/lib/api/client', () => ({ backendApiClient: request }));
vi.mock('@/components/basics/Spinner/Spinner', () => ({ default: () => null }));

let root: Root;
let container: HTMLDivElement;
function Screen() {
  const { status, refresh } = useExtensionAuth();
  return status === 'authenticated' ? <div>저장 폼</div> :
    <ExtensionAuthPanel status={status} onRetry={refresh} />;
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  useExtensionAuthStore.setState({ status: 'checking', hasAuthenticated: false });
  resolveToken.mockReset().mockResolvedValue(null);
  request.mockReset().mockResolvedValue({});
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('포커스 복귀 시 인증 재확인', () => {
  it.each(['signed-out', 'logged-out', 'expired'] as const)(
    '%s 안내의 같은 버튼이 인증 응답 전 첫 클릭을 처리한다', async status => {
      await act(async () => root.render(<Screen />));
      await act(async () => useExtensionAuthStore.setState({ status }));
      let complete!: (value: null) => void;
      resolveToken.mockReturnValueOnce(new Promise(resolve => { complete = resolve; }));
      const open = vi.spyOn(window, 'open').mockImplementation(() => null);
      const button = container.querySelector('button')!;
      await act(async () => {
        button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        window.dispatchEvent(new Event('focus'));
      });
      expect(container.querySelector('button')).toBe(button);
      await act(async () => {
        button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        button.click();
      });
      expect(open).toHaveBeenCalledTimes(1);
      await act(async () => complete(null));
    }
  );

  it('최초 인증이 끝나기 전에는 로딩 화면을 유지한다', async () => {
    resolveToken.mockReturnValueOnce(new Promise(() => {}));
    await act(async () => root.render(<Screen />));
    expect(container.textContent).toContain('로그인 상태 확인 중');
    expect(container.querySelector('button')).toBeNull();
  });

  it('웹 로그인 후 복귀하면 폼을 표시하고 쿠키가 없으면 안내로 돌아간다', async () => {
    await act(async () => root.render(<Screen />));
    resolveToken.mockResolvedValue('test-token');
    await act(async () => window.dispatchEvent(new Event('focus')));
    expect(container.textContent).toBe('저장 폼');
    expect(request).toHaveBeenCalledWith('/v1/member/me', expect.any(Object));
    resolveToken.mockResolvedValue(null);
    await act(async () => window.dispatchEvent(new Event('focus')));
    expect(container.textContent).toContain('로그아웃 되었습니다.');
    expect(container.textContent).not.toContain('저장 폼');
  });
});
