import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LogoIcon from '../assets/icons/logo.svg';
import KakaoIcon from '../assets/icons/kakao.svg';
import GoogleIcon from '../assets/icons/google.svg';
import { colors, typography, spacing, commonStyles } from '../styles/common';

type RootStackParamList = {
  OnboardingLogin: undefined;
  OnboardingDefault: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OnboardingLogin'>;
};

const styles = StyleSheet.create({
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
  kakaoButton: {
    ...commonStyles.socialButton,
    backgroundColor: colors.kakaoYellow,
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

function OnboardingLoginScreen({ navigation }: Props): JSX.Element {
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
          style={styles.kakaoButton}
          onPress={() => navigation.navigate('OnboardingDefault')}
        >
          <KakaoIcon width={24} height={24} />
          <Text style={styles.buttonText}>Kakao로 계속하기</Text>
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

export default OnboardingLoginScreen;
