import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import { componentStyles, colors } from '~/shared/styles/design';
import { scale } from '~/shared/lib/responsive';
import CheckIcon from '~/shared/assets/icons/ic_check.svg';

/**
 * 선택 가능한 네일 이미지 컴포넌트
 *
 * 이미지를 표시하고 선택 상태를 시각적으로 나타냅니다.
 * 선택 시 테두리와 체크 아이콘이 표시됩니다.
 *
 * @example
 * <NailItem
 *   source={imageSource}
 *   isSelected={isSelected}
 *   onSelect={() => handleSelect(id)}
 * />
 */
interface NailItemProps {
  /** 네일 이미지 소스 */
  source: ImageSourcePropType;
  /** 선택 상태 */
  isSelected: boolean;
  /** 선택 이벤트 핸들러 */
  onSelect: () => void;
}

export default function NailItem({
  source,
  isSelected,
  onSelect,
}: NailItemProps) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={componentStyles.nailItem.container}
    >
      <Image source={source} style={componentStyles.nailItem.image} />
      {isSelected && (
        <View style={componentStyles.nailItem.selectedOverlay}>
          <View style={componentStyles.nailItem.checkIconContainer}>
            <CheckIcon
              width={scale(18)}
              height={scale(18)}
              color={colors.gray900}
            />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
