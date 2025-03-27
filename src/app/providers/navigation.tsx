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
import ErrorBoundary from '~/pages/error';

const Stack = createNativeStackNavigator<RootStackParamList>();

/* eslint-disable react/jsx-props-no-spreading */

// ErrorBoundary로 컴포넌트를 감싸는 HOC
function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/*
 * 앱 네비게이션 구조
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
        <Stack.Screen
          name="SocialLogin"
          component={withErrorBoundary(SocialLoginScreen)}
        />
        <Stack.Screen
          name="OnboardingEntry"
          component={withErrorBoundary(OnboardingEntryScreen)}
        />
        <Stack.Screen
          name="OnboardingNickname"
          component={withErrorBoundary(OnboardingNicknameScreen)}
        />
        <Stack.Screen
          name="OnboardingPreferences"
          component={withErrorBoundary(NailSelectScreen)}
        />
        <Stack.Screen
          name="MainHome"
          component={withErrorBoundary(MainHomeScreen)}
        />
        <Stack.Screen
          name="MyPage"
          component={withErrorBoundary(MyPageScreen)}
        />
        <Stack.Screen
          name="NailSetListPage"
          component={withErrorBoundary(NailSetListPage)}
        />
        <Stack.Screen
          name="NailSetDetailPage"
          component={withErrorBoundary(NailSetDetailPage)}
        />
        <Stack.Screen
          name="ARExperiencePage"
          component={withErrorBoundary(ARExperiencePage)}
        />
        <Stack.Screen
          name="ARCameraPage"
          component={withErrorBoundary(ARCameraPage)}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
