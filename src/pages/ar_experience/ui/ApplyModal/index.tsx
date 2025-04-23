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
import { applyEvent } from '~/entities/user/api';
import { toast } from '~/shared/lib/toast';

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
   * 네일셋 ID
   */
  nailSetId: number;
  /**
   * 응모 완료 콜백
   */
  onComplete?: () => void;
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
 * 연락처 유효성 검사 함수
 * 이메일 또는 전화번호 형식 검증
 */
const isValidUserInfo = (value: string): boolean => {
  // 빈 값 체크
  if (!value.trim()) {
    return false;
  }
  // 이메일 및 전화번호 정규식
  const regex =
    /(^[^@]+@[^@.]+\.[^@.\n]+$)|(^0[15-9][0-9]{1,2}-[0-9]{3,4}-[0-9]{3,5}$)/;
  return regex.test(value);
};

/**
 * 응모 모달 컴포넌트
 *
 * AR 체험 화면에서 네일 디자인 완성 시 이벤트에 응모할 수 있는 모달 컴포넌트입니다.
 *
 * 주요 기능:
 * - 이벤트 응모 안내 메시지 표시
 * - 응모하기 및 취소 버튼 제공
 * - Android 뒤로가기 버튼 핸들링
 *
 * @param {ApplyModalProps} props - 응모 모달 컴포넌트 속성
 * @returns {JSX.Element} 응모 모달 컴포넌트
 */
function ApplyModal({
  visible,
  onClose,
  nailSetId,
  onComplete,
}: ApplyModalProps) {
  // 바텀시트 모달 ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  // 모달 화면 상태 (initial: 초기 화면, form: 양식 입력 화면, complete: 완료 화면)
  const [modalStep, setModalStep] = useState<'initial' | 'form' | 'complete'>(
    'initial',
  );
  // 일시적인 입력값 저장 (입력 중 리렌더링 방지)
  const inputValueRef = useRef('');
  // 실제 제출용 상태
  const [userInfo, setUserInfo] = useState('');
  // 키보드 표시 상태
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  // 입력 에러 상태
  const [inputError, setInputError] = useState('');

  // 모달 표시/숨김 처리
  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
      // 상태 초기화
      setModalStep('initial');
      setUserInfo('');
      inputValueRef.current = '';
      setKeyboardVisible(false);
      setInputError('');
      setIsLoading(false);
    }
  }, [visible]);

  // 닫기 핸들러
  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    bottomSheetModalRef.current?.dismiss();
  }, []);

  // 키보드 이벤트 리스너 설정
  useEffect(() => {
    let keyboardDidShowListener: EmitterSubscription;
    let keyboardDidHideListener: EmitterSubscription;

    if (modalStep === 'form') {
      keyboardDidShowListener = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        () => {
          setKeyboardVisible(true);
          bottomSheetModalRef.current?.snapToIndex(0);
        },
      );

      keyboardDidHideListener = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        () => {
          setKeyboardVisible(false);
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

  // 뒤로가기 버튼 핸들러 (Android)
  useEffect(() => {
    if (Platform.OS !== 'android' || !visible) return;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (modalStep === 'form') {
          setModalStep('initial');
          return true;
        } else if (modalStep === 'complete') {
          handleClose();
          return true;
        }
        bottomSheetModalRef.current?.dismiss();
        return true;
      },
    );

    return () => backHandler.remove();
  }, [visible, modalStep, handleClose]);

  // 응모하기 핸들러 - 양식 입력 화면으로 전환
  const handleApply = useCallback(() => {
    setModalStep('form');
  }, []);

  // 이벤트 응모 API 호출
  const submitApplication = useCallback(async () => {
    // 현재 입력값 참조
    const currentValue = inputValueRef.current;

    if (!currentValue.trim()) {
      setInputError('*연락처를 입력해주세요');
      return;
    }

    if (!isValidUserInfo(currentValue)) {
      setInputError('*올바른 이메일 또는 전화번호 형식이 아닙니다');
      return;
    }

    setInputError('');
    setIsLoading(true);
    setUserInfo(currentValue); // 제출 시에만 상태 업데이트

    try {
      await applyEvent({
        userInfo: currentValue,
        nailSetId,
      });
      setModalStep('complete');
    } catch (err) {
      toast.showToast('응모에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [nailSetId]);

  // 양식 제출 핸들러
  const handleSubmitForm = useCallback(() => {
    Keyboard.dismiss();
    submitApplication();
  }, [submitApplication]);

  // 배경 터치 시 키보드 닫기
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // 바텀시트 닫기 콜백
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
        setModalStep('initial');
        setUserInfo('');
        setInputError('');
      }
    },
    [onClose],
  );

  // 완료 화면에서 확인 버튼 클릭 핸들러
  const handleCompleteConfirm = useCallback(() => {
    if (onComplete) {
      onComplete();
    }
    handleClose();
  }, [onComplete, handleClose]);

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

  // 현재 상태에 따른 스냅포인트 계산
  const getSnapPoints = () => {
    if (modalStep === 'initial') {
      return ['27%'];
    } else if (modalStep === 'form') {
      return keyboardVisible ? ['65%'] : ['40%'];
    } else {
      return ['25%']; // 완료 화면
    }
  };

  // 초기 화면 컨텐츠 렌더링
  const renderInitialContent = () => (
    <View style={styles.contentContainer}>
      {/* 타이틀 */}
      <Text style={styles.titleText}>
        [이달의 아트 만들기]{'\n'}이벤트에 응모하시겠어요?
      </Text>

      {/* 설명 텍스트 */}
      <Text style={styles.descriptionText}>
        해당 이벤트는 유저당 1회만 참여 가능합니다.
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
          {/* 타이틀 */}
          <Text style={styles.titleText}>응모가 완료되었습니다.</Text>

          {/* 설명 텍스트 */}
          <Text style={styles.descriptionText}>
            경품 지급을 위해 이메일 혹은 전화번호 입력이 필요합니다.{'\n'}
            미입력시, 선정되어도 경품 수령이 불가할 수 있습니다.{'\n'}
            이벤트 참여 시 개인정보 수집 활용 동의로 간주됩니다.
          </Text>

          {/* 입력 영역 */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.textInput, inputError && styles.textInputError]}
              defaultValue={userInfo}
              onChangeText={text => {
                // ref에 직접 값 저장 (입력 중 리렌더링 방지)
                inputValueRef.current = text;

                // 검증 실패 후 다시 입력했을 때 에러 메시지 제거
                if (inputError) {
                  setInputError('');
                }
              }}
              placeholder="ex. 010-1234-5678"
              placeholderTextColor={colors.gray300}
              textAlign="center"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
            <Text style={styles.errorText}>{inputError}</Text>
          </View>

          {/* 버튼 영역 */}
          <View style={styles.confirmButtonContainer}>
            <Button
              variant="secondarySmallRight"
              onPress={handleSubmitForm}
              disabled={isLoading}
              loading={isLoading}
            >
              <Text style={styles.applyButtonText}>확인</Text>
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );

  // 완료 화면 컨텐츠 렌더링
  const renderCompleteContent = () => (
    <View style={styles.contentContainer}>
      {/* 타이틀 */}
      <Text style={styles.titleText}>참여 완료!</Text>

      {/* 설명 텍스트 */}
      <Text style={styles.descriptionText}>
        이달의 조합 이벤트 결과는 @nailian_official_kr{'\n'}
        인스타그램 계정에서 확인하실 수 있습니다.
      </Text>

      {/* 버튼 영역 */}
      <View style={styles.confirmButtonContainer}>
        <Button variant="secondarySmallRight" onPress={handleCompleteConfirm}>
          <Text style={styles.applyButtonText}>확인</Text>
        </Button>
      </View>
    </View>
  );

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
      <View style={styles.modalContent}>
        {/* 현재 상태에 따라 다른 콘텐츠 렌더링 */}
        {modalStep === 'initial'
          ? renderInitialContent()
          : modalStep === 'form'
            ? renderFormContent()
            : renderCompleteContent()}
      </View>
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
    marginTop: vs(35),
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
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: vs(23),
    paddingBottom: vs(15),
    width: '100%',
  },
  contentContainer: {
    alignItems: 'flex-start',
    flex: 1,
    paddingHorizontal: spacing.large,
    paddingTop: vs(32),
  },
  descriptionText: {
    ...typography.body4_M,
    alignSelf: 'flex-start',
    color: colors.gray500,
    marginTop: vs(6),
    textAlign: 'left',
    width: '100%',
  },
  errorText: {
    ...typography.body4_M,
    alignSelf: 'flex-start',
    color: colors.warn_red,
    marginLeft: scale(2),
    marginTop: vs(2),
    textAlign: 'left',
  },
  inputWrapper: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: vs(22),
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
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    textAlign: 'center',
    width: '100%',
  },
  textInputError: {
    borderColor: colors.warn_red,
    borderWidth: 1,
  },
  titleText: {
    ...typography.title2_SB,
    alignSelf: 'flex-start',
    color: colors.gray850,
    textAlign: 'left',
    width: '100%',
  },
});
export default ApplyModal;
