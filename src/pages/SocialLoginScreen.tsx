import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LogoIcon from '~/shared/assets/icons/logo_sig.svg';
import KakaoIcon from '~/shared/assets/icons/kakao.svg';
import GoogleIcon from '~/shared/assets/icons/google.svg';
import AppleIcon from '~/shared/assets/icons/apple.svg';
import {
  colors,
  typography,
  spacing,
  commonStyles,
} from '~/shared/styles/design';
import { scale, vs, ms } from '~/shared/lib/responsive';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/shared/types/navigation';
import { login } from '@react-native-seoul/kakao-login';
import { loginWithKakao } from '~/entities/user/api';
import { useAuthStore } from '~/shared/store/authStore';
import Button from '~/shared/ui/Button';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SocialLogin'>;
};

/**
 * 온보딩 로그인 화면
 *
 * 사용자가 소셜 계정을 통해 앱에 로그인할 수 있는 첫 화면입니다.
 * 앱 최초 진입점으로, 사용자의 인증 상태를 확인하고 적절한 화면으로 라우팅합니다.
 *
 * 주요 기능:
 * - 기존 로그인 상태 확인 (토큰 유효성 검사)
 * - 로그인된 상태면 스플래시 화면을 표시 후 온보딩 화면으로 자동 이동
 * - 플랫폼별 소셜 로그인 옵션 제공
 *   - iOS: Apple 로그인, Kakao 로그인
 *   - Android: Google 로그인, Kakao 로그인
 * - 로그인 성공 시 온보딩 엔트리 화면으로 자동 이동
 *
 * @param {Props} props - 컴포넌트 props
 * @param {NativeStackNavigationProp<RootStackParamList, 'SocialLogin'>} props.navigation - 네비게이션 객체
 * @returns {JSX.Element} 소셜 로그인 화면 컴포넌트
 */
export default function SocialLoginScreen({ navigation }: Props) {
  const { loadTokens, setTokens } = useAuthStore();
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);
  const [showSplash, setShowSplash] = useState(false);

  /**
   * 로그인 상태 확인
   * 앱 실행 시 기존 로그인 토큰이 있는지 확인하고, 있으면 스플래시 화면을 표시한 후
   * 온보딩 엔트리 화면으로 자동 이동합니다.
   */
  useEffect(() => {
    const checkLoginStatus = async () => {
      await loadTokens();
      setIsCheckingLogin(false);
      if (useAuthStore.getState().accessToken) {
        // 이미 로그인된 상태라면 스플래시 화면을 표시
        setShowSplash(true);
        // 2초 후에 온보딩 엔트리 화면으로 이동
        setTimeout(() => {
          navigation.replace('OnboardingEntry');
        }, 2000);
      } else {
        // 로그인되지 않은 상태라면 로그인 화면을 표시
      }
    };

    checkLoginStatus();
  }, [navigation, loadTokens]);

  /**
   * 카카오 로그인 처리
   * 카카오 SDK를 통해 로그인 후, 받은 토큰으로 백엔드 서버에 인증하고
   * 성공 시 앱 내부 토큰을 저장하고 온보딩 엔트리 화면으로 이동합니다.
   */
  const handleKakaoLogin = async () => {
    try {
      const kakaoToken = await login();

      const response = await loginWithKakao({
        kakaoAccessToken: kakaoToken.accessToken,
      });

      if (!response.data) {
        throw new Error('서비스 로그인 응답이 올바르지 않습니다.');
      }

      // Zustand 스토어에 토큰 저장
      await setTokens(response.data.accessToken, response.data.refreshToken);

      // 로그인 성공 후 다음 화면으로 이동
      navigation.replace('OnboardingEntry');
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
    }
  };

  // 로딩 중 화면
  if (isCheckingLogin) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.purple200} />
        <Text style={styles.loadingText}>로그인 상태 확인 중...</Text>
      </View>
    );
  }

  // 스플래시 화면
  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <LogoIcon width={scale(171.11)} height={vs(56)} />
        <Text style={styles.logoText}>
          AR 네일 체험과 네일샵 예약을 한 번에
        </Text>
      </View>
    );
  }

  // 소셜 로그인 화면
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <LogoIcon width={scale(171.11)} height={vs(56)} />
            <Text style={styles.logoText}>
              AR 네일 체험과 네일샵 예약을 한 번에
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {/* 플랫폼별 로그인 버튼 */}
          {Platform.OS === 'ios' ? (
            <Button
              variant="appleMedium"
              onPress={() => {}}
              disabled={false}
              loading={false}
            >
              <View style={styles.socialButtonContent}>
                <AppleIcon width={scale(24)} height={scale(24)} />
                <Text
                  style={[
                    styles.buttonText,
                    { color: colors.white },
                    typography.title2_SB,
                  ]}
                >
                  Apple로 계속하기
                </Text>
              </View>
            </Button>
          ) : (
            <Button
              variant="googleMedium"
              onPress={() => {}}
              disabled={false}
              loading={false}
            >
              <View style={styles.socialButtonContent}>
                <GoogleIcon width={scale(24)} height={scale(24)} />
                <Text style={[styles.buttonText, typography.title2_SB]}>
                  Google로 계속하기
                </Text>
              </View>
            </Button>
          )}
          {/* 카카오 로그인 버튼 (공통) */}
          <Button
            variant="kakaoMedium"
            onPress={handleKakaoLogin}
            disabled={false}
            loading={false}
          >
            <View style={styles.socialButtonContent}>
              <KakaoIcon width={scale(24)} height={scale(24)} />
              <Text style={[styles.buttonText, typography.title2_SB]}>
                Kakao로 계속하기
              </Text>
            </View>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    gap: spacing.medium,
    marginBottom: spacing.xlarge,
    paddingHorizontal: spacing.large,
    width: '100%',
  },
  buttonText: {
    color: colors.gray850,
  },
  container: {
    ...commonStyles.screen,
    alignItems: 'center',
    alignSelf: 'center',
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: scale(360),
    paddingHorizontal: spacing.large,
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.gray200,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.gray850,
    fontSize: ms(16),
    marginTop: vs(10),
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    ...typography.body4_M,
    color: colors.gray650,
    letterSpacing: -0.12,
    marginTop: spacing.small,
  },
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
  },
  socialButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.small,
  },
  splashContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flex: 1,
    justifyContent: 'center',
  },
});
