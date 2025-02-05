import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { componentStyles } from '../styles/common';
import CheckIcon from '../assets/icons/ic_check.svg';

/**
 * 네일 이미지 데이터 타입
 */
export interface NailData {
  /** 네일 아이템의 고유 식별자 */
  id: string;
  /** 네일 이미지 소스 */
  source: ReturnType<typeof require>;
}

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
  source: ReturnType<typeof require>;
  /** 선택 상태 */
  isSelected: boolean;
  /** 선택 이벤트 핸들러 */
  onSelect: () => void;
}

function NailItem({
  source,
  isSelected,
  onSelect,
}: NailItemProps): JSX.Element {
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={componentStyles.nailItem.container}
    >
      <Image source={source} style={componentStyles.nailItem.image} />
      {isSelected && (
        <View style={componentStyles.nailItem.selectedOverlay}>
          <View style={componentStyles.nailItem.checkIconContainer}>
            <CheckIcon width={18} height={18} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default NailItem;
