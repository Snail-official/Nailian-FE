import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LogoIcon from '~/shared/assets/icons/logo.svg';
import AppleIcon from '~/shared/assets/icons/apple.svg';
import GoogleIcon from '~/shared/assets/icons/google.svg';
import { colors, typography, spacing, commonStyles } from '~/app/styles/common';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/shared/types/navigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OnboardingLogin'>;
};

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
    ...typography.button,
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
  logoContainer: {
    backgroundColor: colors.gray200,
    borderRadius: 8,
    height: 73,
    marginTop: spacing.medium,
    width: 176,
  },
  title: {
    ...typography.head2,
  },
});

/**
 * 온보딩 로그인 화면 (iOS)
 *
 * 소셜 로그인 옵션을 제공하는 첫 화면입니다.
 * - Apple 로그인
 * - Google 로그인
 */
export default function OnboardingLoginScreen({ navigation }: Props) {
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
        <TouchableOpacity
          style={styles.appleButton}
          onPress={() => navigation.navigate('OnboardingDefault')}
        >
          <AppleIcon width={24} height={24} />
          <Text style={[styles.buttonText, styles.appleButtonText]}>
            Apple로 계속하기
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => navigation.navigate('OnboardingDefault')}
        >
          <GoogleIcon width={24} height={24} />
          <Text style={styles.buttonText}>Google로 계속하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
