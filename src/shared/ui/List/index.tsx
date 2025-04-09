import React, { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors, spacing } from '~/shared/styles/design';
import { scale } from '~/shared/lib/responsive';
import CheckIcon from '~/shared/assets/icons/ic_check.svg';

interface ListItemProps {
  /** 리스트 아이템 콘텐츠 (React 노드) */
  content: ReactNode;
  /** 선택 여부 */
  selected: boolean;
  /** 클릭 핸들러 */
  onPress: () => void;
}

/**
 * 리스트 아이템 컴포넌트
 *
 * 선택 가능한 리스트 아이템을 표시하는 컴포넌트입니다.
 * 선택 시 체크 아이콘이 표시됩니다.
 *
 * @example
 * <ListItem
 *   content={<View style={{flexDirection: 'row', alignItems: 'center'}}><View style={{backgroundColor: 'white', width: 20, height: 20, marginRight: 10}} /><Text>화이트</Text></View>}
 *   selected={selectedItem === 'white'}
 *   onPress={() => handleSelect('white')}
 * />
 *
 * @property {ReactNode} content - 표시할 React 노드
 * @property {boolean} selected - 선택 여부
 * @property {() => void} onPress - 클릭 핸들러
 */
export default function ListItem({
  content,
  selected,
  onPress,
}: ListItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={1}
    >
      <View style={styles.contentContainer}>{content}</View>
      <View style={styles.checkContainer}>
        {selected && (
          <CheckIcon
            width={scale(18)}
            height={scale(18)}
            color={colors.purple500}
            strokeWidth={1.6}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: scale(24),
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.medium,
    paddingHorizontal: scale(22),
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    paddingRight: scale(10),
  },
});
