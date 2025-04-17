import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  BackHandler,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  EmitterSubscription,
} from 'react-native';
import { colors, typography, spacing } from '~/shared/styles/design';
import Button from '~/shared/ui/Button';
import { scale, vs } from '~/shared/lib/responsive';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  // 모달 화면 상태 (initial: 초기 화면, form: 양식 입력 화면)
  const [modalStep, setModalStep] = useState<'initial' | 'form'>('initial');
  // 유저 입력 양식 상태
  const [contactInfo, setContactInfo] = useState('');
  // 키보드 표시 상태
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // 키보드 이벤트 리스너 설정
  useEffect(() => {
    let keyboardDidShowListener: EmitterSubscription;
    let keyboardDidHideListener: EmitterSubscription;

    if (modalStep === 'form') {
      keyboardDidShowListener = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        () => {
          setKeyboardVisible(true);
          // 키보드가 표시되면 모달 스냅포인트 업데이트
          bottomSheetModalRef.current?.snapToIndex(0);
        },
      );

      keyboardDidHideListener = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        () => {
          setKeyboardVisible(false);
          // 키보드가 사라지면 모달 스냅포인트 업데이트
          bottomSheetModalRef.current?.snapToIndex(0);
        },
      );
    }

    return () => {
      if (keyboardDidShowListener) {
        keyboardDidShowListener.remove();
      }
      if (keyboardDidHideListener) {
        keyboardDidHideListener.remove();
      }
    };
  }, [modalStep]);

  // visible prop이 변경될 때 모달 열기/닫기 처리
  useEffect(() => {
    if (visible) {
      // 모달 열기
      bottomSheetModalRef.current?.present();
    } else {
      // 모달 닫기
      bottomSheetModalRef.current?.dismiss();
      // 모달이 닫힐 때 상태 초기화
      setModalStep('initial');
      setContactInfo('');
      setKeyboardVisible(false);
    }
  }, [visible]);

  // 뒤로가기 버튼 핸들러 (Android)
  useEffect(() => {
    // Android에서만 적용, 모달이 열려있을 때만 작동
    if (Platform.OS !== 'android' || !visible) return;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (modalStep === 'form') {
          // 양식 화면에서 뒤로가기 누르면 초기 화면으로
          setModalStep('initial');
          return true;
        }
        // 초기 화면에서 뒤로가기 누르면 모달 닫기
        bottomSheetModalRef.current?.dismiss();
        return true; // 이벤트 처리 완료
      },
    );

    // 컴포넌트 언마운트 또는 상태 변경 시 이벤트 리스너 제거
    return () => backHandler.remove();
  }, [visible, modalStep]);

  // 응모하기 핸들러 - 양식 입력 화면으로 전환
  const handleApply = useCallback(() => {
    setModalStep('form');
  }, []);

  // 양식 제출 핸들러
  const handleSubmitForm = useCallback(() => {
    // 키보드 닫기
    Keyboard.dismiss();
    // 응모 콜백 실행
    onApply();
    // 모달 닫기
    bottomSheetModalRef.current?.dismiss();
    // 상태 초기화
    setModalStep('initial');
    setContactInfo('');
  }, [onApply]);

  // 닫기 핸들러
  const handleClose = useCallback(() => {
    // 키보드 닫기
    Keyboard.dismiss();
    // 모달 닫기
    bottomSheetModalRef.current?.dismiss();
  }, []);

  // 배경 터치 시 키보드 닫기
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // 입력 값 변경 핸들러
  const handleInputChange = useCallback((value: string) => {
    setContactInfo(value);
  }, []);

  // 바텀시트 닫기 콜백
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
        setModalStep('initial');
        setContactInfo('');
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

  // 초기 화면 컨텐츠 렌더링
  const renderInitialContent = () => (
    <View style={styles.contentContainer}>
      {/* 경고 아이콘 */}
      <ErrorIcon width={scale(20)} height={scale(20)} color={colors.gray650} />

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
  );

  // 양식 입력 화면 컨텐츠 렌더링
  const renderFormContent = () => (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.contentContainer}>
          {/* 경고 아이콘 */}
          <ErrorIcon
            width={scale(20)}
            height={scale(20)}
            color={colors.gray650}
          />

          {/* 타이틀 */}
          <Text style={styles.titleText}>응모가 완료되었습니다.</Text>

          {/* 설명 텍스트 */}
          <Text style={styles.descriptionText}>
            *경품 지급을 위해 이메일 혹은 전화번호 입력이 필요합니다.{'\n'}
            미입력시, 선정되어도 경품 수령이 불가할 수 있습니다.
          </Text>

          {/* 입력 영역 */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={contactInfo}
              onChangeText={handleInputChange}
              placeholder="ex. nailjoa@nailian.kr"
              placeholderTextColor={colors.gray300}
              textAlign="center"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={
                contactInfo.trim() ? handleSubmitForm : undefined
              }
            />
          </View>

          {/* 버튼 영역 */}
          <View style={styles.confirmButtonContainer}>
            <Button
              variant="secondarySmallRight"
              onPress={handleSubmitForm}
              disabled={!contactInfo.trim()}
            >
              <Text style={styles.applyButtonText}>확인</Text>
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );

  // 현재 상태에 따른 스냅포인트 계산
  const getSnapPoints = () => {
    if (modalStep === 'initial') {
      return ['27%'];
    } else {
      return keyboardVisible ? ['65%'] : ['40%'];
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={getSnapPoints()}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      enableDynamicSizing={false}
      handleComponent={null}
      backgroundStyle={styles.modalBackground}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <SafeAreaView style={styles.modalContent}>
        {/* 현재 상태에 따라 다른 콘텐츠 렌더링 */}
        {modalStep === 'initial' ? renderInitialContent() : renderFormContent()}
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
  confirmButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(30),
    paddingBottom: vs(15),
  },
  contentContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: spacing.large,
    paddingTop: vs(32),
  },
  descriptionText: {
    ...typography.body4_M,
    color: colors.gray500,
    marginBottom: vs(24),
    marginTop: vs(7),
    textAlign: 'center',
  },
  inputWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: scale(287),
  },
  keyboardAvoidingContainer: {
    flex: 1,
    width: '100%',
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
  textInput: {
    ...typography.body5_M,
    backgroundColor: colors.gray100,
    borderRadius: scale(8),
    color: colors.gray900,
    paddingHorizontal: scale(48),
    paddingVertical: scale(12),
    textAlign: 'center',
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
