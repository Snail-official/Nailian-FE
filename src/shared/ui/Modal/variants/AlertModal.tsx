import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import ErrorIcon from '~/shared/assets/icons/ic_error.svg';
import Button from '../../Button';
import BaseModal from '../BaseModal';

export interface AlertModalProps {
  title: string;
  description?: string;
  confirmText: string;
  onConfirm: () => void;
  onClose: () => void;
  closeOnOverlayClick?: boolean;
}

/**
 * 알림 모달 컴포넌트
 */
function AlertModal({
  title,
  description,
  confirmText,
  onConfirm,
  onClose,
  closeOnOverlayClick = true,
}: AlertModalProps) {
  return (
    <BaseModal onClose={onClose} closeOnOverlayClick={closeOnOverlayClick}>
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
          variant="secondarySmallRight"
          onPress={onConfirm}
          loading={false}
        >
          <Text style={styles.confirmText}>{confirmText}</Text>
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

export default AlertModal;
