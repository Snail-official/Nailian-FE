import React from 'react';
import { TouchableOpacity, Text, View, Image, StyleSheet } from 'react-native';
import CheckIcon from '~/shared/assets/icons/ic_check.svg';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import { FilterContentButtonProps } from '../index';

/**
 * 필터 콘텐츠 버튼 컴포넌트
 *
 * AR 체험 페이지의 필터 모달에서 사용되는 버튼입니다.
 * 필터 아이템(카테고리, 쉐입)의 이미지와 레이블을 표시합니다.
 */
function FilterContentButton({
  onPress,
  disabled = false,
  isSelected = false,
  imageSource,
  label,
}: FilterContentButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={1}
    >
      {/* 선택 시 체크 아이콘 */}
      {isSelected && (
        <View style={styles.checkIconContainer}>
          <CheckIcon width={18} height={18} color={colors.purple500} />
        </View>
      )}

      {/* 필터 이미지 */}
      <View style={styles.imageContainer}>
        {imageSource && (
          <Image source={imageSource} style={styles.image} resizeMode="cover" />
        )}
      </View>

      {/* 필터 레이블 */}
      <Text style={[styles.label, isSelected && styles.selectedLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkIconContainer: {
    position: 'absolute',
    right: scale(10),
    top: vs(10),
    zIndex: 1,
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.gray100,
    borderRadius: scale(4),
    borderWidth: 1,
    flexDirection: 'column',
    flexShrink: 0,
    gap: vs(6),
    height: vs(98),
    justifyContent: 'center',
    padding: scale(11),
    paddingHorizontal: scale(12),
    paddingVertical: vs(11),
    position: 'relative',
    width: scale(98),
  },
  containerSelected: {
    borderColor: colors.purple500,
    borderWidth: 2,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageContainer: {
    alignItems: 'center',
    flexShrink: 0,
    height: vs(48),
    justifyContent: 'center',
    width: scale(48),
  },
  label: {
    ...typography.body2_SB,
    color: colors.gray700,
    textAlign: 'center',
  },
  selectedLabel: {
    color: colors.purple500,
  },
});

export default FilterContentButton;
