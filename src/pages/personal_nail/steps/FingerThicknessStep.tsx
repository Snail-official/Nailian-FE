import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import StepTitle from '../ui/StepTitle';
import { usePersonalNail, STEP_TITLES } from '../PersonalNailContext';

// 손가락 두께 옵션 정의
const FINGER_THICKNESS_OPTIONS = [
  '가늘고 곧은 편이다',
  '마디가 두드러지는 편이다',
  '두께감이 있으며 상대적으로 짧은 편이다',
];

function FingerThicknessStep() {
  const { handleSelectAnswer, stepAnswers } = usePersonalNail();
  const [selectedThickness, setSelectedThickness] = useState<number | null>(
    stepAnswers[3] ? stepAnswers[3] - 1 : null,
  );

  const handleThicknessSelect = (index: number) => {
    setSelectedThickness(index);
    handleSelectAnswer(4, index);
  };

  return (
    <View style={styles.container}>
      <StepTitle title={STEP_TITLES[4]} />
      <View style={styles.content}>
        <View style={styles.optionsContainer}>
          {FINGER_THICKNESS_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={`finger-thickness-${option}`}
              style={[
                styles.optionButton,
                selectedThickness === index && styles.selectedButton,
              ]}
              onPress={() => handleThicknessSelect(index)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedThickness === index && styles.selectedText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
    justifyContent: 'flex-end',
    paddingBottom: vs(28),
    paddingHorizontal: scale(20),
  },
  optionButton: {
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: vs(16),
    width: '100%',
  },
  optionText: {
    ...typography.body2_SB,
    color: colors.gray850,
  },
  optionsContainer: {
    gap: vs(10),
    width: '100%',
  },
  selectedButton: {
    backgroundColor: colors.purple500,
  },
  selectedText: {
    color: colors.white,
  },
});

export default FingerThicknessStep;
