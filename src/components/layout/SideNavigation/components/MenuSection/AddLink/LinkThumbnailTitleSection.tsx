import Label from '@/components/basics/Label/Label';
import Skeleton from '@/components/basics/Skeleton/Skeleton';
import Spinner from '@/components/basics/Spinner/Spinner';
import TextArea from '@/components/basics/TextArea/TextArea';
import { MAX_TITLE_LENGTH } from '@/lib/constants/link';
import Image from 'next/image';
import { Control, Controller, FieldErrors } from 'react-hook-form';

import { AddLinkForm } from './hooks/useAddLinkForm';

interface Props {
  control: Control<AddLinkForm>;
  errors: FieldErrors<AddLinkForm>;
  metaLoading: boolean;
  isValidUrl: boolean;
  shouldDisableDetails: boolean;
  previewImageUrl: string;
  label?: string;
}

export default function LinkThumbnailTitleSection({
  control,
  errors,
  metaLoading,
  isValidUrl,
  shouldDisableDetails,
  previewImageUrl,
  label = '링크 정보',
}: Props) {
  return (
    <section className="border-gray100 border-b px-6 py-6">
      <Label className="mb-3 block text-gray900">{label}</Label>
      <div className="grid grid-cols-[10rem_minmax(0,1fr)] gap-2">
        <div
          className={`border-gray100 relative h-[5rem] overflow-hidden rounded-lg border bg-white ${
            shouldDisableDetails ? 'opacity-60' : ''
          }`}
          aria-disabled={shouldDisableDetails}
        >
          {metaLoading && isValidUrl ? (
            <>
              <Skeleton className="h-full w-full" radius="lg" animated />
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            </>
          ) : (
            <Image src={previewImageUrl} alt="link thumbnail" fill className="object-cover" />
          )}
        </div>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              placeholder="제목을 입력해 주세요."
              id="title-input"
              radius="lg"
              heightLines={2}
              maxHeightLines={2}
              maxLength={MAX_TITLE_LENGTH}
              isLoading={metaLoading && isValidUrl}
              disabled={shouldDisableDetails}
              value={field.value ?? ''}
              onChange={e => field.onChange(e)}
              className="border-gray100 min-h-[5rem] bg-white text-[1rem]"
            />
          )}
        />
        {errors.title && !shouldDisableDetails && (
          <span className="text-red500 col-start-2 text-xs">{errors.title.message as string}</span>
        )}
      </div>
    </section>
  );
}
