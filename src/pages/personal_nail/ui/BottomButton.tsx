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
  isLastStep: boolean;
  isSubmitting: boolean;
}

function BottomButton({
  onPress,
  isLastStep,
  isSubmitting,
}: BottomButtonProps) {
  return (
    <View style={styles.bottomButtonContainer}>
      <TouchableOpacity
        style={[styles.nextButton, isSubmitting && styles.disabledButton]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={isSubmitting}
      >
        {isSubmitting && isLastStep ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.nextButtonText}>
            {isLastStep ? '결과보기' : '다음으로'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomButtonContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopColor: colors.gray100,
    borderTopWidth: 1,
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
