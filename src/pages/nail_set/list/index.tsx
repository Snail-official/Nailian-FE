import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/shared/types/navigation';
import { INailSet } from '~/shared/types/nail-set';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import { TabBarHeader } from '~/shared/ui/TabBar';
import { fetchNailSetFeed, fetchUserNailSets } from '~/entities/nail-set/api';
import NailSet from '~/features/nail-set/ui/NailSet';

/**
 * 네일 세트 UI 레이아웃 상수
 */
/** 네일 세트 컴포넌트의 고정 너비 (px) */
const NAIL_SET_WIDTH = scale(160);
/** 네일 세트 사이의 수평 간격 (px) */
const HORIZONTAL_SPACING = scale(12);
/** 두 네일 세트의 총 너비 (두 컴포넌트 + 간격) */
const TOTAL_NAIL_SETS_WIDTH = NAIL_SET_WIDTH * 2 + HORIZONTAL_SPACING;

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
  const isBookmarkMode = styleId === 0;

  // 상태 관리
  const [nailSets, setNailSets] = useState<INailSet[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedNailIds, setBookmarkedNailIds] = useState<number[]>([]);
  const pageSize = 10;

  /**
   * 네일 세트 데이터 가져오기
   *
   * @param {number} page 가져올 페이지 번호
   * @param {boolean} reset 기존 데이터 초기화 여부
   * @returns {Promise<void>}
   */
  const fetchNailSets = useCallback(
    async (page: number, reset: boolean = false) => {
      // 이미 로딩 중이거나 더 불러올 데이터가 없으면 중단
      if (isLoading || (!hasMoreData && !reset)) return;

      setIsLoading(true);
      setError(null);

      try {
        let response;

        if (isBookmarkMode) {
          // 북마크 모드일 때 북마크된 네일 세트 목록 가져오기
          response = await fetchUserNailSets({
            page,
            size: pageSize,
          });
        } else {
          // 스타일별 네일 세트 조회
          response = await fetchNailSetFeed({
            style: { id: styleId, name: styleName },
            page,
            size: pageSize,
          });
        }

        if (response.data) {
          // 페이지네이션 응답에서 데이터 배열 추출
          const newNailSets = response.data.content || [];

          // 데이터 설정 (초기화 또는 추가)
          if (reset) {
            setNailSets(newNailSets);
          } else {
            setNailSets(prev => [...prev, ...newNailSets]);
          }

          // 북마크 페이지일 경우 모든 아이템이 북마크된 상태
          if (isBookmarkMode) {
            setBookmarkedNailIds(newNailSets.map((item: INailSet) => item.id));
          }

          // 더 불러올 데이터가 있는지 확인
          setHasMoreData(newNailSets.length === pageSize);
        }
      } catch (err) {
        console.error('네일 세트 피드 불러오기 실패:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, hasMoreData, styleId, styleName, pageSize, isBookmarkMode],
  );

  /**
   * 북마크 상태 가져오기 (일반 스타일 모드일 때만)
   *
   * 현재 사용자가 북마크한 네일 세트의 ID 목록을 가져와
   * 각 네일 세트의 북마크 상태를 표시하기 위한 함수입니다.
   *
   * @returns {Promise<void>}
   */
  const fetchBookmarkStatus = useCallback(async () => {
    // 북마크 모드에서는 호출하지 않음
    if (styleId === 0) return;

    try {
      const response = await fetchUserNailSets({ page: 1, size: 100 });
      if (response.data?.content) {
        setBookmarkedNailIds(response.data.content.map(item => item.id));
      }
    } catch (err) {
      console.error('북마크 상태 불러오기 실패:', err);
    }
  }, [styleId]);

  /**
   * 컴포넌트 마운트 시 데이터 로드
   *
   * 컴포넌트가 마운트되면 첫 페이지 데이터를 가져오고
   * 북마크 상태도 함께 로드합니다.
   */
  useEffect(() => {
    setCurrentPage(1);
    setHasMoreData(true);
    fetchNailSets(1, true);
    fetchBookmarkStatus();
  }, [fetchNailSets, fetchBookmarkStatus]);

  /**
   * 스크롤 끝에 도달했을 때 추가 데이터 로드
   *
   * 무한 스크롤 기능을 위해 사용자가 목록의 끝에 도달하면
   * 다음 페이지의 데이터를 자동으로 로드합니다.
   */
  const handleLoadMore = () => {
    if (!isLoading && hasMoreData) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchNailSets(nextPage);
    }
  };

  /**
   * 네일 세트 아이템 클릭 핸들러
   *
   * 네일 세트 클릭 시 해당 네일 세트의 상세 페이지로 이동합니다.
   * 북마크 상태 정보도 함께 전달합니다.
   *
   * @param {INailSet} nailSet 선택된 네일 세트 데이터
   */
  const handleNailSetPress = (nailSet: INailSet) => {
    navigation.navigate('NailSetDetailPage', {
      nailSetId: nailSet.id,
      styleId,
      styleName,
      isBookmarked: bookmarkedNailIds.includes(nailSet.id),
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
    if (!isLoading) return null;
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.purple500} />
      </View>
    );
  }

  /**
   * 에러 화면 표시
   */
  if (error && nailSets.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
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
          onEndReached={handleLoadMore}
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
