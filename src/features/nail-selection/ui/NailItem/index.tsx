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
 * 사용자가 선택할 수 있는 네일 디자인 이미지를 표시하는 컴포넌트입니다.
 * 온보딩 네일 선택 화면과 AR 체험 화면에서 사용되며,
 * 선택 상태에 따라 테두리와 체크 아이콘이 표시됩니다.
 *
 * 주요 기능:
 * - 네일 디자인 이미지 표시
 * - 선택 상태에 따른 시각적 피드백 제공 (테두리, 체크 아이콘)
 * - 터치 이벤트 처리를 통한 선택 기능
 *
 * @param {NailItemProps} props - 네일 아이템 컴포넌트 속성
 * @param {ImageSourcePropType} props.source - 표시할 네일 이미지 소스
 * @param {boolean} props.isSelected - 현재 선택 상태
 * @param {() => void} props.onSelect - 선택 시 호출될 콜백 함수
 * @returns {JSX.Element} 렌더링된 네일 이미지 컴포넌트
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
