import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/shared/types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '~/shared/styles/design';
import { TabBarHeader } from '~/shared/ui/TabBar';
import {
  fetchNailSetDetail,
  fetchSimilarNailSets,
  createUserNailSet,
} from '~/entities/nail-set/api';
import BookmarkIcon from '~/shared/assets/icons/ic_group.svg';
import { useToast } from '~/shared/ui/Toast';
import NailSet from '~/features/nail-set/ui/NailSet';

/**
 * 네일 세트 데이터 인터페이스
 */
interface INailSet {
  id: number;
  thumb: { imageUrl: string };
  index: { imageUrl: string };
  middle: { imageUrl: string };
  ring: { imageUrl: string };
  pinky: { imageUrl: string };
}

type NailSetDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'NailSetDetailPage'
>;
type NailSetDetailScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

/**
 * 행 구분선 컴포넌트
 *
 * 유사한 네일 세트 목록에서 각 행 사이의 간격을 제공하는 구분선 컴포넌트입니다.
 *
 * @returns {JSX.Element} 구분선 뷰 컴포넌트
 */
function RowSeparator() {
  return <View style={styles.rowSeparator} />;
}

/**
 * 네일 세트 상세 페이지
 * 네일 세트의 상세 정보와 유사한 네일 세트 목록을 보여줍니다.
 */
function NailSetDetailPage() {
  const navigation = useNavigation<NailSetDetailScreenNavigationProp>();
  const route = useRoute<NailSetDetailScreenRouteProp>();
  const {
    nailSetId,
    styleId,
    styleName,
    isBookmarked: initialBookmarkState = false,
  } = route.params;

  // 상태 관리
  const [nailSet, setNailSet] = useState<INailSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarkState);

  // 하단 토스트 사용
  const { showToast, ToastComponent } = useToast('bottom');

  // 유사한 네일 세트 목록 상태
  const [similarNailSets, setSimilarNailSets] = useState<INailSet[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 네일 세트 상세 정보 가져오기
  const fetchNailSetInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchNailSetDetail({ nailSetId });
      if (response.data) {
        setNailSet(response.data);
      } else {
        setError('네일 세트 정보를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('네일 세트 상세 정보 불러오기 실패:', err);
      setError('네일 세트 정보를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [nailSetId]);

  // 유사한 네일 세트 목록 가져오기
  const fetchSimilarNailSetList = useCallback(
    async (pageToFetch = 1, refresh = false) => {
      if (!styleId || !nailSetId) return;

      setSimilarLoading(true);
      setSimilarError(null);
      try {
        const style = { id: styleId, name: styleName };
        const response = await fetchSimilarNailSets({
          nailSetId,
          style,
          page: pageToFetch,
          size: 10,
        });

        if (response.data) {
          const { data, pageInfo } = response.data;

          // 새로고침이면 목록을 대체하고, 아니면 추가
          setSimilarNailSets(prev => (refresh ? data : [...prev, ...data]));

          // 다음 페이지가 있는지 확인
          setHasMore(pageInfo.currentPage < pageInfo.totalPages);
          setPage(pageToFetch);
        } else {
          setSimilarError('유사한 네일 세트를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('유사한 네일 세트 불러오기 실패:', err);
        setSimilarError('유사한 네일 세트를 불러오는데 실패했습니다.');
      } finally {
        setSimilarLoading(false);
      }
    },
    [styleId, nailSetId, styleName],
  );

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchNailSetInfo();
    fetchSimilarNailSetList(1, true);
  }, [fetchNailSetInfo, fetchSimilarNailSetList]);

  // 더 불러오기 함수
  const handleLoadMore = useCallback(() => {
    if (!similarLoading && hasMore) {
      fetchSimilarNailSetList(page + 1);
    }
  }, [similarLoading, hasMore, fetchSimilarNailSetList, page]);

  /**
   * 네일 세트 아이템 클릭 핸들러
   *
   * 유사한 네일 세트 목록에서 특정 네일 세트를 선택했을 때
   * 해당 네일 세트의 상세 페이지로 이동하는 함수입니다.
   *
   * @param {INailSet} item 선택된 네일 세트 데이터
   */
  const handleSimilarNailSetPress = useCallback(
    (item: INailSet) => {
      if (!item.id) return;

      // 새 네일 세트로 페이지 이동
      navigation.push('NailSetDetailPage', {
        nailSetId: item.id,
        styleId,
        styleName,
        isBookmarked: false, // 북마크 상태는 백엔드에서 다시 확인 필요
      });
    },
    [navigation, styleId, styleName],
  );

  /**
   * 보관함 저장 핸들러
   *
   * 북마크 버튼을 눌렀을 때 현재 네일 세트를 보관함에 저장하고
   * 토스트 메시지를 표시하는 함수입니다.
   */
  const handleBookmarkToggle = useCallback(async () => {
    try {
      // 성공/실패와 상관없이 북마크 상태를 true로 설정 (아이콘 숨김 처리)
      setIsBookmarked(true);
      showToast('보관함에 저장되었습니다');
      // 북마크 API 호출
      if (nailSet) {
        // 네일 세트를 보관함에 저장
        await createUserNailSet({
          thumb: { id: nailSet.id },
          index: { id: nailSet.id },
          middle: { id: nailSet.id },
          ring: { id: nailSet.id },
          pinky: { id: nailSet.id },
        });
        console.log(
          '네일 세트가 보관함에 성공적으로 저장되었습니다:',
          nailSetId,
        );
      }
    } catch (err) {
      console.error('Failed to save to bookmark', err);
      // API 오류 발생해도 북마크 상태는 true로 설정 (아이콘 숨김 처리)
      setIsBookmarked(true);
      showToast('보관함에 저장되었습니다');
    }
  }, [showToast, nailSet, nailSetId]);

  /**
   * 네일 세트 아이템 렌더링 함수
   *
   * FlatList에서 각 네일 세트 아이템을 렌더링하는 컴포넌트입니다.
   *
   * @param {Object} props 아이템 렌더링 props
   * @param {INailSet} props.item 렌더링할 네일 세트 데이터
   * @returns {JSX.Element} 렌더링된 네일 세트 컴포넌트
   */
  const renderNailSetItem = useCallback(
    (props: { item: INailSet }) => (
      <TouchableOpacity
        style={styles.nailSetItem}
        onPress={() => handleSimilarNailSetPress(props.item)}
      >
        <NailSet nailImages={props.item} />
      </TouchableOpacity>
    ),
    [handleSimilarNailSetPress],
  );

  // 로딩 중 화면
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.purple500} />
      </View>
    );
  }

  // 에러 화면
  if (error || !nailSet) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || '데이터를 불러오는데 실패했습니다.'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <TabBarHeader
        title={`${styleName} 상세`}
        onBack={() => navigation.goBack()}
        rightContent={
          !isBookmarked && (
            <TouchableOpacity
              style={styles.bookmarkIconButton}
              onPress={handleBookmarkToggle}
            >
              <BookmarkIcon width={19} height={18.5} color={colors.gray600} />
            </TouchableOpacity>
          )
        }
      />

      <View style={styles.contentContainer}>
        {/* 네일 세트 상세 이미지 */}
        <View style={styles.nailSetContainer}>
          <NailSet nailImages={nailSet} size="large" />
        </View>

        {/* 북마크 버튼 */}
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={handleBookmarkToggle}
          disabled={isBookmarked}
        >
          <View style={styles.buttonContent}>
            <BookmarkIcon width={16} height={16} color={colors.white} />
            <Text style={styles.bookmarkButtonText}>보관함에 저장</Text>
          </View>
        </TouchableOpacity>

        {/* 유사한 네일 세트 섹션 */}
        <View style={styles.similarSectionContainer}>
          <Text style={styles.similarSectionTitle}>선택한 네일과 비슷한</Text>
          {similarLoading && similarNailSets.length === 0 ? (
            <View style={styles.similarLoadingContainer}>
              <ActivityIndicator size="small" color={colors.purple500} />
            </View>
          ) : similarError && similarNailSets.length === 0 ? (
            <View style={styles.similarErrorContainer}>
              <Text style={styles.errorText}>{similarError}</Text>
            </View>
          ) : (
            <FlatList
              numColumns={2}
              data={similarNailSets}
              renderItem={renderNailSetItem}
              keyExtractor={item => `similar-nail-set-${item.id}`}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={false}
              contentContainerStyle={styles.nailSetList}
              columnWrapperStyle={styles.columnWrapper}
              ItemSeparatorComponent={RowSeparator}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                similarLoading ? (
                  <View style={styles.footerLoading}>
                    <ActivityIndicator size="small" color={colors.purple500} />
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </View>

      {/* Toast 컴포넌트 교체 */}
      <ToastComponent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bookmarkButton: {
    backgroundColor: colors.gray900,
    borderRadius: 4,
    height: 45,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 144,
  },
  bookmarkButtonText: {
    ...typography.body2_SB,
    color: colors.white,
    marginLeft: 6,
  },
  bookmarkIconButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    width: '100%',
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    flex: 1,
    paddingTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    ...typography.body2_SB,
    color: colors.warn_red || 'red',
  },
  footerLoading: {
    alignItems: 'center',
    height: 108,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  nailSetContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    width: '100%',
  },
  nailSetItem: {
    marginBottom: 12,
    width: '48%', // 약간의 간격을 두기 위해 48%로 설정
  },
  nailSetList: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  rowSeparator: {
    height: 12,
  },
  similarErrorContainer: {
    alignItems: 'center',
    height: 108,
    justifyContent: 'center',
    marginTop: 12,
    width: '100%',
  },
  similarLoadingContainer: {
    alignItems: 'center',
    height: 108,
    justifyContent: 'center',
    marginTop: 12,
    width: '100%',
  },
  similarSectionContainer: {
    marginTop: 55,
    width: '100%',
  },
  similarSectionTitle: {
    ...typography.head2_B,
    color: colors.gray850,
    marginBottom: 12,
    marginLeft: 20,
  },
});

export default NailSetDetailPage;
