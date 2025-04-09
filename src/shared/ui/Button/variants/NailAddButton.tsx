import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import PlusIcon from '~/shared/assets/icons/ic_plus.svg';
import CheckIcon from '~/shared/assets/icons/ic_check.svg';
import DeleteIcon from '~/shared/assets/icons/ic_delete.svg';
import { colors } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import { NailAddButtonProps } from '../index';

/**
 * 네일 추가 버튼 스타일 인터페이스
 */
interface NailButtonStyle {
  borderStyle: 'dashed' | 'solid';
  borderColor: string;
  backgroundColor: string;
}

/**
 * 네일 추가 버튼 컴포넌트
 *
 * 네일 추가 기능에 사용되는 특수 버튼입니다.
 * 이미지 추가, 선택, 삭제 등의 상태를 처리합니다.
 */
function NailAddButton({
  onPress,
  disabled = false,
  isSelected = false,
  imageSource,
  onImageDelete,
}: NailAddButtonProps) {
  // 네일 추가 버튼의 상태에 따른 스타일 및 아이콘 결정
  const hasImage = !!imageSource;

  // 기본 네일 버튼 스타일
  const nailButtonStyle: NailButtonStyle = {
    borderStyle: 'dashed',
    borderColor: colors.gray200,
    backgroundColor: colors.white,
  };

  let iconComponent: ReactNode = (
    <PlusIcon width={scale(12)} height={scale(12)} />
  );

  // 2. 선택 상태 (이미지 없음, 선택됨)
  if (isSelected && !hasImage) {
    nailButtonStyle.borderStyle = 'solid';
    nailButtonStyle.borderColor = colors.gray650;
    nailButtonStyle.backgroundColor = colors.white;
    iconComponent = (
      <CheckIcon width={scale(18)} height={scale(18)} color={colors.gray900} />
    );
  }

  // 3. 이미지 추가 상태 (이미지 있음, 선택되지 않음)
  if (hasImage && !isSelected) {
    nailButtonStyle.borderStyle = 'solid';
    nailButtonStyle.borderColor = colors.gray200;
    nailButtonStyle.backgroundColor = colors.gray50;
    iconComponent = null;
  }

  // 4. 이미지 선택 상태 (이미지 있음, 선택됨)
  if (hasImage && isSelected) {
    nailButtonStyle.borderStyle = 'solid';
    nailButtonStyle.borderColor = colors.gray650;
    nailButtonStyle.backgroundColor = colors.gray50;
    iconComponent = null;
  }

  // 네일 버튼 스타일 적용
  const buttonStyles: ViewStyle = {
    ...styles.nailAddButton,
    borderStyle: nailButtonStyle.borderStyle,
    borderColor: nailButtonStyle.borderColor,
    backgroundColor: nailButtonStyle.backgroundColor,
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={1}
    >
      {hasImage ? (
        <View style={styles.imageContainer}>
          <Image
            source={imageSource}
            style={[styles.nailImage, isSelected && styles.selectedNailImage]}
            resizeMode="cover"
          />
          {isSelected && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={onImageDelete}
              hitSlop={{
                top: scale(3),
                right: scale(8),
                bottom: scale(3),
                left: scale(8),
              }}
              activeOpacity={1}
            >
              <DeleteIcon width={scale(20)} height={scale(20)} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        iconComponent
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    position: 'absolute',
    right: scale(2),
    top: scale(2),
  },
  imageContainer: {
    height: '100%',
    width: '100%',
  },
  nailAddButton: {
    alignItems: 'center',
    aspectRatio: 2 / 3,
    borderRadius: scale(4),
    borderWidth: scale(1),
    height: vs(87),
    justifyContent: 'center',
    width: scale(58),
  },
  nailImage: {
    borderRadius: scale(4),
    height: '100%',
    width: '100%',
  },
  selectedNailImage: {
    opacity: 0.5,
  },
});

export default NailAddButton;
