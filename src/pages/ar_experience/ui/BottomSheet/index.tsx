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

/**
 * 바텀시트의 스냅 포인트 높이 설정 유형
 * 숫자(픽셀 단위) 또는 퍼센트 문자열로 지정 가능
 * @example
 * ['25%', '50%', '90%'] // 화면 높이의 25%, 50%, 90%
 * [100, 300, 500] // 100px, 300px, 500px
 */
export type BottomSheetSnapPoints = (string | number)[];

/**
 * 바텀시트 핸들 컴포넌트 표시 방식
 * - 'default': 기본 핸들 컴포넌트 표시
 * - 'none': 핸들 컴포넌트 표시 안함
 * - 'custom': 커스텀 핸들 컴포넌트 사용
 */
export type HandleType = 'default' | 'none' | 'custom';

/**
 * 바텀시트 컴포넌트 Props
 * @property {BottomSheetSnapPoints} snapPoints - 바텀시트의 스냅 포인트 높이 설정
 * @property {number} initialIndex - 초기 바텀시트 인덱스 (snapPoints 배열의 인덱스)
 * @property {ReactNode} children - 바텀시트 내부 콘텐츠
 * @property {HandleType} handleType - 핸들 컴포넌트 표시 방식
 * @property {ReactNode} customHandle - 커스텀 핸들 컴포넌트 (handleType이 'custom'일 때 사용)
 * @property {(index: number) => void} onChange - 바텀시트 인덱스 변경 시 콜백
 * @property {StyleProp<ViewStyle>} contentContainerStyle - 내용 컨테이너 스타일
 * @property {StyleProp<ViewStyle>} backgroundStyle - 바텀시트 배경 스타일
 * @property {boolean} enablePanDownToClose - 아래로 스와이프하여 닫기 가능 여부
 * @property {boolean} enableBackdrop - 백드롭(배경 딤) 표시 여부
 * @property {boolean} backdropPressBehavior - 백드롭 클릭 시 동작 ('collapse', 'close', 'none')
 * @property {boolean} enableContentPanningGesture - 컨텐츠 패닝 제스처 활성화 여부
 * @property {boolean} enableHandlePanningGesture - 핸들 패닝 제스처 활성화 여부
 * @property {boolean} enableOverDrag - 오버드래그 활성화 여부
 * @property {number} maxDynamicContentSize - 최대 동적 컨텐츠 크기 설정 (스냅포인트 유지에 도움)
 */
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

/**
 * 바텀시트 참조 Props
 */
export interface BottomSheetRefProps {
  /**
   * 특정 인덱스로 바텀시트 위치 변경
   * @param index 인덱스
   * @param animated 애니메이션 적용 여부
   */
  snapToIndex: (index: number, animated?: boolean) => void;
  /**
   * 바텀시트 확장 (마지막 인덱스로 이동)
   */
  expand: () => void;
  /**
   * 바텀시트 접기 (첫 번째 인덱스로 이동)
   */
  collapse: () => void;
  /**
   * 바텀시트 닫기 (인덱스 -1로 이동)
   */
  close: () => void;
}

/**
 * 바텀시트 컴포넌트
 *
 * 앱 전반에서 사용되는 바텀시트 컴포넌트입니다.
 * 다양한 높이 설정과 핸들 유형을 지원합니다.
 *
 * @example
 * // 기본 바텀시트 (30%, 90% 높이)
 * <BottomSheet snapPoints={['30%', '90%']}>
 *   <Text>바텀시트 내용</Text>
 * </BottomSheet>
 *
 * // 커스텀 핸들이 있는 바텀시트
 * <BottomSheet
 *   snapPoints={['30%', '90%']}
 *   handleType="custom"
 *   customHandle={<View><Text>커스텀 핸들</Text></View>}
 * >
 *   <Text>바텀시트 내용</Text>
 * </BottomSheet>
 *
 * // 백드롭이 있는 바텀시트
 * <BottomSheet
 *   snapPoints={['30%', '90%']}
 *   enableBackdrop={true}
 *   backdropPressBehavior="collapse"
 * >
 *   <Text>바텀시트 내용</Text>
 * </BottomSheet>
 */
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
  },
  contentContainer: {
    flex: 1,
    padding: scale(20),
  },
  header: {
    alignItems: 'center',
    paddingVertical: vs(15),
  },
  indicator: {
    backgroundColor: colors.gray700,
    borderRadius: scale(3),
    height: vs(4),
    width: scale(40),
  },
});

export default BottomSheet;
