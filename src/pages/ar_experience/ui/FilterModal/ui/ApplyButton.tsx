import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import Button from '~/shared/ui/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ApplyButtonProps {
  onApply: () => void;
  enabled: boolean;
}

// 필터 적용 버튼 컴포넌트
export function ApplyButton({ onApply, enabled }: ApplyButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.buttonContainer,
        { paddingBottom: insets.bottom + vs(16) },
      ]}
    >
      <Button variant="secondaryMedium" onPress={onApply} disabled={!enabled}>
        <Text style={[typography.title2_SB, { color: colors.white }]}>
          적용하기
        </Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    bottom: 0,
    left: 0,
    paddingHorizontal: scale(20),
    position: 'absolute',
    right: 0,
  },
});
