import React, { useState } from 'react';
import {
  Text,
  TextInput,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  View,
} from 'react-native';
import { updateNickname } from '~/entities/user/api';
import { useOnboardingNavigation } from '~/features/onboarding/model/useOnboardingNavigation';
import { typography, colors } from '~/shared/styles/design';
import Button from '~/shared/ui/Button';

export default function OnboardingNicknameScreen() {
  const [nickname, setNickname] = useState('안녕하세요');
  const [loading, setLoading] = useState(false);
  const { goToNextOnboardingStep } = useOnboardingNavigation();

  const handleNicknameSubmit = async () => {
    if (!nickname.trim()) {
      Alert.alert('닉네임을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      // 닉네임 저장 API 호출
      await updateNickname({ nickname });

      // 성공 시 다음 온보딩 단계로 이동
      goToNextOnboardingStep();
    } catch (error: unknown) {
      console.error('닉네임 저장 실패:', error);

      const errorMessage =
        error instanceof Error ? error.message : '닉네임 저장에 실패했습니다.';
      Alert.alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.content}>
        <Text style={styles.title}>닉네임을 입력하세요</Text>
        <TextInput
          style={styles.input}
          placeholder="닉네임"
          value={nickname}
          onChangeText={setNickname}
          editable={!loading}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          variant="primaryLarge"
          onPress={handleNicknameSubmit}
          loading={loading}
          disabled={false}
        >
          <Text style={[styles.buttonText, typography.title2_SB]}>
            입력 완료
          </Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const BORDER_COLOR = '#ccc';

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    paddingBottom: 16,
    width: '100%',
  },
  buttonText: {
    color: colors.white,
  },
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 20,
    padding: 10,
    width: '80%',
  },
  title: {
    ...typography.head2_B,
    color: colors.gray850,
    marginBottom: 10,
  },
});
