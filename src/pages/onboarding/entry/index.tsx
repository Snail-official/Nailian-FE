import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingNavigation } from '~/features/onboarding/model/useOnboardingNavigation';
import { colors } from '~/shared/styles/design';
import { vs, ms } from '~/shared/lib/responsive';

/**
 * 온보딩 엔트리 스크린
 *
 * 사용자의 온보딩 진행 상태를 확인하고 적절한 다음 화면으로 라우팅하는 중간 화면입니다.
 *
 * 주요 기능:
 * - 사용자의 온보딩 상태 확인 및 분석
 * - 온보딩 진행 상태에 따라 다음 단계로 자동 이동
 *   - 최초 사용자: 닉네임 설정 화면으로 이동
 *   - 닉네임만 설정된 사용자: 네일 선호도 선택 화면으로 이동
 *   - 온보딩 완료된 사용자: 메인 홈 화면으로 이동
 * - 온보딩 상태 확인 중에는 로딩 인디케이터 표시
 *
 * @returns {JSX.Element} 온보딩 엔트리 스크린 컴포넌트
 */
export default function OnboardingEntryScreen() {
  const { goToNextOnboardingStep } = useOnboardingNavigation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeOnboarding = async () => {
      await goToNextOnboardingStep();
      setIsLoading(false);
    };

    initializeOnboarding();
  }, [goToNextOnboardingStep]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isLoading ? (
          <>
            <ActivityIndicator size="large" color={colors.purple500} />
            <Text style={styles.loadingText}>온보딩 상태 확인 중...</Text>
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.purple500,
    fontSize: ms(16),
    marginTop: vs(10),
  },
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
  },
});
