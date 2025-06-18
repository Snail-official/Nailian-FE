import React, { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/shared/types/navigation';
import { deleteUserNailSet } from '~/entities/nail-set/api';
import { toast } from '~/shared/lib/toast';
import { useErrorStore } from '~/features/error/model/errorStore';
import Modal from '~/shared/ui/Modal';

interface DeleteModalProps {
  nailSetId: number;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  show: boolean;
  onClose: () => void;
}

/**
 * 삭제 확인 모달 컴포넌트
 */
export function DeleteModal({
  nailSetId,
  navigation,
  show,
  onClose,
}: DeleteModalProps) {
  const errorStore = useErrorStore();
  const queryClient = useQueryClient();

  // 북마크 삭제 뮤테이션
  const { mutate: deleteBookmark } = useMutation({
    mutationFn: deleteUserNailSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userNailSets'] });

      toast.showToast('삭제되었습니다', {
        position: 'bottom',
      });
      onClose();
      navigation.goBack();
    },
    onError: () => {
      errorStore.showError('보관함에서 삭제 중 오류가 발생했습니다');
      onClose();
    },
  });

  const handleDeleteBookmark = useCallback(() => {
    if (!nailSetId) return;
    deleteBookmark({ nailSetId });
  }, [nailSetId, deleteBookmark]);

  if (!show) {
    return null;
  }

  return (
    <Modal
      title="해당 아트를 삭제하시겠어요?"
      description=" "
      confirmText="돌아가기"
      cancelText="삭제하기"
      onConfirm={onClose}
      onCancel={handleDeleteBookmark}
    />
  );
}
