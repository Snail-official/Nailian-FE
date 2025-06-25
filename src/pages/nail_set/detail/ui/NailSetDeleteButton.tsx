import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '~/shared/styles/design';
import { scale } from '~/shared/lib/responsive';
import TrashIcon from '~/shared/assets/icons/ic_trash.svg';

interface NailSetDeleteButtonProps {
  isBookmarkMode: boolean;
  onPress: () => void;
}

/**
 * 네일세트 삭제 버튼 컴포넌트
 */
export function NailSetDeleteButton({
  isBookmarkMode,
  onPress,
}: NailSetDeleteButtonProps) {
  if (!isBookmarkMode) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={onPress}
      activeOpacity={1}
    >
      <TrashIcon width={scale(24)} height={scale(24)} color={colors.gray600} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
  },
});
