import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, BackHandler } from 'react-native';
import { colors, typography, spacing } from '~/shared/styles/design';
import Button from '~/shared/ui/Button';
import { scale, vs } from '~/shared/lib/responsive';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import ErrorIcon from '~/shared/assets/icons/ic_error.svg';

/**
 * 응모 모달 Props 인터페이스
 */
interface ApplyModalProps {
  /**
   * 모달 표시 여부
   */
  visible: boolean;
  /**
   * 모달 닫기 콜백
   */
  onClose: () => void;
  /**
   * 응모하기 버튼 콜백
   */
  onApply: () => void;
}

/**
 * 응모 모달 Ref 인터페이스
 */
export interface ApplyModalRefProps {
  /**
   * 모달 표시
   */
  present: () => void;
  /**
   * 모달 닫기
   */
  dismiss: () => void;
}

/**
 * 응모 모달 컴포넌트
 *
 * AR 체험 화면에서 네일 디자인 완성 시 이벤트에 응모할 수 있는 모달 컴포넌트입니다.
 *
 * 주요 기능:
 * - 이벤트 응모 안내 메시지 표시
 * - 응모하기 및 취소 버튼 제공
 * - Android 뒤로가기 버튼 핸들링
 * - SafeAreaView 통합으로 다양한 기기에서 안전한 화면 표시
 *
 * @param {ApplyModalProps} props - 응모 모달 컴포넌트 속성
 * @returns {JSX.Element} 응모 모달 컴포넌트
 */
function ApplyModal({ visible, onClose, onApply }: ApplyModalProps) {
  // 바텀시트 모달 ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // visible prop이 변경될 때 모달 열기/닫기 처리
  useEffect(() => {
    if (visible) {
      // 모달 열기
      bottomSheetModalRef.current?.present();
    } else {
      // 모달 닫기
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  // 뒤로가기 버튼 핸들러 (Android)
  useEffect(() => {
    // Android에서만 적용, 모달이 열려있을 때만 작동
    if (Platform.OS !== 'android' || !visible) return;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // 모달이 열려있을 때 뒤로가기 버튼을 누르면 모달 닫기
        bottomSheetModalRef.current?.dismiss();
        return true; // 이벤트 처리 완료
      },
    );

    // 컴포넌트 언마운트 또는 상태 변경 시 이벤트 리스너 제거
    return () => backHandler.remove();
  }, [visible]);

  // 응모하기 핸들러
  const handleApply = useCallback(() => {
    // 응모 콜백 실행
    onApply();

    // 모달 닫기
    bottomSheetModalRef.current?.dismiss();
  }, [onApply]);

  // 닫기 핸들러
  const handleClose = useCallback(() => {
    // 모달 닫기
    bottomSheetModalRef.current?.dismiss();
  }, []);

  // 바텀시트 닫기 콜백
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  // 백드롭 컴포넌트 렌더링
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
        animatedIndex={props.animatedIndex}
        animatedPosition={props.animatedPosition}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={['27%']}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      enableDynamicSizing={false}
      handleComponent={null}
      backgroundStyle={styles.modalBackground}
    >
      <SafeAreaView style={styles.modalContent}>
        {/* 상단 탭바는 제거하고 Shared Modal과 비슷하게 스타일링 */}
        <View style={styles.contentContainer}>
          {/* 경고 아이콘 */}
          <ErrorIcon
            width={scale(20)}
            height={scale(20)}
            color={colors.gray650}
          />

          {/* 타이틀 */}
          <Text style={styles.titleText}>
            [아트 만들기] 이벤트에{'\n'}응모하시겠어요?
          </Text>

          {/* 버튼 영역 */}
          <View style={styles.buttonContainer}>
            <Button variant="secondarySmallLeft" onPress={handleClose}>
              <Text style={styles.cancelButtonText}>괜찮아요</Text>
            </Button>
            <View style={styles.buttonGap} />
            <Button variant="secondarySmallRight" onPress={handleApply}>
              <Text style={styles.applyButtonText}>응모하기</Text>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  applyButtonText: {
    ...typography.body2_SB,
    color: colors.white,
    letterSpacing: -0.14,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: scale(8),
    justifyContent: 'center',
    marginTop: vs(29),
    paddingBottom: vs(15),
    paddingHorizontal: scale(18),
  },
  buttonGap: {
    width: scale(8),
  },
  cancelButtonText: {
    ...typography.body2_SB,
    color: colors.gray900,
    letterSpacing: -0.14,
    textAlign: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: spacing.large,
    paddingTop: vs(32),
  },
  modalBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: scale(12),
    borderTopRightRadius: scale(12),
  },
  modalContent: {
    borderRadius: scale(12),
    flex: 1,
    width: '100%',
  },
  titleText: {
    ...typography.title2_SB,
    color: colors.gray850,
    marginTop: vs(14),
    textAlign: 'center',
  },
});

export default ApplyModal;
