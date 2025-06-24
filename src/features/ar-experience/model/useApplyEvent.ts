import { useState, useCallback } from 'react';
import { fetchEventStatus } from '~/entities/user/api';
import { toast } from '~/shared/lib/toast';

interface UseApplyEventOptions {
  onShowModal?: () => void;
  onCloseModal?: () => void;
}

export function useApplyEvent(options: UseApplyEventOptions = {}) {
  const { onShowModal, onCloseModal } = options;
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [savedNailSetId, setSavedNailSetId] = useState<number | null>(null);

  // 네일셋 저장 후 응모 처리
  const handleApply = useCallback(
    async (nailSetId: number) => {
      setSavedNailSetId(nailSetId);

      // 이벤트 참여 상태 확인
      const eventStatus = await fetchEventStatus();
      const hasParticipated = eventStatus?.data || false;

      // 이벤트에 참여하지 않은 경우에만 모달 표시
      if (!hasParticipated) {
        if (onShowModal) {
          onShowModal();
        }

        setTimeout(() => {
          setShowApplyModal(true);
        }, 300);
      }
    },
    [onShowModal],
  );

  // 응모 모달 완료 핸들러
  const handleApplyComplete = useCallback(() => {
    toast.showToast('응모가 완료되었습니다', { iconType: 'check' });
    setShowApplyModal(false);
  }, []);

  // 응모 모달 취소 핸들러
  const handleApplyCancel = useCallback(() => {
    setShowApplyModal(false);

    // 콜백 호출
    setTimeout(() => {
      if (onCloseModal) {
        onCloseModal();
      }
    }, 300);
  }, [onCloseModal]);

  return {
    showApplyModal,
    savedNailSetId,
    handleApply,
    handleApplyComplete,
    handleApplyCancel,
  };
}
