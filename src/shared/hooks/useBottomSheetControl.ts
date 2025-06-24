import { useState, useCallback, useRef, useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';
import { BottomSheetRefProps } from '~/shared/ui/BottomSheet';

// 바텀시트 제어를 위한 커스텀 훅
export function useBottomSheetControl() {
  // 바텀시트 참조 생성
  const bottomSheetRef = useRef<BottomSheetRefProps>(null);

  // 현재 바텀시트 인덱스 상태
  const [bottomSheetIndex, setBottomSheetIndex] = useState(0);

  // 바텀시트 인덱스 변경 핸들러
  const handleSheetChange = useCallback((index: number) => {
    setBottomSheetIndex(index);
  }, []);

  // 바텀시트 닫기
  const closeBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  // 바텀시트 열기
  const openBottomSheet = useCallback((index: number = 0) => {
    bottomSheetRef.current?.snapToIndex(index);
  }, []);

  // Android 뒤로가기 버튼 제어
  useEffect(() => {
    // Android에서만 적용
    if (Platform.OS !== 'android') return;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (bottomSheetIndex !== 0) {
          bottomSheetRef.current?.snapToIndex(0);
          return true;
        }
        return false;
      },
    );

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => backHandler.remove();
  }, [bottomSheetIndex]);

  return {
    bottomSheetRef,
    bottomSheetIndex,
    handleSheetChange,
    closeBottomSheet,
    openBottomSheet,
  };
}
