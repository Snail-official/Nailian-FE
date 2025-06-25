import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Color } from '~/shared/api/types';
import { colors, typography } from '~/shared/styles/design';
import { scale } from '~/shared/lib/responsive';
import ListItem from '~/shared/ui/List';
import { colorItems } from '~/features/filter';

interface ColorFilterTabProps {
  selectedColor?: Color;
  onSelectColor: (color: Color | undefined) => void;
}

// 색상 필터 탭 컴포넌트
export function ColorFilterTab({
  selectedColor,
  onSelectColor,
}: ColorFilterTabProps) {
  // 색상 선택 핸들러
  const handleColorSelect = (color: Color) => {
    // 이미 선택된 색상을 다시 선택하면 선택 해제
    if (selectedColor === color) {
      onSelectColor(undefined);
    } else {
      onSelectColor(color);
    }
  };

  return (
    <View style={styles.container}>
      {colorItems.map(item => (
        <ListItem
          key={item.id}
          content={
            <View style={styles.colorItemContent}>
              <View
                style={[
                  styles.colorCircle,
                  { backgroundColor: item.color },
                  item.id === 'WHITE' && styles.whiteColorCircle,
                ]}
              />
              <Text
                style={[
                  styles.colorItemText,
                  selectedColor === item.id && styles.colorItemTextSelected,
                ]}
              >
                {item.name}
              </Text>
            </View>
          }
          selected={selectedColor === item.id}
          onPress={() => handleColorSelect(item.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  colorCircle: {
    borderRadius: scale(22),
    height: scale(22),
    marginRight: scale(10),
    width: scale(22),
  },
  colorItemContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
  },
  colorItemText: {
    ...typography.body2_SB,
    color: colors.gray700,
  },
  colorItemTextSelected: {
    ...typography.body2_SB,
    color: colors.purple500,
  },
  container: {
    width: '100%',
  },
  whiteColorCircle: {
    borderColor: colors.gray100,
    borderWidth: 1,
  },
});
