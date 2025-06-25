import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import ErrorIcon from '~/shared/assets/icons/ic_error.svg';
import Button from '../../Button';
import BaseModal from '../BaseModal';

export interface ConfirmModalProps {
  title: string;
  description?: string;
  cancelText: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
  onClose: () => void;
  closeOnOverlayClick?: boolean;
}

/**
 * 확인 모달 컴포넌트
 */
function ConfirmModal({
  title,
  description,
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
  onClose,
  closeOnOverlayClick = true,
}: ConfirmModalProps) {
  return (
    <BaseModal
      onClose={onClose || onCancel}
      closeOnOverlayClick={closeOnOverlayClick}
    >
      <View style={styles.content}>
        <ErrorIcon
          width={scale(20)}
          height={scale(20)}
          color={colors.gray650}
        />
        <Text style={styles.title}>{title}</Text>
        {description && description.length > 0 ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
      <View style={styles.buttonContainer}>
        <Button
          variant="secondarySmallLeft"
          onPress={onConfirm}
          loading={false}
        >
          <Text style={styles.cancelText}>{confirmText}</Text>
        </Button>
        <Button
          variant="secondarySmallRight"
          onPress={onCancel}
          loading={false}
        >
          <Text style={styles.confirmText}>{cancelText}</Text>
        </Button>
      </View>
    </BaseModal>
  );
}

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
  title: {
    ...typography.title2_SB,
    color: colors.gray850,
    marginTop: vs(14),
    textAlign: 'center',
  },
});

export default ConfirmModal;
