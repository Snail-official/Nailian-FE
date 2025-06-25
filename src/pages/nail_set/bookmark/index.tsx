import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useInfiniteQuery } from '@tanstack/react-query';
import { RootStackParamList } from '~/shared/types/navigation';
import { INailSet } from '~/shared/types/nail-set';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '~/shared/styles/design';
import { scale } from '~/shared/lib/responsive';
import { TabBarHeader } from '~/shared/ui/TabBar';
import { fetchUserNailSets } from '~/entities/nail-set/api';
import { NailSetGrid } from '~/features/nail-set-grid';
import EmptyView from '~/shared/ui/EmptyView';

const PAGE_SIZE = 10;

type BookmarkNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * 네일 보관함 페이지
 */
function BookmarkPage() {
  const navigation = useNavigation<BookmarkNavigationProp>();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['userNailSets'],
    queryFn: async ({ pageParam = 0 }) =>
      fetchUserNailSets({
        page: pageParam,
        size: PAGE_SIZE,
      }),
    getNextPageParam: lastPage => {
      const totalPages = lastPage.data?.pageInfo?.totalPages || 0;
      const currentPage = lastPage.data?.pageInfo?.currentPage || 0;
      return currentPage < totalPages - 1 ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // 모든 페이지의 데이터를 하나의 배열로 합치기
  const nailSets = data?.pages.flatMap(page => page.data?.content || []) || [];

  /**
   * 네일 세트 아이템 클릭 핸들러
   */
  const handleNailSetPress = (nailSet: INailSet) => {
    navigation.navigate('NailSetDetailPage', {
      nailSetId: nailSet.id,
      styleId: -1,
      styleName: '네일 보관함',
    });
  };

  /**
   * 로딩 중 화면 표시
   */
  if (isLoading && nailSets.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <TabBarHeader title="네일 보관함" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.purple500} />
        </View>
      </SafeAreaView>
    );
  }

  /**
   * 에러 화면 표시
   */
  if (isError && nailSets?.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <TabBarHeader title="네일 보관함" onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error instanceof Error
              ? error.message
              : '데이터를 불러오는데 실패했습니다.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * 보관함이 비어있을 때 EmptyView 표시
   */
  if (nailSets.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <TabBarHeader title="네일 보관함" onBack={() => navigation.goBack()} />
        <EmptyView
          message="저장된 아트가 없어요"
          buttonText="아트 둘러보기"
          navigateTo={{ screen: 'MainHome' }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <TabBarHeader title="네일 보관함" onBack={() => navigation.goBack()} />

      {/* 네일 세트 그리드 */}
      <NailSetGrid
        data={nailSets}
        onItemPress={handleNailSetPress}
        isFetchingNextPage={isFetchingNextPage}
        onEndReached={fetchNextPage}
        hasNextPage={hasNextPage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /** 전체 컨테이너 스타일 */
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  /** 에러 컨테이너 */
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: scale(20),
  },
  /** 에러 텍스트 */
  errorText: {
    color: colors.warn_red || 'red',
    textAlign: 'center',
  },
  /** 로딩 컨테이너 */
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default BookmarkPage;
