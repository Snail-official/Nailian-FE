import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import StepTitle from '../ui/StepTitle';
import { usePersonalNail, STEP_TITLES } from '../PersonalNailContext';

// 손톱 바디 길이 옵션 정의
const NAIL_BODY_LENGTH_OPTIONS = ['짧은 편이다', '중간인 편이다', '긴 편이다'];

function NailBodyLengthStep() {
  const { handleSelectAnswer } = usePersonalNail();
  const [selectedLength, setSelectedLength] = useState<number | null>(null);

  const handleLengthSelect = (index: number) => {
    setSelectedLength(index);
    handleSelectAnswer(5, index);
  };

  return (
    <View style={styles.container}>
      <StepTitle title={STEP_TITLES[5]} />
      <View style={styles.content}>
        <View style={styles.optionsContainer}>
          {NAIL_BODY_LENGTH_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={`nail-body-length-${option}`}
              style={[
                styles.optionButton,
                selectedLength === index && styles.selectedButton,
              ]}
              onPress={() => handleLengthSelect(index)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedLength === index && styles.selectedText,
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

export default NailBodyLengthStep;
