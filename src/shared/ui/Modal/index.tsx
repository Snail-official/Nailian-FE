import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

export default function Modal({
  title,
  description,
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
}: ModalProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.content}>
          <ErrorIcon width={24} height={24} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            variant="secondarySmall"
            onPress={onConfirm}
            disabled={true}
            loading={false}
          >
            <Text style={styles.confirmText}>{confirmText}</Text>
          </Button>
          <Button
            variant="secondarySmall"
            onPress={onCancel}
            disabled={false}
            loading={false}
          >
            <Text style={styles.cancelText}>{cancelText}</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}

const MODAL_OVERLAY_BACKGROUND = 'rgba(0, 0, 0, 0.5)' as const;

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.small,
    justifyContent: 'center',
    marginTop: spacing.large,
  },
  cancelText: {
    ...typography.body2_SB,
    color: colors.white,
    letterSpacing: -0.14,
    textAlign: 'center',
  },
  confirmText: {
    ...typography.body2_SB,
    color: colors.gray900,
    letterSpacing: -0.14,
    textAlign: 'center',
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    flexShrink: 0,
    height: 199,
    width: 331,
  },
  content: {
    alignItems: 'center',
    gap: spacing.small,
    paddingHorizontal: spacing.large,
    paddingTop: spacing.large,
  },
  description: {
    ...typography.body4_M,
    color: colors.gray500,
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
    textAlign: 'center',
  },
});
