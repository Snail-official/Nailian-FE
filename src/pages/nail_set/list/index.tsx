import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import {
  RouteProp,
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { RootStackParamList } from '~/shared/types/navigation';
import { INailSet } from '~/shared/types/nail-set';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import { TabBarHeader } from '~/shared/ui/TabBar';
import { fetchNailSetFeed, fetchUserNailSets } from '~/entities/nail-set/api';
import NailSet from '~/features/nail-set/ui/NailSet';
import EmptyView from '~/shared/ui/EmptyView';

/**
 * 네일 세트 UI 레이아웃 상수
 */
/** 네일 세트 컴포넌트의 고정 너비 (px) */
const NAIL_SET_WIDTH = scale(160);
/** 네일 세트 사이의 수평 간격 (px) */
const HORIZONTAL_SPACING = scale(12);
/** 두 네일 세트의 총 너비 (두 컴포넌트 + 간격) */
const TOTAL_NAIL_SETS_WIDTH = NAIL_SET_WIDTH * 2 + HORIZONTAL_SPACING;
const PAGE_SIZE = 10;

type NailSetListScreenRouteProp = RouteProp<
  RootStackParamList,
  'NailSetListPage'
>;
type NailSetListScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

/**
 * 네일 세트 목록 페이지
 * 스타일별 또는 북마크된 네일 세트를 보여줍니다.
 *
 * 주요 기능:
 * - 특정 스타일의 네일 세트 목록 표시
 * - 북마크된 네일 세트 목록 표시 (마이페이지에서 접근 시)
 * - 페이지네이션을 통한 추가 데이터 로드
 * - 네일 세트 상세 페이지로 연결
 *
 * @returns {JSX.Element} 네일 세트 목록 페이지 컴포넌트
 */
function NailSetListPage() {
  const navigation = useNavigation<NailSetListScreenNavigationProp>();
  const route = useRoute<NailSetListScreenRouteProp>();
  const { styleId, styleName } = route.params;
  const isBookmarkMode = styleName === '네일 보관함';

  // 무한 스크롤을 위한 쿼리
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['nailSets', styleId, styleName],
    queryFn: async ({ pageParam = 0 }) => {
      if (isBookmarkMode) {
        return fetchUserNailSets({
          page: pageParam,
          size: PAGE_SIZE,
        });
      }
      return fetchNailSetFeed({
        style: { id: styleId, name: styleName },
        page: pageParam,
        size: PAGE_SIZE,
      });
    },
    getNextPageParam: lastPage => {
      const totalPages = lastPage.data?.pageInfo?.totalPages || 0;
      const currentPage = lastPage.data?.pageInfo?.currentPage || 0;
      return currentPage < totalPages - 1 ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
  });

  // 모든 페이지의 데이터를 하나의 배열로 합치기
  const nailSets = data?.pages.flatMap(page => page.data?.content || []) || [];

  // 화면에 포커스가 올 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  /**
   * 네일 세트 아이템 클릭 핸들러
   *
   * 네일 세트 클릭 시 해당 네일 세트의 상세 페이지로 이동합니다.
   *
   * @param {INailSet} nailSet 선택된 네일 세트 데이터
   */
  const handleNailSetPress = (nailSet: INailSet) => {
    navigation.navigate('NailSetDetailPage', {
      nailSetId: nailSet.id,
      styleId,
      styleName,
    });
  };

  /**
   * 로딩 표시기 렌더링
   *
   * 추가 데이터 로드 중일 때 하단에 로딩 표시기를 렌더링합니다.
   *
   * @returns {JSX.Element | null} 로딩 표시기 또는 null
   */
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={colors.purple500} />
      </View>
    );
  };

  /**
   * 네일 세트 렌더링 함수
   *
   * FlatList에서 각 네일 세트 아이템을 렌더링하는 함수입니다.
   *
   * @param {Object} props 아이템 렌더링 props
   * @param {INailSet} props.item 렌더링할 네일 세트 데이터
   * @returns {JSX.Element} 네일 세트 컴포넌트
   */
  const renderNailSet = ({ item }: { item: INailSet }) => (
    <TouchableOpacity
      style={styles.nailSetItem}
      onPress={() => handleNailSetPress(item)}
      activeOpacity={0.8}
    >
      <NailSet nailImages={item} />
    </TouchableOpacity>
  );

  /**
   * 로딩 중 화면 표시
   */
  if (isLoading && nailSets.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <TabBarHeader title={styleName} onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.purple500} />
        </View>
      </SafeAreaView>
    );
  }

  /**
   * 에러 화면 표시
   */
  if (isError && nailSets.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <TabBarHeader title={styleName} onBack={() => navigation.goBack()} />
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
   * 보관함이 비어있을 때 엠티 뷰 표시 (북마크 모드인 경우만)
   */
  if (isBookmarkMode && nailSets.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <TabBarHeader title={styleName} onBack={() => navigation.goBack()} />
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
      <TabBarHeader title={styleName} onBack={() => navigation.goBack()} />

      {/* 중앙 정렬을 위한 감싸는 컨테이너 */}
      <View style={styles.centerContainer}>
        {/* 네일 세트 그리드 */}
        <FlatList
          data={nailSets}
          renderItem={renderNailSet}
          keyExtractor={item => `nail-set-${item.id}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          contentContainerStyle={styles.listContent}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
        />
      </View>
    </SafeAreaView>
  );
}

/**
 * 컴포넌트 스타일 정의
 */
const styles = StyleSheet.create({
  /** 중앙 정렬 컨테이너 */
  centerContainer: {
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
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
  /** 리스트 콘텐츠 스타일 */
  listContent: {
    paddingVertical: vs(12),
  },
  /** 로딩 인디케이터 컨테이너 스타일 */
  loaderContainer: {
    alignItems: 'center',
    marginVertical: vs(16),
  },
  /** 로딩 컨테이너 */
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  /** 개별 네일 세트 아이템 스타일 */
  nailSetItem: {
    marginBottom: vs(11), // 수직 간격 11px
    width: NAIL_SET_WIDTH,
  },
  /** 네일 세트 행 스타일 - 간격 설정 */
  row: {
    gap: HORIZONTAL_SPACING, // 수평 간격 12px
    width: TOTAL_NAIL_SETS_WIDTH,
  },
});

export default NailSetListPage;
