import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { colors } from '~/shared/styles/design';
import { NailPreferencesResponse } from '~/shared/api/types';
import { fetchNailPreferences } from '~/entities/nail-preference/api';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

interface NailGridProps {
  /**
   * 네일 아이템 선택 시 호출되는 콜백 함수
   */
  onSelectNail?: (id: string) => void;
}

/**
 * 네일 그리드 컴포넌트
 *
 * 네일 디자인 이미지를 그리드 형태로 표시합니다.
 * - 무한 스크롤을 지원합니다.
 * - 터치 가능한 네일 아이템을 제공합니다.
 *
 * @returns {JSX.Element} 네일 그리드 컴포넌트
 */
export function NailGrid({ onSelectNail }: NailGridProps) {
  const [nails, setNails] = useState<{ id: string; imageUrl: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollViewRef =
    useRef<React.ComponentRef<typeof BottomSheetScrollView>>(null);

  // 네일 이미지 로드 함수
  const loadNailPreferences = useCallback(
    async (page = 1) => {
      if (isLoading || !hasMore) return;

      try {
        setIsLoading(true);
        const response: NailPreferencesResponse = await fetchNailPreferences({
          page,
          size: 24,
        });

        if (response.data) {
          const newData =
            response.data?.data.map(nail => ({
              ...nail,
              id: String(nail.id),
            })) ?? [];

          setNails(prev => [...prev, ...newData]);
          setCurrentPage(page);
          setHasMore(
            response.data.pageInfo.currentPage <
              response.data.pageInfo.totalPages,
          );
        }
      } catch (error) {
        console.error('네일 취향 목록 불러오기 실패:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, hasMore],
  );

  // 초기 데이터 로드
  useEffect(() => {
    loadNailPreferences(1);
  }, [loadNailPreferences]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isLoading || !hasMore) return;

      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      const paddingToBottom = 20;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;

      if (isCloseToBottom) {
        loadNailPreferences(currentPage + 1);
      }
    },
    [isLoading, hasMore, currentPage, loadNailPreferences],
  );

  // 네일 아이템 렌더링 함수
  const renderNailItem = useCallback(
    (props: { item: { id: string; imageUrl: string } }) => (
      <TouchableOpacity
        style={styles.nailItem}
        onPress={() => onSelectNail?.(props.item.id)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: props.item.imageUrl }}
          style={styles.nailImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    ),
    [onSelectNail],
  );

  // 아이템 구분선 컴포넌트
  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  // 로딩 푸터 컴포넌트
  const renderFooter = useCallback(() => {
    if (!isLoading) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={colors.purple500} />
      </View>
    );
  }, [isLoading]);

  return (
    <BottomSheetScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
      bounces={false}
      showsVerticalScrollIndicator={true}
      onScroll={handleScroll}
      overScrollMode="never"
      directionalLockEnabled={true}
      disableScrollViewPanResponder={false}
    >
      <FlatList
        data={nails}
        renderItem={renderNailItem}
        keyExtractor={(item, index) => `nail-${item.id}-${index}`}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.flatListContent}
        scrollEnabled={false}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={ItemSeparator}
        initialNumToRender={12}
        removeClippedSubviews={false}
      />
      {renderFooter()}
    </BottomSheetScrollView>
  );
}

const styles = StyleSheet.create({
  columnWrapper: {
    gap: 10,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
  },
  flatListContent: {
    paddingBottom: 20,
  },
  loaderContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingBottom: 20,
  },
  nailImage: {
    borderRadius: 4,
    height: '100%',
    width: '100%',
  },
  nailItem: {
    backgroundColor: colors.gray100,
    borderRadius: 4,
    height: 103,
    overflow: 'hidden',
    width: 103,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  separator: {
    height: 10,
  },
});

export default NailGrid;
