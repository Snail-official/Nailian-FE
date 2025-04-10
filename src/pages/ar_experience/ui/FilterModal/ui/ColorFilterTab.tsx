import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Color } from '~/shared/api/types';
import { colors, typography } from '~/shared/styles/design';
import { scale } from '~/shared/lib/responsive';
import ListItem from '~/shared/ui/List';

interface ColorFilterTabProps {
  selectedColor?: Color;
  onSelectColor: (color: Color | undefined) => void;
}

/**
 * 색상 필터 탭 컴포넌트
 *
 * 네일 디자인의 색상 필터링을 위한 컴포넌트입니다.
 * 다양한 색상 옵션을 제공하며 색상 원형과 텍스트로 표시합니다.
 *
 * @param {ColorFilterTabProps} props - 색상 필터 탭 속성
 * @returns {JSX.Element} 색상 필터 탭 컴포넌트
 */
export default function ColorFilterTab({
  selectedColor,
  onSelectColor,
}: ColorFilterTabProps) {
  // 색상 데이터
  const colorItems = [
    { id: 'WHITE' as Color, name: '화이트', color: colors.white },
    { id: 'BLACK' as Color, name: '블랙', color: colors.gray900 },
    { id: 'BEIGE' as Color, name: '베이지', color: '#F7EDD1' },
    { id: 'PINK' as Color, name: '핑크', color: '#FFBBD3' },
    { id: 'YELLOW' as Color, name: '옐로우', color: '#FFF53A' },
    { id: 'GREEN' as Color, name: '그린', color: '#CDFB90' },
    { id: 'BLUE' as Color, name: '블루', color: '#CADCFF' },
    { id: 'SILVER' as Color, name: '실버', color: '#EAEAEA' },
  ];

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
