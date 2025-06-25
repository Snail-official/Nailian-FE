import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '~/shared/styles/design';

interface ErrorMessageProps {
  message: string | null;
}

// 에러 메시지 컴포넌트
export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    alignItems: 'center',
    backgroundColor: colors.warn_red,
    borderRadius: 10,
    left: 0,
    padding: 10,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  errorText: {
    ...typography.body1_B,
    color: colors.white,
  },
});
