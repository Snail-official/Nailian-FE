import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Category } from '~/shared/api/types';
import { scale, vs } from '~/shared/lib/responsive';
import Button from '~/shared/ui/Button';
import { categoryItems } from '~/features/filter';

interface CategoryFilterTabProps {
  selectedCategory?: Category;
  onSelectCategory: (category: Category | undefined) => void;
}

// 카테고리 필터 탭 컴포넌트
export function CategoryFilterTab({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterTabProps) {
  // 카테고리 선택 핸들러
  const handleCategorySelect = (category: Category) => {
    // 이미 선택된 카테고리를 다시 선택하면 선택 해제
    if (selectedCategory === category) {
      onSelectCategory(undefined);
    } else {
      onSelectCategory(category);
    }
  };

  return (
    <View style={styles.container}>
      {categoryItems.map(item => (
        <Button
          key={item.id}
          variant="filter_content"
          onPress={() => handleCategorySelect(item.id)}
          isSelected={selectedCategory === item.id}
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
