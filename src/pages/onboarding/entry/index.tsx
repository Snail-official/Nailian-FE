import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingNavigation } from '~/features/onboarding/model/useOnboardingNavigation';
import { colors } from '~/shared/styles/design';
import { vs, ms } from '~/shared/lib/responsive';

/**
 * 온보딩 엔트리 스크린
 *
 * @description 유저의 온보딩 상태를 확인한 후, 적절한 페이지로 이동하는 역할
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
