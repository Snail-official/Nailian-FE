import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Category } from '~/shared/api/types';
import { scale, vs } from '~/shared/lib/responsive';
import Button from '~/shared/ui/Button';

interface CategoryFilterTabProps {
  selectedCategory?: Category;
  onSelectCategory: (category: Category | undefined) => void;
}

/**
 * 카테고리 필터 탭 컴포넌트
 *
 * 네일 디자인의 카테고리 필터링을 위한 컴포넌트입니다.
 * 원컬러, 프렌치, 그라데이션, 아트 등의 카테고리 옵션을 제공합니다.
 *
 * @param {CategoryFilterTabProps} props - 카테고리 필터 탭 속성
 * @returns {JSX.Element} 카테고리 필터 탭 컴포넌트
 */
export default function CategoryFilterTab({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterTabProps) {
  // 카테고리 데이터
  const categoryItems = [
    {
      id: 'ONE_COLOR' as Category,
      name: '원컬러',
      image: Image.resolveAssetSource(
        require('~/shared/assets/images/onecolor_nukki.png'),
      ).uri,
    },
    {
      id: 'FRENCH' as Category,
      name: '프렌치',
      image: Image.resolveAssetSource(
        require('~/shared/assets/images/french_nukki.png'),
      ).uri,
    },
    {
      id: 'GRADIENT' as Category,
      name: '그라데이션',
      image: Image.resolveAssetSource(
        require('~/shared/assets/images/gradient_nukki.png'),
      ).uri,
    },
    {
      id: 'ART' as Category,
      name: '아트',
      image: Image.resolveAssetSource(
        require('~/shared/assets/images/art_nukki.png'),
      ).uri,
    },
  ];

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
