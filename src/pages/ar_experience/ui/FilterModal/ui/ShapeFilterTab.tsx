import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Shape } from '~/shared/api/types';
import { scale, vs } from '~/shared/lib/responsive';
import Button from '~/shared/ui/Button';

interface ShapeFilterTabProps {
  selectedShape?: Shape;
  onSelectShape: (shape: Shape | undefined) => void;
}

/**
 * 모양(쉐입) 필터 탭 컴포넌트
 *
 * 네일 디자인의 모양 필터링을 위한 컴포넌트입니다.
 * 스퀘어, 라운드, 아몬드 등 다양한 네일 모양 옵션을 제공합니다.
 *
 * @param {ShapeFilterTabProps} props - 모양 필터 탭 속성
 * @returns {JSX.Element} 모양 필터 탭 컴포넌트
 */
export default function ShapeFilterTab({
  selectedShape,
  onSelectShape,
}: ShapeFilterTabProps) {
  // 모양 데이터
  const shapeItems = [
    {
      id: 'SQUARE' as Shape,
      name: '스퀘어',
      image: Image.resolveAssetSource(
        require('~/shared/assets/images/img_square.png'),
      ).uri,
    },
    {
      id: 'ROUND' as Shape,
      name: '라운드',
      image: Image.resolveAssetSource(
        require('~/shared/assets/images/img_round.png'),
      ).uri,
    },
    {
      id: 'ALMOND' as Shape,
      name: '아몬드',
      image: Image.resolveAssetSource(
        require('~/shared/assets/images/img_almond.png'),
      ).uri,
    },
    {
      id: 'BALLERINA' as Shape,
      name: '발레리나',
      image: Image.resolveAssetSource(
        require('~/shared/assets/images/img_ballet.png'),
      ).uri,
    },
    {
      id: 'STILETTO' as Shape,
      name: '스틸레토',
      image: Image.resolveAssetSource(
        require('~/shared/assets/images/img_still.png'),
      ).uri,
    },
  ];

  // 모양 선택 핸들러
  const handleShapeSelect = (shape: Shape) => {
    // 이미 선택된 모양을 다시 선택하면 선택 해제
    if (selectedShape === shape) {
      onSelectShape(undefined);
    } else {
      onSelectShape(shape);
    }
  };

  return (
    <View style={styles.container}>
      {shapeItems.map(item => (
        <Button
          key={item.id}
          variant="filter_content"
          onPress={() => handleShapeSelect(item.id)}
          isSelected={selectedShape === item.id}
          imageSource={{ uri: item.image }}
          label={item.name}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(12),
    marginTop: vs(3),
    paddingHorizontal: scale(28),
    paddingTop: vs(4),
    width: '100%',
  },
});
