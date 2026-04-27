'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, FieldErrors } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

import { updateLink } from '@/apis/linkApi';
import Button from '@/components/basics/Button/Button';
import SVGIcon from '@/components/Icons/SVGIcon';
import Label from '@/components/basics/Label/Label';
import TextArea from '@/components/basics/TextArea/TextArea';
import { usePostLinks } from '@/hooks/usePostLinks';
import { showCurrentPageToast } from '@/lib/chrome/pageToast';
import { MAX_MEMO_LENGTH } from '@/lib/constants/link';
import { getUnsupportedTabReason, normalizeHttpUrl } from '@/lib/url';
import { showToast } from '@/stores/toastStore';

import AddLinkUrlInput from './AddLinkUrlInput';
import DuplicateBanner from './DuplicateBanner';
import { useAddLinkForm } from './hooks/useAddLinkForm';
import { useCreateLinkError } from './hooks/useCreateLinkError';
import { useDuplicateCheck } from './hooks/useDuplicateCheck';
import LinkThumbnailTitleSection from './LinkThumbnailTitleSection';

const DEFAULT_APP_URL = 'https://linkiving.com';
const APP_BASE_URL = process.env.NEXT_PUBLIC_EXTENSION_APP_URL ?? DEFAULT_APP_URL;

function appUrl(path = '') {
  return `${APP_BASE_URL.replace(/\/$/, '')}${path}`;
}

function getPopupSourceTab() {
  if (typeof window === 'undefined') {
    return { sourceTabUrl: null, sourceTabId: null };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const sourceTabUrl = searchParams.get('sourceTabUrl');
  const rawSourceTabId = searchParams.get('sourceTabId');
  const sourceTabId = rawSourceTabId ? Number(rawSourceTabId) : null;

  return {
    sourceTabUrl,
    sourceTabId: Number.isFinite(sourceTabId) ? sourceTabId : null,
  };
}

function closeExtensionPanel() {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'LINKIVING_CLOSE_OVERLAY' }, '*');
    return;
  }

  window.close();
}

function getHttpTabUrl(tab: chrome.tabs.Tab | undefined) {
  const tabUrl = tab?.url?.trim();
  if (!tabUrl || getUnsupportedTabReason(tabUrl)) {
    return null;
  }

  return normalizeHttpUrl(tabUrl);
}

async function findRecentHttpTab(excludedTabId: number | null) {
  if (typeof chrome === 'undefined' || !chrome.tabs?.query) {
    return null;
  }

  const tabs = await chrome.tabs.query({});
  const candidates = tabs
    .filter(tab => tab.id !== excludedTabId && getHttpTabUrl(tab))
    .sort((a, b) => {
      if (a.active !== b.active) {
        return a.active ? -1 : 1;
      }

      return (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0);
    });

  const tab = candidates[0];
  const url = getHttpTabUrl(tab);
  if (!tab || !url) {
    return null;
  }

  return { tabId: typeof tab.id === 'number' ? tab.id : null, url };
}

export default function AddLinkPanel() {
  const createLink = usePostLinks();
  const qc = useQueryClient();

  const [isUpdatingDuplicate, setIsUpdatingDuplicate] = useState(false);
  const [currentTabMessage, setCurrentTabMessage] = useState<string | null>(null);
  const isSubmitting = createLink.isPending || isUpdatingDuplicate;
  const lastMetaErrorRef = useRef<string | null>(null);
  const sourceTabRef = useRef(getPopupSourceTab());

  const {
    form,
    trimmedUrl,
    isValidUrl,
    urlErrorMessage,
    titleValue,
    memoValue,
    metaData,
    metaLoading,
    metaErrorMessage,
    shouldDisableDetails,
    previewImageUrl,
  } = useAddLinkForm();

  const { isDuplicate, duplicateLinkId, duplicateLinkData } = useDuplicateCheck(trimmedUrl, isValidUrl);
  const displayMetaLoading = isDuplicate ? false : metaLoading;
  const displayShouldDisableDetails = isDuplicate ? false : shouldDisableDetails;
  const displayPreviewImageUrl = isDuplicate
    ? duplicateLinkData?.imageUrl || previewImageUrl
    : previewImageUrl;

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
    setValue,
  } = form;

  const loadCurrentTabUrl = useCallback(
    async (force = false) => {
      const sourceTabUrl = sourceTabRef.current.sourceTabUrl?.trim();

      if (sourceTabUrl) {
        if (!force && getValues('url').trim()) {
          return;
        }

        const unsupportedReason = getUnsupportedTabReason(sourceTabUrl);
        if (unsupportedReason) {
          const fallbackTab = await findRecentHttpTab(sourceTabRef.current.sourceTabId);
          if (fallbackTab) {
            sourceTabRef.current = {
              sourceTabUrl: fallbackTab.url,
              sourceTabId: fallbackTab.tabId,
            };
            setCurrentTabMessage(null);
            setValue('url', fallbackTab.url, {
              shouldDirty: force,
              shouldValidate: true,
            });
            return;
          }

          setCurrentTabMessage(unsupportedReason);
          return;
        }

        const normalizedUrl = normalizeHttpUrl(sourceTabUrl);
        if (!normalizedUrl) {
          setCurrentTabMessage('현재 탭 주소 형식이 지원되지 않습니다. 직접 입력해 주세요.');
          return;
        }

        setCurrentTabMessage(null);
        setValue('url', normalizedUrl, {
          shouldDirty: force,
          shouldValidate: true,
        });
        return;
      }

      if (typeof chrome === 'undefined' || !chrome.tabs?.query) {
        return;
      }

      if (!force && getValues('url').trim()) {
        return;
      }

      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const currentTabUrl = tabs[0]?.url?.trim();
        const unsupportedReason = getUnsupportedTabReason(currentTabUrl);

        if (!currentTabUrl || unsupportedReason) {
          setCurrentTabMessage(unsupportedReason ?? '현재 탭의 주소를 읽지 못했습니다.');
          if (force) {
            showToast({
              message: unsupportedReason ?? '현재 탭의 주소를 읽지 못했습니다. 직접 입력해 주세요.',
              variant: 'warning',
            });
          }
          return;
        }

        const normalizedUrl = normalizeHttpUrl(currentTabUrl);
        if (!normalizedUrl) {
          setCurrentTabMessage('현재 탭 주소 형식이 지원되지 않습니다. 직접 입력해 주세요.');
          if (force) {
            showToast({
              message: '현재 탭 주소는 저장할 수 없는 형식입니다.',
              variant: 'warning',
            });
          }
          return;
        }

        setCurrentTabMessage(null);
        setValue('url', normalizedUrl, {
          shouldDirty: force,
          shouldValidate: true,
        });
      } catch {
        setCurrentTabMessage('현재 탭 주소를 자동으로 가져오지 못했습니다. 아래에 직접 입력할 수 있습니다.');
        if (force) {
          showToast({
            message: '현재 탭 주소를 불러오지 못했습니다. 권한과 페이지 상태를 확인해 주세요.',
            variant: 'error',
          });
        }
      }
    },
    [getValues, setValue]
  );

  useEffect(() => {
    if (!isDuplicate || !duplicateLinkData || metaLoading) return;
    const { title, memo } = form.formState.dirtyFields;
    if (title || memo) return;

    form.setValue('title', duplicateLinkData.title, {
      shouldValidate: true,
      shouldDirty: false,
    });
    form.setValue('memo', duplicateLinkData.memo ?? '', {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [isDuplicate, duplicateLinkData, metaLoading, form]);

  useEffect(() => {
    void loadCurrentTabUrl();
  }, [loadCurrentTabUrl]);

  useEffect(() => {
    if (!metaErrorMessage) {
      lastMetaErrorRef.current = null;
      return;
    }

    if (lastMetaErrorRef.current === metaErrorMessage) {
      return;
    }

    lastMetaErrorRef.current = metaErrorMessage;
    showToast({
      message: metaErrorMessage,
      variant: 'warning',
    });
  }, [metaErrorMessage]);

  const handleSaveSuccess = useCallback(
    async (message: string) => {
      const shownOnPage = await showCurrentPageToast(message, 'success', {
        actionLabel: '요약 확인',
        actionUrl: appUrl('/all-link'),
        sourceTabId: sourceTabRef.current.sourceTabId,
      });

      if (shownOnPage) {
        closeExtensionPanel();
        return;
      }

      showToast({
        message,
        variant: 'success',
      });
      reset({ url: '', title: '', memo: '' });
      void loadCurrentTabUrl(true);
    },
    [loadCurrentTabUrl, reset]
  );

  const handleCreateSuccess = useCallback(async () => {
    await handleSaveSuccess('링크가 저장되었습니다. 요약 생성을 시작합니다.');
  }, [handleSaveSuccess]);

  const { hasSubmitError, lastSubmitPayloadRef } = useCreateLinkError({
    createLink,
    trimmedUrl,
    titleValue,
    memoValue,
    onRetry: async payload => {
      await createLink.mutateAsync(payload);
      await handleCreateSuccess();
    },
  });

  const onSubmit = async (data: import('./hooks/useAddLinkForm').AddLinkForm) => {
    if (isDuplicate && duplicateLinkId) {
      try {
        setIsUpdatingDuplicate(true);
        await updateLink(duplicateLinkId, {
          title: data.title,
          memo: data.memo?.trim() || undefined,
          imageUrl: metaData?.image?.trim() || undefined,
        });
        await qc.invalidateQueries({ queryKey: ['links'], exact: false });
        await handleSaveSuccess('링크가 저장되었습니다. 요약 생성을 시작합니다.');
      } catch {
        showToast({
          message: '링크 덮어쓰기에 실패했습니다. 다시 시도해 주세요.',
          variant: 'error',
        });
      } finally {
        setIsUpdatingDuplicate(false);
      }
      return;
    }

    try {
      lastSubmitPayloadRef.current = {
        url: data.url,
        title: data.title,
        memo: data.memo?.trim() || undefined,
        imageUrl: metaData?.image?.trim() || undefined,
      };
      await createLink.mutateAsync(lastSubmitPayloadRef.current);
      await handleCreateSuccess();
    } catch {
      // handled in hook
    }
  };

  const onInvalidSubmit = (errors: FieldErrors<import('./hooks/useAddLinkForm').AddLinkForm>) => {
    const message =
      errors.url?.message ||
      errors.title?.message ||
      errors.memo?.message ||
      (!trimmedUrl ? '링크 주소를 입력해 주세요.' : '입력값을 다시 확인해 주세요.');

    showToast({
      message: String(message),
      variant: 'warning',
    });
  };

  const handleOpenHome = () => {
    window.open(appUrl(), '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    closeExtensionPanel();
  };

  return (
    <div className="flex flex-col overflow-hidden bg-gray50">
      <header className="border-gray100 flex h-16 items-center justify-between border-b px-6">
        <button
          type="button"
          className="font-label-sm text-gray500 flex items-center gap-2"
          onClick={handleOpenHome}
        >
          <SVGIcon icon="IC_Home" size="xxs" aria-hidden />
          <span>내 홈으로 이동</span>
        </button>
        <button
          type="button"
          className="text-gray500 hover:text-gray800 flex h-10 w-10 items-center justify-center rounded-lg"
          aria-label="닫기"
          onClick={handleClose}
        >
          <SVGIcon icon="IC_Close" size="xs" aria-hidden />
        </button>
      </header>
      <form
        onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
        className={`flex flex-col ${hasSubmitError ? 'border-red500' : 'border-transparent'}`}
      >
        {isDuplicate ? (
          <DuplicateBanner />
        ) : (
          <section className="border-gray100 border-b px-6 py-7">
            <h1 className="font-title-md mb-7 text-[1.375rem] text-gray900">새 링크 추가</h1>
            <div className="flex flex-col gap-3">
              <Label htmlFor="url-input" textSize="sm" className="text-gray900">
                링크 주소
              </Label>
              {currentTabMessage ? (
                <div className="rounded-lg border border-yellow200 bg-yellow50 px-3 py-2 text-xs text-yellow900">
                  {currentTabMessage}
                </div>
              ) : null}
              <Controller
                name="url"
                control={control}
                render={({ field }) => (
                  <AddLinkUrlInput
                    {...field}
                    id="url-input"
                    placeholder="URL을 입력해 주세요."
                    onChange={e => field.onChange(e)}
                    onBlur={e => {
                      let val = e.target.value.trim();
                      // 사용자가 입력한 값에 프로토콜이 없으면 자동으로 https:// 추가
                      if (val && !/^https?:\/\//i.test(val)) {
                        val = `https://${val}`;
                        form.setValue('url', val, { shouldValidate: true, shouldDirty: true });
                      }
                      field.onBlur();
                    }}
                    errorMessage={urlErrorMessage}
                    spellCheck={false}
                  />
                )}
              />
              {metaErrorMessage ? (
                <span className="text-red500 text-xs">{metaErrorMessage}</span>
              ) : null}
            </div>
          </section>
        )}

        <LinkThumbnailTitleSection
          control={control}
          errors={errors}
          metaLoading={displayMetaLoading}
          isValidUrl={isValidUrl}
          shouldDisableDetails={displayShouldDisableDetails}
          previewImageUrl={displayPreviewImageUrl}
          label={isDuplicate ? '기존 링크 정보' : '링크 정보'}
        />

        <section className="px-6 py-6">
          <Label htmlFor="memo-input" textSize="sm" className="mb-3 block text-gray900">
            메모
          </Label>
          <Controller
            name="memo"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                id="memo-input"
                placeholder="메모를 입력해 주세요."
                heightLines={3}
                maxLength={MAX_MEMO_LENGTH}
                isLoading={displayMetaLoading && isValidUrl}
                disabled={displayShouldDisableDetails}
                value={field.value ?? ''}
                onChange={e => field.onChange(e)}
                className="border-gray100 min-h-[5rem] bg-white"
              />
            )}
          />
        </section>

        <div className={`px-6 pb-6 ${isDuplicate && duplicateLinkId ? 'grid grid-cols-2 gap-2' : ''}`}>
          {isDuplicate && duplicateLinkId ? (
            <Button
              type="button"
              variant="secondary"
              label="기존 링크 유지"
              size="md"
              className="w-full rounded-lg"
              onClick={() => void handleSaveSuccess('기존에 저장한 링크 정보를 유지합니다.')}
            />
          ) : null}
          <Button
            type="submit"
            label={isSubmitting ? '저장 중...' : isDuplicate ? '새로 덮어쓰기' : '저장하기'}
            disabled={displayMetaLoading || isSubmitting}
            size="md"
            className="w-full rounded-lg bg-gray900 text-white hover:bg-gray800"
          />
        </div>
      </form>
    </div>
  );
}
