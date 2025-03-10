import React, { useEffect } from 'react';
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
 * iOS:
 * - Apple 로그인
 * - Kakao 로그인
 *
 * Android:
 * - Kakao 로그인
 * - Google 로그인
 */
export default function SocialLoginScreen({ navigation }: Props) {
  const { loadTokens, setTokens } = useAuthStore();
  const [isCheckingLogin, setIsCheckingLogin] = React.useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      await loadTokens();
      if (useAuthStore.getState().accessToken) {
        navigation.replace('OnboardingEntry');
      }
      setIsCheckingLogin(false);
    };

    checkLoginStatus();
  }, [navigation, loadTokens]);

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

  if (isCheckingLogin) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.purple200} />
        <Text style={styles.loadingText}>로그인 상태 확인 중...</Text>
      </View>
    );
  }

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
                <Text style={[styles.buttonText, typography.title2_SB]}>
                  Apple로 계속하기
                </Text>
              </View>
            </Button>
          ) : (
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
          )}

          {/* 구글 로그인 버튼 (공통) */}
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
});
