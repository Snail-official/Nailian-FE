import React from 'react';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '~/shared/types/navigation';
import { setNavigationRef } from '~/shared/api/interceptors';

import NailSelectScreen from '~/pages/onboarding/nail-select';
import OnboardingEntryScreen from '~/pages/onboarding/entry';
import OnboardingNicknameScreen from '~/pages/onboarding/nickname';
import SocialLoginScreen from '~/pages/SocialLoginScreen';
import MainHomeScreen from '~/pages/main_home';
import MyPageScreen from '~/pages/my_page';
import NailSetListPage from '~/pages/nail_set/list';
import NailSetDetailPage from '~/pages/nail_set/detail';
import ARExperiencePage from '~/pages/ar_experience';
import ARCameraPage from '~/pages/ar_camera';

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
    <NavigationContainer
      ref={navigatorRef => {
        if (navigatorRef) {
          setNavigationRef(
            navigatorRef as NavigationContainerRef<RootStackParamList>,
          );
        }
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SocialLogin" component={SocialLoginScreen} />
        <Stack.Screen
          name="OnboardingEntry"
          component={OnboardingEntryScreen}
        />
        <Stack.Screen
          name="OnboardingNickname"
          component={OnboardingNicknameScreen}
        />
        <Stack.Screen
          name="OnboardingPreferences"
          component={NailSelectScreen}
        />
        <Stack.Screen name="MainHome" component={MainHomeScreen} />
        <Stack.Screen name="MyPage" component={MyPageScreen} />
        <Stack.Screen name="NailSetListPage" component={NailSetListPage} />
        <Stack.Screen name="NailSetDetailPage" component={NailSetDetailPage} />
        <Stack.Screen name="ARExperiencePage" component={ARExperiencePage} />
        <Stack.Screen name="ARCameraPage" component={ARCameraPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
