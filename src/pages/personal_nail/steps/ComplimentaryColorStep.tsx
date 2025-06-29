import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { colors } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import CheckIcon from '~/shared/assets/icons/ic_check.svg';
import BackgroundCamera from '~/shared/ui/BackgroundCamera';
import StepTitle from '../ui/StepTitle';
import { usePersonalNail, STEP_TITLES } from '../PersonalNailContext';

// 어울리는 컬러 정의
const COMPLIMENTARY_COLORS = ['#FF8E65', '#F26964'];

function ComplimentaryColorStep() {
  const { handleSelectAnswer, stepAnswers } = usePersonalNail();
  const [selectedColor, setSelectedColor] = useState<number | null>(
    stepAnswers[1] ? stepAnswers[1] - 1 : null,
  );

  const handleColorSelect = (index: number) => {
    setSelectedColor(index);
    handleSelectAnswer(2, index);
  };

  return (
    <View style={styles.container}>
      <StepTitle title={STEP_TITLES[2]} />
      <View style={styles.cameraContentContainer}>
        <BackgroundCamera key="complimentary-color-camera" />
        <View style={styles.content}>
          <View style={styles.colorButtonsContainer}>
            {COMPLIMENTARY_COLORS.map((color, index) => (
              <TouchableOpacity
                key={`complimentary-color-${color}`}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === index && styles.selectedButton,
                ]}
                onPress={() => handleColorSelect(index)}
                activeOpacity={0.8}
              >
                {selectedColor === index && (
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
    zIndex: 2,
  },
  selectedButton: {
    borderColor: colors.gray850,
    borderWidth: 2,
  },
});

export default ComplimentaryColorStep;
