import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import {
  StyleSheet,
  Modal as RNModal,
  Pressable,
  BackHandler,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '~/shared/styles/design';
import { scale } from '~/shared/lib/responsive';

export interface BaseModalProps {
  children: ReactNode;
  onClose: () => void;
  closeOnBackdrop?: boolean;
  closeOnOverlayClick?: boolean;
  animationType?: 'none' | 'slide' | 'fade';
  containerStyle?: object;
}

/**
 * 기본 모달 컴포넌트
 */
function BaseModal({
  children,
  onClose,
  closeOnBackdrop = true,
  closeOnOverlayClick = true,
  animationType = 'fade',
  containerStyle,
}: BaseModalProps) {
  const insets = useSafeAreaInsets();

  const ANIMATION_DURATION = 300;

  const [visible, setVisible] = useState(true);

  const [isHandlingAction, setIsHandlingAction] = useState(false);

  const safelyHandleEvent = useCallback(
    (handler: () => void) => {
      if (isHandlingAction) return;
      setIsHandlingAction(true);

      setVisible(false);

      setTimeout(() => {
        handler();
      }, ANIMATION_DURATION);
    },
    [isHandlingAction, ANIMATION_DURATION],
  );

  const handleCloseSafely = useCallback(() => {
    safelyHandleEvent(onClose);
  }, [safelyHandleEvent, onClose]);

  const handleBackdropPress = useCallback(() => {
    if (closeOnBackdrop || closeOnOverlayClick) {
      handleCloseSafely();
    }
  }, [closeOnBackdrop, closeOnOverlayClick, handleCloseSafely]);

  const stopPropagation = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (visible) {
        handleCloseSafely();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [visible, handleCloseSafely]);

  return (
    <RNModal
      transparent
      visible={visible}
      animationType={animationType}
      onRequestClose={handleCloseSafely}
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
            containerStyle,
          ]}
          onPress={stopPropagation}
        >
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const MODAL_OVERLAY_BACKGROUND = 'rgba(0, 0, 0, 0.5)' as const;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: scale(12),
    flexShrink: 0,
    width: scale(331),
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: MODAL_OVERLAY_BACKGROUND,
    flex: 1,
    justifyContent: 'center',
  },
});

export default BaseModal;
