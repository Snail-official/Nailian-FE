import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import ArIcon from '~/shared/assets/icons/ic_ar.svg';
import { scale } from '~/shared/lib/responsive';

interface ArButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: object;
}

// AR 버튼 컴포넌트
export default function ArButton({
  onPress,
  disabled = false,
  style,
}: ArButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={1}
    >
      <View style={styles.content}>
        <ArIcon width={scale(26)} height={scale(26)} color={colors.white} />
        <Text style={styles.text}>내 손에 올려보기</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.purple500,
    borderRadius: scale(24),
    height: scale(42),
    justifyContent: 'center',
    padding: scale(5),
    paddingHorizontal: scale(10),
    width: scale(179),
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: scale(8),
    justifyContent: 'center',
  },
  text: {
    ...typography.body2_SB,
    color: colors.white,
  },
});
