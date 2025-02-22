import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '~/shared/styles/design';
import CheckIcon from '~/shared/assets/icons/ic_check.svg';

interface ListItemProps {
  /** 리스트 아이템 텍스트 */
  text: string;
  /** 선택 여부 */
  selected: boolean;
  /** 클릭 핸들러 */
  onPress: () => void;
}

export default function ListItem({ text, selected, onPress }: ListItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text
        style={[
          styles.text,
          selected ? styles.selectedText : styles.normalText,
        ]}
      >
        {text}
      </Text>
      {selected && (
        <CheckIcon
          width={18}
          height={18}
          fill={colors.purple500}
          stroke={colors.white}
          strokeWidth={1.6}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.medium,
    paddingHorizontal: 22,
    width: 375,
  },
  normalText: {
    ...typography.body2_SB,
    color: colors.gray700,
  },
  selectedText: {
    ...typography.body1_B,
    color: colors.purple500,
  },
  text: {
    letterSpacing: -0.14,
  },
});
