import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  FlatList,
} from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/shared/types/navigation';
import { INailSet } from '~/shared/types/nail-set';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import {
  fetchSimilarNailSets,
  fetchUserNailSets,
} from '~/entities/nail-set/api';
import NailSet from '~/features/nail-set/ui/NailSet';

interface SimilarNailSetsProps {
  nailSetId: number;
  styleId: number;
  styleName: string;
  isBookmarkMode: boolean;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

/**
 * 유사한 네일 세트 목록 컴포넌트
 */
export function SimilarNailSets({
  nailSetId,
  styleId,
  styleName,
  isBookmarkMode,
  navigation,
  onScroll,
}: SimilarNailSetsProps) {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  // 유사한 네일 세트 또는 북마크된 다른 네일 세트 조회
  const {
    data: similarData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: similarLoading,
    error: similarError,
  } = useInfiniteQuery({
    queryKey: ['similarNailSets', nailSetId, styleId, styleName],
    queryFn: async ({ pageParam = 0 }) => {
      if (isBookmarkMode) {
        return fetchUserNailSets({
          page: pageParam,
          size: 10,
        });
      }
      return fetchSimilarNailSets({
        nailSetId,
        style: { id: styleId, name: styleName },
        page: pageParam,
        size: 10,
      });
    },
    getNextPageParam: lastPage => {
      const totalPages = lastPage.data?.pageInfo?.totalPages || 0;
      const currentPage = lastPage.data?.pageInfo?.currentPage || 0;
      return currentPage < totalPages - 1 ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
  });

  // 유사한 네일 세트 목록 처리
  const similarNailSets =
    similarData?.pages.flatMap(page => {
      const data = page.data?.content || [];
      return isBookmarkMode
        ? data.filter((item: INailSet) => item.id !== nailSetId)
        : data;
    }) || [];

  const handleSimilarNailSetPress = useCallback(
    (item: INailSet) => {
      if (!item.id) return;
      navigation.replace('NailSetDetailPage', {
        nailSetId: item.id,
        styleId,
        styleName,
        isBookmarked: false,
      });
    },
    [navigation, styleId, styleName],
  );

  // 스크롤이 하단에 도달했을 때 다음 페이지 로드
  useEffect(() => {
    if (isScrolledToBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isScrolledToBottom, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const paddingToBottom = 20;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;

      if (isCloseToBottom) {
        setIsScrolledToBottom(true);
      } else {
        setIsScrolledToBottom(false);
      }

      // 부모 컴포넌트에 스크롤 이벤트 전달
      if (onScroll) {
        onScroll(event);
      }
    },
    [onScroll],
  );

  return (
    <View style={styles.similarSectionContainer}>
      <Text style={styles.similarSectionTitle}>
        {isBookmarkMode ? '보관함에 있는 다른 아트' : '선택한 네일과 비슷한'}
      </Text>
      {similarLoading && similarNailSets.length === 0 ? (
        <View style={styles.similarLoadingContainer}>
          <ActivityIndicator size="small" color={colors.purple500} />
        </View>
      ) : similarError && similarNailSets.length === 0 ? (
        <View style={styles.similarErrorContainer}>
          <Text style={styles.errorText}>
            {similarError instanceof Error
              ? similarError.message
              : '데이터를 불러오는데 실패했습니다.'}
          </Text>
        </View>
      ) : similarNailSets.length === 0 ? (
        <View style={styles.similarErrorContainer}>
          <Text style={styles.noDataText}>
            {isBookmarkMode
              ? '보관함에 다른 네일 세트가 없습니다.'
              : '유사한 네일 세트가 없습니다.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={similarNailSets}
          numColumns={2}
          keyExtractor={(item, index) => `similar-nail-set-${item.id}-${index}`}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.nailSetList}
          columnWrapperStyle={styles.nailSetGrid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.nailSetItem}
              onPress={() => handleSimilarNailSetPress(item)}
              activeOpacity={1}
            >
              <NailSet nailImages={item} />
            </TouchableOpacity>
          )}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color={colors.purple500} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    ...typography.body2_SB,
    color: colors.warn_red || 'red',
  },
  footerLoading: {
    alignItems: 'center',
    height: vs(108),
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  nailSetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  nailSetItem: {
    marginBottom: vs(12),
    width: '48%',
  },
  nailSetList: {
    paddingBottom: vs(20),
    paddingHorizontal: scale(20),
  },
  noDataText: {
    ...typography.body2_SB,
    color: colors.gray400,
  },
  similarErrorContainer: {
    alignItems: 'center',
    height: vs(108),
    justifyContent: 'center',
    marginTop: vs(12),
    width: '100%',
  },
  similarLoadingContainer: {
    alignItems: 'center',
    height: vs(108),
    justifyContent: 'center',
    marginTop: vs(12),
    width: '100%',
  },
  similarSectionContainer: {
    marginTop: vs(49),
    width: '100%',
  },
  similarSectionTitle: {
    ...typography.head2_B,
    color: colors.gray850,
    marginBottom: vs(12),
    marginLeft: scale(20),
  },
});
