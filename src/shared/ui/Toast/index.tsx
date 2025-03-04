import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import ErrorIcon from '~/shared/assets/icons/ic_error.svg';

/**
 * 토스트 메시지 컴포넌트
 *
 * 사용자에게 일시적인 피드백을 제공하는 알림 메시지입니다.
 * 상단과 하단에 표시 가능하며, 자동으로 사라지는 애니메이션이 포함되어 있습니다.
 *
 * @example
 * // 상단 토스트
 * <Toast
 *   message="최대 10개까지 선택할 수 있어요"
 *   visible={showToast}
 *   position="top"
 * />
 *
 * // 하단 토스트
 * <Toast
 *   message="저장되었습니다"
 *   visible={showToast}
 *   position="bottom"
 * />
 */
type ToastPosition = 'top' | 'bottom';

/**
 * Toast 컴포넌트의 속성을 정의하는 인터페이스
 */
interface ToastProps {
  /** 표시할 메시지 내용 */
  message: string;
  /** 토스트 표시 여부 */
  visible: boolean;
  /** 토스트 위치 (기본값: top) */
  position?: ToastPosition;
}

/**
 * Toast 옵션 인터페이스
 */
interface ToastOptions {
  /** 토스트가 표시되는 지속 시간 (밀리초 단위, 기본값: 3000ms) */
  duration?: number;
  /** 토스트의 위치 ('top' 또는 'bottom') */
  position?: ToastPosition;
}

/**
 * useToast 훅의 반환 타입 인터페이스
 */
interface UseToastReturn {
  /** 토스트를 표시하는 함수 */
  showToast: (msg: string, options?: ToastOptions) => void;
  /** 토스트의 표시 여부 */
  visible: boolean;
  /** 현재 표시 중인 토스트 메시지 */
  message: string;
  /** 현재 토스트의 위치 */
  position: ToastPosition;
  /** 렌더링할 토스트 컴포넌트 */
  ToastComponent: () => JSX.Element;
}

/**
 * useToast 훅 - Toast 메시지를 표시하기 위한 커스텀 훅
 *
 * 앱 내에서 일관된 방식으로 토스트 메시지를 표시할 수 있게 해주는 커스텀 훅입니다.
 * 상단 또는 하단에 토스트를 표시할 수 있으며, 메시지와 지속 시간을 설정할 수 있습니다.
 *
 * @param defaultPosition 토스트의 기본 위치 (기본값: 'top')
 * @returns {UseToastReturn} 토스트 관련 상태와 함수들을 포함한 객체
 *
 * @example
 * // 상단 토스트 사용
 * const { showToast, ToastComponent } = useToast('top');
 *
 * // 토스트 표시
 * showToast('메시지 내용');
 *
 * // 하단 토스트로 지속 시간 설정
 * showToast('저장되었습니다', { position: 'bottom', duration: 2000 });
 *
 * // 컴포넌트에 추가
 * return (
 *   <View>
 *     컴포넌트들
 *     <ToastComponent />
 *   </View>
 * );
 */
export function useToast(
  defaultPosition: ToastPosition = 'top',
): UseToastReturn {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [position, setPosition] = useState<ToastPosition>(defaultPosition);

  const showToast = useCallback((msg: string, options?: ToastOptions) => {
    const { duration = 3000, position: toastPosition } = options || {};

    setMessage(msg);
    if (toastPosition) {
      setPosition(toastPosition);
    }
    setVisible(true);

    // 지정된 시간 후 토스트 숨기기
    setTimeout(() => {
      setVisible(false);
    }, duration);
  }, []);

  const ToastComponent = useCallback(
    () => <Toast visible={visible} message={message} position={position} />,
    [visible, message, position],
  );

  return {
    showToast,
    visible,
    message,
    position,
    ToastComponent,
  };
}

/**
 * Toast 컴포넌트 - 사용자에게 일시적인 알림 메시지를 표시합니다.
 *
 * 위치에 따라 다른 스타일과 애니메이션을 적용하며,
 * 상단 토스트는 경고 아이콘을 포함하고 하단 토스트는 간결한 메시지만 표시합니다.
 *
 * @param {ToastProps} props Toast 컴포넌트 속성
 * @returns {JSX.Element | null} 토스트 컴포넌트 또는 표시되지 않을 경우 null
 */
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
