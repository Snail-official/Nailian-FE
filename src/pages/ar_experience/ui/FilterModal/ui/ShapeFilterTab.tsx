import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Shape } from '~/shared/api/types';
import { scale, vs } from '~/shared/lib/responsive';
import Button from '~/shared/ui/Button';
import { shapeItems } from '~/features/filter';

interface ShapeFilterTabProps {
  selectedShape?: Shape;
  onSelectShape: (shape: Shape | undefined) => void;
}

// 모양(쉐입) 필터 탭 컴포넌트
export function ShapeFilterTab({
  selectedShape,
  onSelectShape,
}: ShapeFilterTabProps) {
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
