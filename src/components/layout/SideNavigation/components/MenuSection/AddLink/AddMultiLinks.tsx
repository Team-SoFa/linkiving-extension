'use client';

import Anchor from '@/components/basics/Anchor/Anchor';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import Button from '@/components/basics/Button/Button';
import IconButton from '@/components/basics/IconButton/IconButton';
import Label from '@/components/basics/Label/Label';
import Skeleton from '@/components/basics/Skeleton/Skeleton';
import TextArea from '@/components/basics/TextArea/TextArea';
import { useDuplicateLinkMutation } from '@/hooks/useCheckDuplicateLink';
import { usePostLinkMetaScrape } from '@/hooks/usePostLinkMetaScrape';
import { usePostLinks } from '@/hooks/usePostLinks';
import { getReadableUrlLabel, normalizeHttpUrl } from '@/lib/url';
import { showToast } from '@/stores/toastStore';

import AddLinkUrlInput from './AddLinkUrlInput';

interface LinkItem {
  id: string;
  url: string;
  title: string;
  memo: string;
  thumbnailUrl: string | null;
  status: 'loading' | 'success' | 'error';
}

export default function AddMultiLinks({ onToggle }: { onToggle: () => void }) {
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const duplicateCheck = useDuplicateLinkMutation();
  const metaScrape = usePostLinkMetaScrape();
  const queryClient = useQueryClient();
  const createLink = usePostLinks({ skipInvalidate: true });

  const handleAdd = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed || isChecking) return;

    const normalizedUrl = normalizeHttpUrl(trimmed);
    if (!normalizedUrl) {
      setUrlError('유효하지 않은 링크 주소입니다. URL을 다시 확인해 주세요.');
      return;
    }

    if (links.some(link => link.url === normalizedUrl)) {
      setUrlError('이미 추가한 주소입니다.');
      return;
    }

    setIsChecking(true);
    try {
      const { exists } = await duplicateCheck.mutateAsync(normalizedUrl);
      if (exists) {
        setUrlError('이미 저장된 주소입니다.');
        setIsChecking(false);
        return;
      }
    } catch {
      // allow continue
    }
    setIsChecking(false);

    const newId = crypto.randomUUID();
    setLinks(prev => [
      ...prev,
      { id: newId, url: normalizedUrl, title: '', memo: '', thumbnailUrl: null, status: 'loading' },
    ]);
    setUrlInput('');
    inputRef.current?.focus();

    try {
      const meta = await metaScrape.mutateAsync(normalizedUrl);
      setLinks(prev =>
        prev.map(link =>
          link.id === newId
            ? {
                ...link,
                title: meta.title?.trim() || getReadableUrlLabel(normalizedUrl),
                memo: meta.description?.trim() || '',
                thumbnailUrl: meta.image ?? null,
                status: 'success',
              }
            : link
        )
      );
    } catch {
      setLinks(prev =>
        prev.map(link =>
          link.id === newId
            ? {
                ...link,
                title: getReadableUrlLabel(normalizedUrl),
                status: 'error',
              }
            : link
        )
      );
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    const results = await Promise.allSettled(
      links.map(link =>
        createLink.mutateAsync({
          url: link.url,
          title: link.title || link.url,
          memo: link.memo || undefined,
          imageUrl: link.thumbnailUrl || undefined,
        })
      )
    );

    const successCount = results.filter(result => result.status === 'fulfilled').length;
    const failCount = results.filter(result => result.status === 'rejected').length;

    if (successCount > 0) {
      await queryClient.invalidateQueries({ queryKey: ['links'], exact: false });
    }

    setLinks(prev => prev.filter((_, index) => results[index].status === 'rejected'));
    setIsSaving(false);

    if (failCount === 0) {
      showToast({ message: `${successCount}개 링크가 저장되었습니다.`, variant: 'success' });
      return;
    }

    showToast({
      message: `${successCount}개 저장 완료, ${failCount}개 저장에 실패했습니다.`,
      variant: 'error',
    });
  };

  const isLoading = links.some(link => link.status === 'loading');

  return (
    <div className="m-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-title-sm">새 링크 추가</h2>
        <Button variant="secondary" size="sm" label="한 개씩 추가하기" onClick={onToggle} />
      </div>

      <div className="flex flex-col gap-1">
        <Label>링크 주소</Label>
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <AddLinkUrlInput
              ref={inputRef}
              value={urlInput}
              id="multi-url-input"
              placeholder="URL을 입력하고 추가하세요."
              onChange={value => {
                setUrlInput(value);
                setUrlError(null);
              }}
              errorMessage={urlError ?? undefined}
            />
          </div>
          <IconButton
            icon="IC_LinkAdd"
            variant="tertiary_subtle"
            contextStyle="onPanel"
            ariaLabel="저장할 링크 리스트에 추가"
            onClick={handleAdd}
            disabled={isChecking || !!urlError}
          />
        </div>
      </div>

      {links.length > 0 ? (
        <div className="flex flex-col overflow-hidden">
          <div className="grid grid-cols-[6rem_1fr_1fr_2rem] gap-3 border-b border-gray-200 px-3 py-2">
            <span className="text-gray500 font-body-sm">썸네일</span>
            <span className="text-gray500 font-body-sm">제목 / 링크</span>
            <span className="text-gray500 font-body-sm">메모</span>
            <span />
          </div>
          <div className="custom-scrollbar max-h-72 overflow-x-hidden overflow-y-auto">
            {links.map(link => (
              <div
                key={link.id}
                className="grid grid-cols-[6rem_1fr_1fr_2rem] items-center gap-3 px-3 py-2.5"
              >
                <div className="bg-gray100 relative h-14 w-full shrink-0 overflow-hidden rounded-md">
                  {link.status === 'loading' ? (
                    <Skeleton className="h-full w-full" radius="lg" animated />
                  ) : link.thumbnailUrl ? (
                    <Image src={link.thumbnailUrl} alt="" fill className="object-cover" />
                  ) : (
                    <Image
                      src="/images/default_linkcard_image.png"
                      alt=""
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="flex max-w-80 min-w-0 flex-col gap-1">
                  {link.status === 'loading' ? (
                    <>
                      <Skeleton className="h-3.5 w-3/4 rounded" animated />
                      <Skeleton className="h-3 w-1/2 rounded" animated />
                    </>
                  ) : (
                    <>
                      <TextArea
                        value={link.title}
                        placeholder="제목을 직접 입력해 주세요."
                        textSize="sm"
                        onChange={e =>
                          setLinks(prev =>
                            prev.map(item =>
                              item.id === link.id ? { ...item, title: e.target.value } : item
                            )
                          )
                        }
                        heightLines={1}
                        maxHeightLines={1}
                      />
                      <Anchor href={link.url}>{link.url}</Anchor>
                    </>
                  )}
                </div>

                <div className="max-w-80 min-w-0">
                  {link.status === 'loading' ? (
                    <div className="h-3.5 w-full animate-pulse rounded bg-gray-200" />
                  ) : (
                    <TextArea
                      value={link.memo}
                      heightLines={2}
                      textSize="sm"
                      placeholder="메모를 입력해주세요"
                      onChange={e =>
                        setLinks(prev =>
                          prev.map(item =>
                            item.id === link.id ? { ...item, memo: e.target.value } : item
                          )
                        )
                      }
                    />
                  )}
                </div>

                <IconButton
                  icon="IC_Delete"
                  variant="tertiary_subtle"
                  contextStyle="onPanel"
                  ariaLabel="링크 리스트에서 삭제"
                  onClick={() => setLinks(prev => prev.filter(item => item.id !== link.id))}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <Button
        label={isSaving ? '저장 중...' : isLoading ? '크롤링 중...' : `${links.length}개 저장하기`}
        disabled={links.length === 0 || isLoading || isSaving}
        onClick={handleSave}
      />
    </div>
  );
}
