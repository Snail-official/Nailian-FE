import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import ErrorIcon from '~/shared/assets/icons/ic_error.svg';
import { toast } from '~/shared/lib/toast';

/**
 * Toast 컴포넌트 - 사용자에게 일시적인 알림 메시지를 표시합니다.
 *
 * 위치에 따라 다른 스타일과 애니메이션을 적용하며,
 * 상단 토스트는 경고 아이콘을 포함하고 하단 토스트는 간결한 메시지만 표시합니다.
 *
 * @param {ToastProps} props Toast 컴포넌트 속성
 * @returns {JSX.Element | null} 토스트 컴포넌트 또는 표시되지 않을 경우 null
 */
export function ToastContainer() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [position, setPosition] = useState<'top' | 'bottom'>('top');

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const showToastMessage = useCallback(
    (newMessage: string, toastPosition: 'top' | 'bottom', duration: number) => {
      // 이전 타이머가 있다면 클리어
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setMessage(newMessage);
      setPosition(toastPosition);
      setVisible(true);

      // 새로운 타이머 설정
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
      }, duration);
    },
    [],
  );

  useEffect(() => {
    const unsubscribe = toast.addListener(({ message, options }) => {
      const { duration = 3000, position: toastPosition = 'top' } =
        options || {};
      showToastMessage(message, toastPosition, duration);
    });

    // cleanup
    return () => {
      unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [showToastMessage]);

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

  if (!visible) return null;

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
      {position === 'top' && (
        <ErrorIcon width={20} height={20} color={colors.gray650} />
      )}
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
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: 32,
    elevation: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    padding: 14,
    paddingLeft: 20,
    paddingRight: 24,
    position: 'absolute',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 33,
    top: 32,
    zIndex: 999,
  },
});
