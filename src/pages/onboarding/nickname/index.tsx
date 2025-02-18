import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { updateNickname } from '~/entities/user/api';
import { useOnboardingNavigation } from '~/features/onboarding/model/useOnboardingNavigation';

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
    <View style={styles.container}>
      <Text style={styles.title}>닉네임을 입력하세요</Text>
      <TextInput
        style={styles.input}
        placeholder="닉네임"
        value={nickname}
        onChangeText={setNickname}
        editable={!loading} // API 요청 중 입력 비활성화
      />
      <Button
        title={loading ? '저장 중...' : '다음'}
        onPress={handleNicknameSubmit}
        disabled={loading}
      />
    </View>
  );
}

const BORDER_COLOR = '#ccc';

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  input: {
    borderBottomWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 20,
    padding: 10,
    width: '80%',
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});
