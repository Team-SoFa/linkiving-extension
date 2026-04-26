import { useLinkMetaScrape } from '@/hooks/useLinkMetaScrape';
import { MAX_MEMO_LENGTH } from '@/lib/constants/link';
import { getReadableUrlLabel, normalizeHttpUrl } from '@/lib/url';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

const addLinkSchema = z.object({
  url: z
    .string()
    .trim()
    .refine(value => normalizeHttpUrl(value) !== null, {
      message: '유효하지 않은 링크 주소입니다. URL을 다시 확인해 주세요.',
    })
    .transform(value => normalizeHttpUrl(value) as string),
  title: z.string().trim().min(1, { message: '제목을 입력해 주세요.' }),
  memo: z.string().max(MAX_MEMO_LENGTH).optional(),
});

export type AddLinkForm = z.infer<typeof addLinkSchema>;

export function useAddLinkForm() {
  const invalidUrlMessage = '유효하지 않은 링크 주소입니다. URL을 다시 확인해 주세요.';
  const form = useForm<AddLinkForm>({
    resolver: zodResolver(addLinkSchema),
    defaultValues: { url: '', title: '', memo: '' },
    mode: 'all',
  });

  const {
    control,
    setValue,
    getValues,
    formState: { dirtyFields },
  } = form;

  const urlValue = useWatch({ control, name: 'url' });
  const titleValue = useWatch({ control, name: 'title' });
  const memoValue = useWatch({ control, name: 'memo' });

  const trimmedUrl = useMemo(() => urlValue?.trim() ?? '', [urlValue]);
  const normalizedUrl = useMemo(() => normalizeHttpUrl(trimmedUrl), [trimmedUrl]);
  const isValidUrl = Boolean(normalizedUrl);
  const urlErrorMessage = trimmedUrl && !isValidUrl ? invalidUrlMessage : undefined;

  const { metaData, metaLoading, metaErrorMessage } = useLinkMetaScrape<AddLinkForm>({
    url: normalizedUrl ?? '',
    isValidUrl,
    dirtyFields,
    getValues,
    setValue,
  });

  useEffect(() => {
    if (!normalizedUrl || dirtyFields.title || metaLoading) {
      return;
    }

    const currentTitle = (getValues('title') ?? '').trim();
    if (currentTitle) {
      return;
    }

    const metaTitle = metaData?.title?.trim();
    if (metaTitle) {
      return;
    }

    setValue('title', getReadableUrlLabel(normalizedUrl), {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [normalizedUrl, dirtyFields.title, metaLoading, getValues, metaData?.title, setValue]);

  const shouldDisableDetails = !trimmedUrl || !isValidUrl || metaLoading;
  const previewImageUrl = metaData?.image?.trim()
    ? metaData.image
    : '/images/default_linkcard_image.png';

  return {
    form,
    trimmedUrl: normalizedUrl ?? trimmedUrl,
    isValidUrl,
    urlErrorMessage,
    titleValue,
    memoValue,
    metaData,
    metaLoading,
    metaErrorMessage,
    shouldDisableDetails,
    previewImageUrl,
  };
}
