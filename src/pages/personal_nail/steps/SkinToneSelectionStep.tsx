import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { colors } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import CheckIcon from '~/shared/assets/icons/ic_check.svg';
import BackgroundCamera from '~/shared/ui/BackgroundCamera';
import StepTitle from '../ui/StepTitle';
import { usePersonalNail, STEP_TITLES } from '../PersonalNailContext';

// 피부톤 색상 정의
const SKIN_TONE_COLORS = ['#FFEBD4', '#E8C7A1', '#D8B48B'];

function SkinToneSelectionStep() {
  const { handleSelectAnswer, stepAnswers } = usePersonalNail();
  const [selectedTone, setSelectedTone] = useState<number | null>(
    stepAnswers[0] ? stepAnswers[0] - 1 : null,
  );

  const handleToneSelect = (index: number) => {
    setSelectedTone(index);
    handleSelectAnswer(1, index);
  };

  return (
    <View style={styles.container}>
      <StepTitle title={STEP_TITLES[1]} />
      <View style={styles.cameraContentContainer}>
        <BackgroundCamera />
        <View style={styles.content}>
          <View style={styles.colorButtonsContainer}>
            {SKIN_TONE_COLORS.map((color, index) => (
              <TouchableOpacity
                key={`skin-tone-${color}`}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedTone === index && styles.selectedButton,
                ]}
                onPress={() => handleToneSelect(index)}
                activeOpacity={0.8}
              >
                {selectedTone === index && (
                  <View style={styles.checkIconContainer}>
                    <CheckIcon
                      width={scale(18)}
                      height={scale(18)}
                      color={colors.gray850}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContentContainer: {
    backgroundColor: colors.black,
    flex: 1,
    position: 'relative',
  },
  checkIconContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  colorButton: {
    borderRadius: 4,
    height: scale(82),
    width: scale(82),
  },
  colorButtonsContainer: {
    flexDirection: 'row',
    gap: scale(24),
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: vs(48 + 64),
    paddingHorizontal: scale(20),
    zIndex: 1,
  },
  selectedButton: {
    borderColor: colors.gray850,
    borderWidth: 2,
  },
});

export default SkinToneSelectionStep;
