import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '~/shared/types/navigation';
/* eslint-disable import/no-unresolved */
import NailSelectScreen from '~/pages/onboarding/nail-select';
import OnboardingLoginScreen from '~/pages/onboarding/login/OnboardingLoginScreen';
/* eslint-enable import/no-unresolved */

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * 앱 네비게이션 구조
 *
 * 온보딩 플로우:
 * - OnboardingLogin: 로그인 화면 (iOS/Android 플랫폼별 구현)
 * - OnboardingDefault: 네일 선택 화면
 */
export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="OnboardingLogin"
          component={OnboardingLoginScreen}
        />
        <Stack.Screen name="OnboardingDefault" component={NailSelectScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
