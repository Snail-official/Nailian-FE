import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';

interface StepTitleProps {
  title: string;
}

function StepTitle({ title }: StepTitleProps) {
  return (
    <View style={styles.stepTitleContainer}>
      <Text style={styles.stepTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stepTitle: {
    color: colors.gray850,
    ...typography.head3_SB,
  },
  stepTitleContainer: {
    marginBottom: vs(40),
    marginTop: vs(27),
    paddingHorizontal: scale(20),
  },
});

export default StepTitle;
