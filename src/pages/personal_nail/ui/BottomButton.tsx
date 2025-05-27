import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';

interface BottomButtonProps {
  onPress: () => void;
  isSubmitting: boolean;
}

function BottomButton({ onPress, isSubmitting }: BottomButtonProps) {
  return (
    <View style={styles.bottomButtonContainer}>
      <TouchableOpacity
        style={[styles.nextButton, isSubmitting && styles.disabledButton]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.nextButtonText}>선택</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomButtonContainer: {
    alignItems: 'center',
    paddingBottom: vs(20),
    paddingHorizontal: scale(20),
    paddingTop: vs(12),
  },
  disabledButton: {
    opacity: 0.6,
  },
  nextButton: {
    alignItems: 'center',
    backgroundColor: colors.gray900,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: scale(60),
    paddingVertical: vs(12),
  },
  nextButtonText: {
    color: colors.white,
    ...typography.body2_SB,
  },
});

export default BottomButton;
