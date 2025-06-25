import React from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import { INailSet } from '~/shared/types/nail-set';
import NailSet from '~/features/nail-set/ui/NailSet';
import { NailSetGridProps } from '../model/types';

// 네일 세트 UI 레이아웃 상수
const NAIL_SET_WIDTH = scale(160);
const HORIZONTAL_SPACING = scale(12);
const TOTAL_NAIL_SETS_WIDTH = NAIL_SET_WIDTH * 2 + HORIZONTAL_SPACING;

// 네일 세트 그리드 위젯
export function NailSetGrid({
  data,
  onItemPress,
  isFetchingNextPage = false,
  onEndReached,
  onEndReachedThreshold = 0.3,
  hasNextPage = false,
}: NailSetGridProps) {
  // 로딩 표시 렌더링
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={colors.purple500} />
      </View>
    );
  };

  // 네일 세트 렌더링 함수
  const renderNailSet = ({ item }: { item: INailSet }) => (
    <TouchableOpacity
      style={styles.nailSetItem}
      onPress={() => onItemPress(item)}
      activeOpacity={1}
    >
      <NailSet nailImages={item} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.centerContainer}>
      <FlatList
        data={data}
        renderItem={renderNailSet}
        keyExtractor={item => `nail-set-${item.id}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        contentContainerStyle={styles.listContent}
        onEndReached={() => hasNextPage && onEndReached?.()}
        onEndReachedThreshold={onEndReachedThreshold}
        ListFooterComponent={renderFooter}
        bounces={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  /** 중앙 정렬 컨테이너 */
  centerContainer: {
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  /** 리스트 콘텐츠 스타일 */
  listContent: {
    paddingVertical: vs(12),
  },
  /** 로딩 인디케이터 컨테이너 스타일 */
  loaderContainer: {
    alignItems: 'center',
    marginVertical: vs(16),
  },
  /** 네일 세트 아이템 스타일 */
  nailSetItem: {
    marginBottom: vs(11),
    width: NAIL_SET_WIDTH,
  },
  /** 네일 세트 행 스타일 */
  row: {
    gap: HORIZONTAL_SPACING,
    width: TOTAL_NAIL_SETS_WIDTH,
  },
});
