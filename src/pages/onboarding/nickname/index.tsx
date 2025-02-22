import React, { useState, useEffect } from 'react';
import {
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  View,
  Keyboard,
} from 'react-native';
import { updateNickname } from '~/entities/user/api';
import { useOnboardingNavigation } from '~/features/onboarding/model/useOnboardingNavigation';
import { typography, colors } from '~/shared/styles/design';
import Button from '~/shared/ui/Button';
import ErrorIcon from '~/shared/assets/icons/ic_error.svg';
import Toast from '~/shared/ui/Toast';

/**
 * 온보딩 닉네임 입력 화면
 *
 * 사용자의 닉네임을 입력받고 유효성을 검사하는 화면입니다.
 * - 한글 2-4자 제한
 * - 특수문자 입력 제한
 * - 중복 닉네임 체크
 * - 키보드 상태에 따른 버튼 크기 조정
 */
export default function OnboardingNicknameScreen() {
  const [nickname, setNickname] = useState('네일조아');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const { goToNextOnboardingStep } = useOnboardingNavigation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // 한글, 영문, 숫자만 허용 (그 외는 특수문자로 간주)
  const hasSpecialCharacters = (text: string) =>
    !/^[가-힣a-zA-Z0-9\s]+$/.test(text);

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setIsError(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleNicknameChange = (text: string) => {
    setNickname(text);
    setIsError(false); // 새로운 입력이 있을 때만 에러 상태 해제
  };

  const handleNicknameSubmit = async () => {
    if (hasSpecialCharacters(nickname)) {
      showErrorToast('특수기호는 입력할 수 없어요');
      return;
    }

    try {
      setLoading(true);
      await updateNickname({ nickname: nickname.trim() });
      goToNextOnboardingStep();
    } catch (error: unknown) {
      console.error('닉네임 저장 실패:', error);
      const isDuplicate =
        error instanceof Error && error.message.includes('duplicate');
      showErrorToast(
        isDuplicate ? '중복된 닉네임이에요' : '닉네임 저장에 실패했어요',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Toast message={toastMessage} visible={showToast} position="top" />
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>반가워요!</Text>
          <Text style={styles.title}>어떤 이름으로 불러드릴까요?</Text>
        </View>
        <TextInput
          style={[styles.input, isError && styles.inputError]}
          placeholder="닉네임을 입력해주세요"
          placeholderTextColor={colors.gray300}
          value={nickname}
          onChangeText={handleNicknameChange}
          maxLength={4}
          editable={!loading}
          autoFocus
        />
        <View style={styles.conditionContainer}>
          <ErrorIcon width={12} height={12} color={colors.gray400} />
          <Text style={styles.conditionText}>
            한글 최대 4자 / 공백, 영문, 숫자, 특수기호 불가
          </Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          variant={isKeyboardVisible ? 'primaryLarge' : 'primaryMedium'}
          onPress={handleNicknameSubmit}
          loading={loading}
          disabled={!nickname.trim() || isError}
        >
          <Text style={[styles.buttonText, typography.title2_SB]}>
            입력 완료
          </Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    paddingBottom: 16,
    width: '100%',
  },
  buttonText: {
    color: colors.white,
  },
  conditionContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  conditionText: {
    ...typography.body4_M,
    color: colors.gray400,
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  content: {
    alignItems: 'flex-start',
    flex: 1,
    paddingHorizontal: 24,
    width: '100%',
  },
  input: {
    ...typography.title1_SB,
    borderBottomWidth: 1,
    borderColor: colors.gray300,
    color: colors.gray700,
    padding: 10,
    width: '100%',
  },
  inputError: {
    borderColor: colors.warn_red,
    color: colors.warn_red,
  },
  title: {
    ...typography.head1_B,
    color: colors.gray850,
    marginBottom: 8,
  },
  titleContainer: {
    marginBottom: 38,
    marginTop: 48,
  },
});
