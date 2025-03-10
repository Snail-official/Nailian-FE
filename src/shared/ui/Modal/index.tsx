import React from 'react';
import { View, Text, StyleSheet, Modal as RNModal } from 'react-native';
import { colors, typography, spacing } from '~/shared/styles/design';
import ErrorIcon from '~/shared/assets/icons/ic_error.svg';
import Button from '../Button';

interface ModalProps {
  /** 모달 제목 */
  title: string;
  /** 모달 설명 */
  description: string;
  /** 취소 버튼 텍스트 */
  cancelText: string;
  /** 확인 버튼 텍스트 */
  confirmText: string;
  /** 취소 버튼 클릭 핸들러 */
  onCancel: () => void;
  /** 확인 버튼 클릭 핸들러 */
  onConfirm: () => void;
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
export default function Modal({
  title,
  description,
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
}: ModalProps) {
  return (
    <RNModal
      transparent={true}
      visible={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.content}>
            <ErrorIcon width={20} height={20} color={colors.gray650} />
            <Text style={styles.title}>{title}</Text>
            {description && description.length > 0 ? (
              <Text style={styles.description}>{description}</Text>
            ) : null}
          </View>
          <View style={styles.buttonContainer}>
            <Button
              variant="secondarySmall"
              onPress={onConfirm}
              disabled={true}
              loading={false}
            >
              <Text style={styles.cancelText}>{confirmText}</Text>
            </Button>
            <Button
              variant="secondarySmall"
              onPress={onCancel}
              disabled={false}
              loading={false}
            >
              <Text style={styles.confirmText}>{cancelText}</Text>
            </Button>
          </View>
        </View>
      </View>
    </RNModal>
  );
}

const MODAL_OVERLAY_BACKGROUND = 'rgba(0, 0, 0, 0.5)' as const;

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 29,
    paddingBottom: 15,
    paddingHorizontal: 18,
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
    borderRadius: 12,
    flexShrink: 0,
    width: 331,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.large,
    paddingTop: 32,
  },
  description: {
    ...typography.body4_M,
    color: colors.gray500,
    marginTop: 2,
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
    marginTop: 14,
    textAlign: 'center',
  },
});
