import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';

type BackHandlerCallback = () => boolean;

interface UseBackHandlerOptions {
  // 뒤로가기 버튼 이벤트 발생 시 실행할 콜백 함수
  onBackPress: BackHandlerCallback;
  // 뒤로가기 버튼 핸들러 활성화 여부
  enabled?: boolean;
}

// Android 뒤로가기 버튼 핸들러 커스텀 훅
export function useBackHandler({
  onBackPress,
  enabled = true,
}: UseBackHandlerOptions) {
  useEffect(() => {
    // Android에서만 적용
    if (Platform.OS !== 'android' || !enabled) return;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => backHandler.remove();
  }, [onBackPress, enabled]);
}
