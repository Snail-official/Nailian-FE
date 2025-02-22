import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import ErrorIcon from '~/shared/assets/icons/ic_error.svg';

/**
 * 토스트 메시지 컴포넌트
 *
 * 화면 상단에 일시적으로 표시되는 알림 메시지입니다.
 * fade와 slide 애니메이션이 포함되어 있으며, 자동으로 사라집니다.
 *
 * @example
 * <Toast
 *   message="최대 10개까지 선택할 수 있어요"
 *   visible={showToast}
 * />
 */
type ToastPosition = 'top' | 'bottom';

interface ToastProps {
  /** 표시할 메시지 내용 */
  message: string;
  /** 토스트 표시 여부 */
  visible: boolean;
  /** 토스트 위치 (기본값: top) */
  position: ToastPosition;
}

export default function Toast({
  message,
  visible,
  position = 'top',
}: ToastProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(
    new Animated.Value(position === 'top' ? -20 : 20),
  ).current;

  useEffect(() => {
    // 진행 중인 애니메이션 중지
    fadeAnim.stopAnimation();
    translateY.stopAnimation();

    if (visible) {
      // 초기 상태로 리셋
      fadeAnim.setValue(0);
      translateY.setValue(position === 'top' ? -20 : 20);

      // 토스트 표시 애니메이션
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 토스트 숨김 애니메이션
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: position === 'top' ? -20 : 20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, translateY, position]);

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.topToast : styles.bottomToast,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      {position === 'top' && <ErrorIcon width={20} height={20} />}
      <Text
        style={position === 'top' ? styles.topMessage : styles.bottomMessage}
      >
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bottomMessage: {
    ...typography.body2_SB,
    color: colors.white,
    letterSpacing: -0.14,
  },
  bottomToast: {
    alignSelf: 'center',
    backgroundColor: colors.toast_black,
    borderRadius: 8,
    bottom: 32,
    height: 49,
    justifyContent: 'center',
    padding: 10,
    width: 331,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    position: 'absolute',
  },
  topMessage: {
    ...typography.body2_SB,
    color: colors.gray850,
  },
  topToast: {
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: 32,
    elevation: 5,
    gap: 8,
    justifyContent: 'center',
    padding: 14,
    paddingLeft: 20,
    paddingRight: 24,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 33,
    top: 32,
  },
});
