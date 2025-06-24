import React, { useState } from 'react';
import {
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { updateNickname } from '~/entities/user/api';
import { useOnboardingNavigation } from '~/features/onboarding/model/useOnboardingNavigation';
import { typography, colors } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import Button from '~/shared/ui/Button';
import ErrorIcon from '~/shared/assets/icons/ic_error.svg';
import { toast } from '~/shared/lib/toast';
import { hasSpecialCharacters } from '~/shared/lib/validation';
import { useKeyboardVisibility } from '~/shared/hooks/useKeyboardVisibility';

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
  const [nickname, setNickname] = useState('');
  const [isError, setIsError] = useState(false);
  const { goToNextOnboardingStep } = useOnboardingNavigation();
  const isKeyboardVisible = useKeyboardVisibility();

  // 유효성 검사 함수는 공통 라이브러리로 이동

  /**
   * 에러 토스트 메시지를 표시하는 함수
   *
   * @param message 표시할 에러 메시지
   */
  const showErrorToast = (message: string) => {
    toast.showToast(message);
    setIsError(true);
  };

  /**
   * 닉네임 입력값 변경 핸들러
   *
   * @param text 새로 입력된 닉네임 텍스트
   */
  const handleNicknameChange = (text: string) => {
    setNickname(text);
    setIsError(false); // 새로운 입력이 있을 때만 에러 상태 해제
  };

  // 닉네임 업데이트를 위한 뮤테이션
  const { mutate: updateNicknameMutation, isPending: loading } = useMutation({
    mutationFn: updateNickname,
    onSuccess: () => {
      goToNextOnboardingStep();
    },
    onError: (error: unknown) => {
      console.error('닉네임 저장 실패:', error);
      const isDuplicate =
        error instanceof Error && error.message.includes('duplicate');
      showErrorToast(
        isDuplicate ? '중복된 닉네임이에요' : '닉네임 저장에 실패했어요',
      );
    },
  });

  /**
   * 닉네임 제출 핸들러
   *
   * 입력된 닉네임의 유효성을 검사하고, 유효하다면 서버에 저장합니다.
   * 특수문자가 포함되어 있거나 중복된 닉네임인 경우 에러 토스트를 표시합니다.
   */
  const handleNicknameSubmit = () => {
    if (hasSpecialCharacters(nickname)) {
      showErrorToast('특수기호는 입력할 수 없어요');
      return;
    }

    updateNicknameMutation({ nickname: nickname.trim() });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              반가워요!
              {'\n'}
              어떤 이름으로 불러드릴까요?
            </Text>
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
            <ErrorIcon
              width={scale(12)}
              height={scale(12)}
              color={colors.gray400}
            />
            <Text style={styles.conditionText}>
              한글 최대 4자 / 공백, 영문, 숫자, 특수기호 불가
            </Text>
          </View>
        </View>
        <View
          style={
            isKeyboardVisible
              ? { ...styles.bottomButtonContainer, paddingBottom: vs(0) }
              : styles.bottomButtonContainer
          }
        >
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomButtonContainer: {
    alignItems: 'center',
    paddingBottom: vs(16),
    width: '100%',
  },
  buttonText: {
    color: colors.white,
  },
  conditionContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: scale(4),
    marginTop: vs(8),
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
    paddingHorizontal: scale(24),
    width: '100%',
  },
  input: {
    ...typography.title1_SB,
    borderBottomWidth: 1,
    borderColor: colors.gray300,
    color: colors.gray700,
    padding: scale(10),
    width: '100%',
  },
  inputError: {
    borderColor: colors.warn_red,
    color: colors.warn_red,
  },
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
  },
  title: {
    ...typography.head1_B,
    color: colors.gray850,
  },
  titleContainer: {
    marginBottom: vs(34),
    marginTop: vs(48),
  },
});
