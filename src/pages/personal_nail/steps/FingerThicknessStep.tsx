import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import StepTitle from '../ui/StepTitle';
import { usePersonalNail, STEP_TITLES } from '../PersonalNailContext';

function FingerThicknessStep() {
  const { handleSelectAnswer } = usePersonalNail();

  // 손가락 두께 선택 UI 구현

  return (
    <View style={styles.container}>
      <StepTitle title={STEP_TITLES[4]} />
      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          여기에 손가락 두께 선택 UI가 들어갑니다
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  placeholderText: {
    ...typography.body3_B,
    color: colors.gray400,
  },
});

export default FingerThicknessStep;
