import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import KakaoIcon from '../assets/icons/kakao.svg';
import GoogleIcon from '../assets/icons/google.svg';

const Colors = {
  WHITE: '#FFFFFF',
  BORDER_GRAY: '#E5E5E5',
  KAKAO_YELLOW: '#FEE500',
} as const;

const styles = StyleSheet.create({
  buttonContainer: {
    gap: 12,
    padding: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: Colors.WHITE,
    flex: 1,
  },
  googleButton: {
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    borderColor: Colors.BORDER_GRAY,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  kakaoButton: {
    alignItems: 'center',
    backgroundColor: Colors.KAKAO_YELLOW,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
});

function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>더욱더 편리한{'\n'}내일의 시작,</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.kakaoButton}>
          <KakaoIcon width={24} height={24} />
          <Text style={styles.buttonText}>카카오로 계속하기</Text>
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
