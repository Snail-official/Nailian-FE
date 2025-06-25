import { useCallback } from 'react';
import { createUserNailSet } from '~/entities/nail-set/api';
import { CreateNailSetRequest, APIError } from '~/shared/api/types';
import { toast } from '~/shared/lib/toast';
import { NailSet } from './types';

interface UseCreateNailSetOptions {
  onSuccess?: (nailSetId: number) => void;
  onError?: (error: Error) => void;
}

export function useCreateNailSet(
  nailSet: NailSet,
  isComplete: () => boolean,
  options: UseCreateNailSetOptions = {},
) {
  const { onSuccess, onError } = options;

  const handleCreateNailSet = useCallback(async () => {
    if (!isComplete()) {
      toast.showToast('아트가 완성되어야 저장 가능합니다', {
        position: 'bottom',
      });
      return;
    }

    try {
      const requestData: CreateNailSetRequest = {
        thumb: { id: nailSet.thumb!.id },
        index: { id: nailSet.index!.id },
        middle: { id: nailSet.middle!.id },
        ring: { id: nailSet.ring!.id },
        pinky: { id: nailSet.pinky!.id },
      };

      // 네일셋 저장 API 호출
      const result = await createUserNailSet(requestData);

      toast.showToast('보관함에 저장되었습니다', { position: 'bottom' });

      if (result?.data?.id && onSuccess) {
        onSuccess(result.data.id);
      }
    } catch (error) {
      if (error instanceof APIError && error.code === 409) {
        toast.showToast('이미 저장된 아트입니다', { position: 'bottom' });
      } else {
        toast.showToast('저장에 실패했습니다', {
          position: 'bottom',
        });
      }

      if (onError) {
        onError(error as Error);
      }
    }
  }, [nailSet, isComplete, onSuccess, onError]);

  return { handleCreateNailSet };
}
