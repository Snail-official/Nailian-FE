import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import ArIcon from '~/shared/assets/icons/ic_ar.svg';
import { scale } from '~/shared/lib/responsive';

interface CameraButtonProps {
  showingResult: boolean;
  processing: boolean;
  nailSetLoaded: boolean;
  onCapture: () => void;
  onClearOverlay: () => void;
}

// 카메라 버튼 컴포넌트
export default function CameraButton({
  showingResult,
  processing,
  nailSetLoaded,
  onCapture,
  onClearOverlay,
}: CameraButtonProps) {
  return (
    <View style={styles.buttonContainer}>
      {!showingResult ? (
        <TouchableOpacity
          style={[
            styles.button,
            (processing || !nailSetLoaded) && styles.disabledButton,
          ]}
          onPress={onCapture}
          disabled={processing || !nailSetLoaded}
        >
          <View style={styles.buttonIconContainer}>
            <ArIcon width={scale(26)} height={scale(26)} color={colors.white} />
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={onClearOverlay}
        >
          <View style={styles.resetButtonContent}>
            <ArIcon width={scale(26)} height={scale(26)} color={colors.white} />
            <Text style={styles.buttonText}>다시찍기</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.gray750,
    borderRadius: 26,
    elevation: 5,
    height: 52,
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: 52,
  },
  buttonContainer: {
    bottom: 30,
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 999,
  },
  buttonIconContainer: {
    alignItems: 'center',
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  buttonText: {
    ...typography.body2_SB,
    color: colors.white,
  },
  disabledButton: {
    backgroundColor: colors.gray300,
  },
  resetButton: {
    borderRadius: 21,
    height: 42,
    width: 134,
  },
  resetButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: scale(6),
    paddingHorizontal: scale(16),
  },
});
