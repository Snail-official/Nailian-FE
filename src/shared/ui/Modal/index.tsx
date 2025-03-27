import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal as RNModal,
  Pressable,
  BackHandler,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import ErrorIcon from '~/shared/assets/icons/ic_error.svg';
import Button from '../Button';

interface ModalProps {
  /** 모달 제목 */
  title: string;
  /** 모달 설명 */
  description?: string;
  /** 취소 버튼 텍스트 */
  cancelText: string;
  /** 확인 버튼 텍스트 */
  confirmText?: string;
  /** 취소 버튼 클릭 핸들러 */
  onCancel: () => void;
  /** 확인 버튼 클릭 핸들러 */
  onConfirm?: () => void;
}

/**
 * 모달 컴포넌트
 *
 * 사용자의 주의가 필요한 중요한 액션이나 정보를 표시하는 오버레이 컴포넌트입니다.
 * 경고 아이콘, 제목, 설명, 그리고 두 개의 액션 버튼을 포함합니다.
 *
 * @example
 * <Modal
 *   title="정말 탈퇴하시겠어요?"
 *   description="소중한 정보가 모두 사라져요"
 *   confirmText="탈퇴하기"
 *   cancelText="돌아가기"
 *   onConfirm={handleWithdraw}
 *   onCancel={handleClose}
 * />
 */
function Modal({
  title,
  description,
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
}: ModalProps) {
  const insets = useSafeAreaInsets();

  // 기본 설정
  const ANIMATION_DURATION = 300; // ms, RN Modal의 기본 애니메이션 지속 시간

  // 모달 초기 props를 캐싱하여 일관성 유지
  const initialProps = useRef({
    title,
    description,
    cancelText,
    confirmText,
    onCancel,
    onConfirm,
  }).current;

  // 모달 가시성 상태
  const [visible, setVisible] = useState(true);

  // 이벤트 처리 중인지 플래그
  const [isHandlingAction, setIsHandlingAction] = useState(false);

  // 안전한 이벤트 핸들러 - 중복 실행 방지
  const safelyHandleEvent = useCallback(
    (handler: () => void) => {
      if (isHandlingAction) return;
      setIsHandlingAction(true);

      // 모달 닫기 애니메이션 시작
      setVisible(false);

      // 애니메이션 완료 후 핸들러 실행
      setTimeout(() => {
        handler();
      }, ANIMATION_DURATION);
    },
    [isHandlingAction, ANIMATION_DURATION],
  );

  // 안전한 취소 이벤트 처리
  const handleCancelSafely = useCallback(() => {
    if (initialProps.onCancel) {
      safelyHandleEvent(initialProps.onCancel);
    }
  }, [safelyHandleEvent, initialProps.onCancel]);

  // 안전한 확인 이벤트 처리
  const handleConfirmSafely = useCallback(() => {
    if (initialProps.onConfirm) {
      safelyHandleEvent(initialProps.onConfirm);
    }
  }, [safelyHandleEvent, initialProps.onConfirm]);

  // 배경 탭 핸들러는 취소 핸들러와 동일하게 동작
  const handleBackdropPress = useCallback(() => {
    handleCancelSafely();
  }, [handleCancelSafely]);

  // 모달 내부 탭 시 이벤트 전파 중지
  const stopPropagation = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  // 백 핸들러 설정
  useEffect(() => {
    const backAction = () => {
      if (visible) {
        handleCancelSafely();
        return true; // 이벤트 소비
      }
      return false; // 다른 핸들러로 전파
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [visible, handleCancelSafely]);

  return (
    <RNModal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleCancelSafely}
      // 안드로이드에서 모달이 하드웨어 백 버튼으로 닫히지 않도록 설정
      hardwareAccelerated={Platform.OS === 'android'}
    >
      <Pressable style={styles.overlay} onPress={handleBackdropPress}>
        <Pressable
          style={[
            styles.container,
            {
              marginTop: insets.top,
              marginBottom: insets.bottom,
              marginLeft: insets.left,
              marginRight: insets.right,
            },
          ]}
          onPress={stopPropagation}
        >
          <View style={styles.content}>
            <ErrorIcon
              width={scale(20)}
              height={scale(20)}
              color={colors.gray650}
            />
            <Text style={styles.title}>{initialProps.title}</Text>
            {initialProps.description && initialProps.description.length > 0 ? (
              <Text style={styles.description}>{initialProps.description}</Text>
            ) : null}
          </View>
          <View style={styles.buttonContainer}>
            {onConfirm && confirmText && (
              <Button
                variant="secondarySmallLeft"
                onPress={handleConfirmSafely}
                disabled={isHandlingAction}
                loading={false}
              >
                <Text style={styles.cancelText}>
                  {initialProps.confirmText}
                </Text>
              </Button>
            )}
            <Button
              variant="secondarySmallRight"
              onPress={handleCancelSafely}
              disabled={isHandlingAction}
              loading={false}
            >
              <Text style={styles.confirmText}>{initialProps.cancelText}</Text>
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const MODAL_OVERLAY_BACKGROUND = 'rgba(0, 0, 0, 0.5)' as const;

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    gap: scale(8),
    justifyContent: 'center',
    marginTop: vs(29),
    paddingBottom: vs(15),
    paddingHorizontal: scale(18),
  },
  cancelText: {
    ...typography.body2_SB,
    color: colors.gray900,
    letterSpacing: -0.14,
    textAlign: 'center',
  },
  confirmText: {
    ...typography.body2_SB,
    color: colors.white,
    letterSpacing: -0.14,
    textAlign: 'center',
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: scale(12),
    flexShrink: 0,
    width: scale(331),
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.large,
    paddingTop: vs(32),
  },
  description: {
    ...typography.body4_M,
    color: colors.gray500,
    marginTop: vs(2),
    textAlign: 'center',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: MODAL_OVERLAY_BACKGROUND,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...typography.title2_SB,
    color: colors.gray850,
    marginTop: vs(14),
    textAlign: 'center',
  },
});

export default Modal;
