import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LogoIcon from '../assets/icons/logo.svg';
import AppleIcon from '../assets/icons/apple.svg';
import GoogleIcon from '../assets/icons/google.svg';
import { colors, typography, spacing, commonStyles } from '../styles/common';

const styles = StyleSheet.create({
  appleButton: {
    ...commonStyles.socialButton,
    backgroundColor: colors.black,
  },
  appleButtonText: {
    ...typography.title2,
    color: colors.white,
  },
  buttonContainer: {
    gap: spacing.small,
    marginBottom: spacing.large,
    padding: spacing.large,
  },
  buttonText: {
    ...typography.title2,
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

function OnboardingScreen() {
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
        <TouchableOpacity style={styles.appleButton}>
          <AppleIcon width={24} height={24} />
          <Text style={styles.appleButtonText}>Apple로 계속하기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton}>
          <GoogleIcon width={24} height={24} />
          <Text style={styles.buttonText}>Google로 계속하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default OnboardingScreen;
