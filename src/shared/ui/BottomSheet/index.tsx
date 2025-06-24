import React, {
  useRef,
  useCallback,
  ReactNode,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '~/shared/styles/design';
import BottomSheetComponent, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSharedValue } from 'react-native-reanimated';
import { scale, vs } from '~/shared/lib/responsive';

// 바텀시트의 스냅 포인트 높이 설정 유형
export type BottomSheetSnapPoints = (string | number)[];

// 바텀시트 핸들 컴포넌트 표시 방식
export type HandleType = 'default' | 'none' | 'custom';

// 바텀시트 컴포넌트 Props
export interface BottomSheetProps {
  snapPoints: BottomSheetSnapPoints;
  initialIndex?: number;
  children: ReactNode;
  handleType?: HandleType;
  customHandle?: ReactNode;
  onChange?: (index: number) => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
  backgroundStyle?: StyleProp<ViewStyle>;
  enablePanDownToClose?: boolean;
  enableBackdrop?: boolean;
  backdropPressBehavior?: 'collapse' | 'close' | 'none';
  enableContentPanningGesture?: boolean;
  enableHandlePanningGesture?: boolean;
  enableOverDrag?: boolean;
  maxDynamicContentSize?: number;
}

export interface BottomSheetRefProps {
  // 특정 인덱스로 바텀시트 위치 변경
  snapToIndex: (index: number, animated?: boolean) => void;
  // 바텀시트 확장 (마지막 인덱스로 이동)
  expand: () => void;
  // 바텀시트 접기 (첫 번째 인덱스로 이동)
  collapse: () => void;
  // 바텀시트 닫기 (인덱스 -1로 이동)
  close: () => void;
}

// 바텀시트 컴포넌트
const BottomSheet = forwardRef<BottomSheetRefProps, BottomSheetProps>(
  (
    {
      snapPoints,
      initialIndex = 0,
      children,
      handleType = 'default',
      customHandle,
      onChange,
      contentContainerStyle,
      backgroundStyle,
      enablePanDownToClose = false,
      enableBackdrop = false,
      backdropPressBehavior = 'collapse',
      enableContentPanningGesture = true,
      enableHandlePanningGesture = true,
      enableOverDrag = false,
      maxDynamicContentSize,
    },
    ref,
  ) => {
    const bottomSheetRef = useRef<BottomSheetComponent>(null);
    const animatedIndex = useSharedValue(initialIndex);

    // 컴포넌트 언마운트 시 바텀시트 정리
    useEffect(
      () => () => {
        // 애니메이션 정리 작업
        if (bottomSheetRef.current) {
          bottomSheetRef.current.close();
        }
      },
      [],
    );

    // animatedIndex 변경 감지
    useEffect(() => {
      // 초기화
      animatedIndex.value = initialIndex;

      // 컴포넌트 언마운트시 정리
      return () => {
        // Reanimated 값 초기화
        animatedIndex.value = -1;
      };
    }, [initialIndex, animatedIndex]);

    // 외부에서 사용할 수 있는 메서드를 노출
    useImperativeHandle(ref, () => ({
      snapToIndex: (index: number, animated = true) => {
        if (animated) {
          bottomSheetRef.current?.snapToIndex(index);
        } else {
          bottomSheetRef.current?.snapToIndex(index, { duration: 0 });
        }
      },
      expand: () => {
        if (snapPoints.length > 1) {
          bottomSheetRef.current?.snapToIndex(snapPoints.length - 1);
        }
      },
      collapse: () => {
        bottomSheetRef.current?.snapToIndex(0);
      },
      close: () => {
        bottomSheetRef.current?.close();
      },
    }));

    // 핸들 컴포넌트 렌더링
    const renderHandleComponent = useCallback(() => {
      if (handleType === 'none') return null;
      if (handleType === 'custom' && customHandle) return customHandle;

      // 기본 핸들 컴포넌트
      return (
        <View style={styles.header}>
          <View style={styles.indicator} />
        </View>
      );
    }, [handleType, customHandle]);

    // 백드롭 컴포넌트 렌더링
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          animatedIndex={props.animatedIndex}
          animatedPosition={props.animatedPosition}
          disappearsOnIndex={0}
          appearsOnIndex={1}
          opacity={0.7}
          pressBehavior={backdropPressBehavior}
        />
      ),
      [backdropPressBehavior],
    );

    return (
      <BottomSheetComponent
        ref={bottomSheetRef}
        index={initialIndex}
        snapPoints={snapPoints}
        onChange={onChange}
        animatedIndex={animatedIndex}
        handleComponent={renderHandleComponent}
        enablePanDownToClose={enablePanDownToClose}
        enableContentPanningGesture={enableContentPanningGesture}
        enableHandlePanningGesture={enableHandlePanningGesture}
        enableOverDrag={enableOverDrag}
        maxDynamicContentSize={maxDynamicContentSize}
        keyboardBehavior="fillParent"
        android_keyboardInputMode="adjustResize"
        keyboardBlurBehavior="restore"
        backgroundStyle={[styles.bottomSheetBackground, backgroundStyle]}
        backdropComponent={enableBackdrop ? renderBackdrop : undefined}
      >
        <BottomSheetView
          style={[styles.contentContainer, contentContainerStyle]}
        >
          {children}
        </BottomSheetView>
      </BottomSheetComponent>
    );
  },
);

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: vs(10),
  },
  indicator: {
    backgroundColor: colors.gray300,
    borderRadius: vs(2),
    height: vs(4),
    width: scale(40),
  },
});

export default BottomSheet;
