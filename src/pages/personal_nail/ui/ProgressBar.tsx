import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressBar,
            { width: `${(currentStep / totalSteps) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {currentStep}/{totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  progressBackground: {
    backgroundColor: colors.gray100,
    borderRadius: 2,
    height: vs(6),
  },
  progressBar: {
    backgroundColor: colors.purple500,
    borderRadius: 2,
    height: '100%',
  },
  progressContainer: {
    marginTop: vs(16),
    paddingHorizontal: scale(20),
  },
  progressText: {
    color: colors.gray500,
    marginTop: vs(6),
    textAlign: 'right',
    ...typography.body2_SB,
  },
});

export default ProgressBar;
