import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { colors, typography } from '../styles/common';
import ErrorIcon from '../assets/icons/ic_error.svg';

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
interface ToastProps {
  /** 표시할 메시지 내용 */
  message: string;
  /** 토스트 표시 여부 */
  visible: boolean;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: 32,
    elevation: 5,
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
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 33,
    top: 32, // 화면 상단으로부터 9.36%로 추후 변경
  },
  message: {
    ...typography.body2,
  },
});

function Toast({ message, visible }: ToastProps): JSX.Element {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    // 진행 중인 애니메이션 중지
    fadeAnim.stopAnimation();
    translateY.stopAnimation();

    if (visible) {
      // 초기 상태로 리셋
      fadeAnim.setValue(0);
      translateY.setValue(-20);

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
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, translateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <ErrorIcon width={20} height={20} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

export default Toast;
