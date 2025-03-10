import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '~/shared/styles/design';
import { scale } from '~/shared/lib/responsive';
import CheckIcon from '~/shared/assets/icons/ic_check.svg';

interface ListItemProps {
  /** 리스트 아이템 텍스트 */
  text: string;
  /** 선택 여부 */
  selected: boolean;
  /** 클릭 핸들러 */
  onPress: () => void;
}

/**
 * 리스트 아이템 컴포넌트
 *
 * 선택 가능한 리스트 아이템을 표시하는 컴포넌트입니다.
 * 선택 시 텍스트 스타일이 변경되고 체크 아이콘이 표시됩니다.
 *
 * @example
 * <ListItem
 *   text="화이트"
 *   selected={selectedItem === 'white'}
 *   onPress={() => handleSelect('white')}
 * />
 *
 * @property {string} text - 표시할 텍스트
 * @property {boolean} selected - 선택 여부
 * @property {() => void} onPress - 클릭 핸들러
 */

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
          width={scale(18)}
          height={scale(18)}
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
    paddingHorizontal: scale(22),
    width: scale(375),
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
