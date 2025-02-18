import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LogoIcon from '~/shared/assets/icons/logo.svg';
import KakaoIcon from '~/shared/assets/icons/kakao.svg';
import GoogleIcon from '~/shared/assets/icons/google.svg';
import AppleIcon from '~/shared/assets/icons/apple.svg';
import {
  colors,
  typography,
  spacing,
  commonStyles,
} from '~/shared/styles/design';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/shared/types/navigation';
import { login } from '@react-native-seoul/kakao-login';
import { loginWithKakao } from '~/entities/user/api';
import { useAuthStore } from '~/shared/store/authStore';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OnboardingLogin'>;
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
export default function OnboardingLoginScreen({ navigation }: Props) {
  const { loadTokens, setTokens } = useAuthStore();
  const [isCheckingLogin, setIsCheckingLogin] = React.useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      await loadTokens();
      if (useAuthStore.getState().accessToken) {
        navigation.replace('OnboardingDefault');
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
      navigation.replace('OnboardingDefault');
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
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>더욱더 편리한{'\n'}내일의 시작,</Text>
        </View>
        <View style={styles.logoContainer}>
          <LogoIcon width={176} height={73} />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {/* Kakao 로그인 버튼 (공통) */}
        <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
          <KakaoIcon width={24} height={24} />
          <Text style={styles.buttonText}>Kakao로 계속하기</Text>
        </TouchableOpacity>

        {/* 플랫폼별 로그인 버튼 렌더링 */}
        {Platform.OS === 'ios' ? (
          <TouchableOpacity
            style={styles.appleButton}
            onPress={() => navigation.navigate('OnboardingDefault')}
          >
            <AppleIcon width={24} height={24} />
            <Text style={[styles.buttonText, styles.appleButtonText]}>
              Apple로 계속하기
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => navigation.navigate('OnboardingDefault')}
          >
            <GoogleIcon width={24} height={24} />
            <Text style={styles.buttonText}>Google로 계속하기</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appleButton: {
    ...commonStyles.socialButton,
    backgroundColor: colors.black,
  },
  appleButtonText: {
    color: colors.white,
  },
  buttonContainer: {
    gap: spacing.small,
    marginBottom: spacing.large,
    padding: spacing.large,
  },
  buttonText: {
    ...typography.title2_SB,
    color: colors.gray850,
  },
  container: {
    ...commonStyles.screen,
    alignSelf: 'center',
    height: 800,
    width: 360,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.large,
    paddingTop: spacing.xlarge,
  },
  googleButton: {
    ...commonStyles.socialButton,
    backgroundColor: colors.white,
    borderColor: colors.borderGray,
    borderWidth: 1,
  },
  header: {
    paddingTop: spacing.xlarge,
  },
  kakaoButton: {
    ...commonStyles.socialButton,
    backgroundColor: colors.kakaoYellow,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.gray200,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.gray850,
    fontSize: 16,
    marginTop: 10,
  },
  logoContainer: {
    backgroundColor: colors.gray200,
    borderRadius: 8,
    height: 73,
    marginTop: spacing.medium,
    width: 176,
  },
  title: {
    ...typography.head2_B,
    color: colors.gray850,
  },
});
