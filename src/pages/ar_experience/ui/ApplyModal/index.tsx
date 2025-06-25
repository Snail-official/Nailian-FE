import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { colors } from '~/shared/styles/design';
import { scale } from '~/shared/lib/responsive';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useKeyboardVisibility, useBackHandler } from '~/shared/hooks';
import { useApply } from '~/features/apply';
import { InitialContent, FormContent, CompleteContent } from './ui';

// 응모 모달 Props 인터페이스
interface ApplyModalProps {
  visible: boolean;
  onClose: () => void;
  nailSetId: number;
  onComplete?: () => void;
}

// 응모 모달 Ref 인터페이스
export interface ApplyModalRefProps {
  present: () => void;
  dismiss: () => void;
}

// 응모 모달 컴포넌트
function ApplyModal({
  visible,
  onClose,
  nailSetId,
  onComplete,
}: ApplyModalProps) {
  const {
    step,
    userInfo,
    isLoading,
    inputError,
    startApply,
    cancelApply,
    submitApply,
    handleInputChange,
    resetApply,
  } = useApply({ nailSetId });

  // 바텀시트 모달 ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // 키보드 표시 상태
  const isKeyboardVisible = useKeyboardVisibility({
    onShow: () => {
      if (step === 'form') {
        bottomSheetModalRef.current?.snapToIndex(0);
      }
    },
    onHide: () => {
      if (step === 'form') {
        bottomSheetModalRef.current?.snapToIndex(0);
      }
    },
  });

  // 모달 표시/숨김 처리
  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
      // 상태 초기화
      resetApply();
    }
  }, [visible, resetApply]);

  // 닫기 핸들러
  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    bottomSheetModalRef.current?.dismiss();
  }, []);

  // 양식 제출 핸들러
  const handleSubmitForm = useCallback(() => {
    Keyboard.dismiss();
    submitApply();
  }, [submitApply]);

  // 완료 화면에서 확인 버튼 클릭 핸들러
  const handleCompleteConfirm = useCallback(() => {
    if (onComplete) {
      onComplete();
    }
    handleClose();
  }, [onComplete, handleClose]);

  // 뒤로가기 버튼 핸들러 (Android)
  useBackHandler({
    onBackPress: () => {
      if (step === 'form') {
        cancelApply();
        return true;
      } else if (step === 'complete') {
        handleCompleteConfirm();
        return true;
      }
      handleClose();
      return true;
    },
    enabled: visible,
  });

  // 바텀시트 닫기 콜백
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  // 백드롭 컴포넌트 렌더링
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
        animatedIndex={props.animatedIndex}
        animatedPosition={props.animatedPosition}
      />
    ),
    [],
  );

  // 현재 상태에 따른 스냅포인트 계산
  const getSnapPoints = useCallback(() => {
    if (step === 'initial') {
      return ['27%'];
    } else if (step === 'form') {
      return isKeyboardVisible ? ['65%'] : ['40%'];
    } else {
      return ['25%']; // 완료 화면
    }
  }, [step, isKeyboardVisible]);

  // 현재 상태에 따라 다른 콘텐츠 렌더링
  const renderContent = () => {
    switch (step) {
      case 'initial':
        return <InitialContent onClose={handleClose} onApply={startApply} />;
      case 'form':
        return (
          <FormContent
            defaultValue={userInfo}
            onChangeText={handleInputChange}
            onSubmit={handleSubmitForm}
            isLoading={isLoading}
            errorMessage={inputError}
          />
        );
      case 'complete':
        return <CompleteContent onConfirm={handleCompleteConfirm} />;
      default:
        return null;
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={getSnapPoints()}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      enableDynamicSizing={false}
      handleComponent={null}
      backgroundStyle={styles.modalBackground}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <View style={styles.modalContent}>{renderContent()}</View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: scale(12),
    borderTopRightRadius: scale(12),
  },
  modalContent: {
    borderRadius: scale(12),
    flex: 1,
    width: '100%',
  },
});

export default ApplyModal;
