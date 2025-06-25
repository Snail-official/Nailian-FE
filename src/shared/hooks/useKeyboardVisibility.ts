import { useState, useEffect } from 'react';
import { Keyboard } from 'react-native';

type KeyboardEventCallback = () => void;

interface UseKeyboardVisibilityOptions {
  // 키보드가 표시될 때 실행할 콜백 함수
  onShow?: KeyboardEventCallback;
  // 키보드가 숨겨질 때 실행할 콜백 함수
  onHide?: KeyboardEventCallback;
}

// 키보드 표시 여부를 감지하는 커스텀 훅
export function useKeyboardVisibility(options?: UseKeyboardVisibilityOptions) {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const { onShow, onHide } = options || {};

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        onShow?.();
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        onHide?.();
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [onShow, onHide]);

  return isKeyboardVisible;
}
