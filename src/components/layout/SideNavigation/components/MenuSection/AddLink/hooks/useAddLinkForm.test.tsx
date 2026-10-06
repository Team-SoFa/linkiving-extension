// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import LinkThumbnailTitleSection from '../LinkThumbnailTitleSection';
import { useAddLinkForm } from './useAddLinkForm';

const { mutateAsync, reset } = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  reset: vi.fn(),
}));

vi.mock('@/hooks/usePostLinkMetaScrape', () => ({
  usePostLinkMetaScrape: () => ({ mutateAsync, reset, status: 'idle' }),
}));
vi.mock('@/components/basics/Spinner/Spinner', () => ({ default: () => null }));
vi.mock('next/image', () => ({ default: () => null }));

const failureMessage = '링크 정보를 불러오지 못했습니다. 제목을 직접 입력해 주세요.';
const emptyMeta = { title: '', image: '', description: '', url: 'https://example.com/' };
let current: ReturnType<typeof useAddLinkForm>;
let root: Root;
let container: HTMLDivElement;

function Form() {
  current = useAddLinkForm();
  return (
    <>
      <LinkThumbnailTitleSection
        control={current.form.control}
        errors={current.form.formState.errors}
        metaLoading={current.metaLoading}
        isValidUrl={current.isValidUrl}
        shouldDisableDetails={current.shouldDisableDetails}
        previewImageUrl={current.previewImageUrl}
      />
      <textarea id="memo-input" {...current.form.register('memo')} />
    </>
  );
}

async function collectMetadata() {
  await act(async () => {
    current.form.setValue('url', 'https://example.com/', { shouldValidate: true });
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(500);
  });
  await act(async () => { await vi.advanceTimersByTimeAsync(20); });
}

async function typeTitle(value: string) {
  const input = container.querySelector<HTMLTextAreaElement>('#title-input')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

beforeEach(async () => {
  vi.useFakeTimers();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  mutateAsync.mockReset();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<Form />));
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('메타 수집 실패 후 제목 입력', () => {
  it.each([
    ['빈 메타', { ...emptyMeta, url: '' }],
    ['URL만 있는 응답', emptyMeta],
    ['이미지만 있는 응답', { ...emptyMeta, image: 'https://example.com/image.png' }],
  ])('%s는 자동 제목 오류 없이 직접 입력을 안내한다', async (_, metadata) => {
    mutateAsync.mockResolvedValue(metadata);
    await collectMetadata();

    expect(current.titleValue).toBe('');
    expect(current.form.formState.errors.title).toBeUndefined();
    expect(current.metaErrorMessage).toBe(failureMessage);
    const title = container.querySelector<HTMLTextAreaElement>('#title-input')!;
    expect(document.activeElement).toBe(title);
    expect(title.placeholder).toBe('제목을 입력해 주세요.');
    expect(container.textContent).toContain('(0/100)');
    expect(container.textContent).not.toContain('제목을 입력해 주세요.');

    // 포커스만 받고 나간 빈 칸에도 사용자 입력 오류를 노출하지 않는다.
    await act(async () => container.querySelector<HTMLTextAreaElement>('#memo-input')!.focus());
    expect(container.textContent).not.toContain('제목을 입력해 주세요.');
  });

  it('요청 실패 후에도 빈 제목 오류 없이 포커스를 제공한다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mutateAsync.mockRejectedValue(new Error('Request timed out'));
    await collectMetadata();

    expect(current.metaErrorMessage).toBe(failureMessage);
    expect(current.form.formState.errors.title).toBeUndefined();
    expect(document.activeElement?.id).toBe('title-input');
  });

  it('직접 입력한 제목은 검증을 통과하고, 전부 삭제하면 입력 오류를 표시한다', async () => {
    mutateAsync.mockResolvedValue(emptyMeta);
    await collectMetadata();
    await typeTitle('직접 입력한 제목');

    let valid = false;
    await act(async () => { valid = await current.form.trigger(); });
    expect(valid).toBe(true);
    expect(current.titleValue).toBe('직접 입력한 제목');
    expect(container.textContent).toContain('(9/100)');

    await typeTitle('');
    expect(current.titleValue).toBe('');
    expect(container.textContent).toContain('제목을 입력해 주세요.');
  });

  it('제목만 성공하면 수집 제목을 채우고 실패 안내를 표시하지 않는다', async () => {
    mutateAsync.mockResolvedValue({ ...emptyMeta, title: '수집한 제목' });
    await collectMetadata();

    expect(current.titleValue).toBe('수집한 제목');
    expect(current.metaErrorMessage).toBeNull();
    expect(current.previewImageUrl).toBe('/images/default_linkcard_image.png');
  });

  it('사용자 제목이 있으면 실패 후에도 제목과 현재 포커스를 유지한다', async () => {
    mutateAsync.mockResolvedValue({ ...emptyMeta, title: '수집한 제목' });
    await collectMetadata();
    await typeTitle('내 제목');
    const memo = container.querySelector<HTMLTextAreaElement>('#memo-input')!;
    await act(async () => memo.focus());
    mutateAsync.mockResolvedValue(emptyMeta);
    await act(async () => current.form.setValue('url', 'https://example.com/next'));
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    await act(async () => { await vi.advanceTimersByTimeAsync(20); });

    expect(current.titleValue).toBe('내 제목');
    expect(document.activeElement).toBe(memo);
  });
});
