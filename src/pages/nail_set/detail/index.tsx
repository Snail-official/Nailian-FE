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
import { INailSet } from '~/shared/types/nail-set';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '~/shared/styles/design';
import { TabBarHeader } from '~/shared/ui/TabBar';
import {
  fetchNailSetDetail,
  fetchSimilarNailSets,
  createUserNailSet,
  fetchUserNailSets,
} from '~/entities/nail-set/api';
import BookmarkIcon from '~/shared/assets/icons/ic_group.svg';
import TrashIcon from '~/shared/assets/icons/ic_trash.svg';
import NailSet from '~/features/nail-set/ui/NailSet';
import ArButton from '~/features/nail-set-ar/ui/ArButton';
import Modal from '~/shared/ui/Modal';
import { toast } from '~/shared/lib/toast';

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
 *
 * 주요 기능:
 * - 선택한 네일 세트의 상세 이미지 표시
 * - 'AR 내 손에 올려보기' 기능
 * - 북마크 모드: 보관함에서 네일 삭제 기능
 * - 일반 모드: 보관함에 네일 저장 기능
 * - 유사한 네일 세트 또는 보관함의 다른 네일 세트 목록 표시
 * - 무한 스크롤을 통한 추가 네일 세트 로드
 *
 * @returns {JSX.Element} 네일 세트 상세 페이지 컴포넌트
 *
 * @example
 * // 기본 사용법 (네비게이션을 통해 접근)
 * navigation.navigate('NailSetDetailPage', {
 *   nailSetId: 1,
 *   styleId: 2,
 *   styleName: '프렌치',
 *   isBookmarked: false
 * });
 *
 * @example
 * // 북마크 모드로 접근 (보관함에서 접근)
 * navigation.navigate('NailSetDetailPage', {
 *   nailSetId: 1,
 *   styleId: 0,  // 0은 북마크 모드를 의미
 *   styleName: '네일 보관함',
 *   isBookmarked: true
 * });
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 유사한 네일 세트 목록 상태
  const [similarNailSets, setSimilarNailSets] = useState<INailSet[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 북마크 모드 여부 확인 (styleId가 0이면 북마크 모드)
  const isBookmarkMode = styleId === 0;

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

  // 유사한 네일 세트 또는 북마크된 다른 네일 세트 가져오기
  const fetchNailSets = useCallback(
    async (pageToFetch = 1, refresh = false) => {
      if (!nailSetId) return;

      setSimilarLoading(true);
      setSimilarError(null);
      try {
        let response;
        if (isBookmarkMode) {
          // 북마크 모드일 때는 사용자의 다른 북마크된 네일 세트를 가져옴
          response = await fetchUserNailSets({
            page: pageToFetch,
            size: 10,
          });
        } else {
          // 일반 모드일 때는 유사한 네일 세트를 가져옴
          const style = { id: styleId, name: styleName };
          response = await fetchSimilarNailSets({
            nailSetId,
            style,
            page: pageToFetch,
            size: 10,
          });
        }

        if (response.data) {
          let data, pageInfo;
          if (isBookmarkMode) {
            // 북마크 모드일 때 응답 처리
            data = response.data.data || [];
            pageInfo = response.data.pageInfo;
            // 현재 보고 있는 네일 세트는 제외
            data = data.filter((item: INailSet) => item.id !== nailSetId);
          } else {
            // 일반 모드일 때 응답 처리
            data = response.data.data || [];
            pageInfo = response.data.pageInfo;
          }

          // 새로고침이면 목록을 대체하고, 아니면 추가
          setSimilarNailSets(prev => (refresh ? data : [...prev, ...data]));

          // 다음 페이지가 있는지 확인
          setHasMore(pageInfo.currentPage < pageInfo.totalPages);
          setPage(pageToFetch);
        } else {
          setSimilarError(
            isBookmarkMode
              ? '보관함의 다른 네일 세트를 불러오는데 실패했습니다.'
              : '유사한 네일 세트를 불러오는데 실패했습니다.',
          );
        }
      } catch (err) {
        console.error(
          isBookmarkMode
            ? '보관함 네일 세트 불러오기 실패:'
            : '유사한 네일 세트 불러오기 실패:',
          err,
        );
        setSimilarError(
          isBookmarkMode
            ? '보관함의 다른 네일 세트를 불러오는데 실패했습니다.'
            : '유사한 네일 세트를 불러오는데 실패했습니다.',
        );
      } finally {
        setSimilarLoading(false);
      }
    },
    [styleId, nailSetId, styleName, isBookmarkMode],
  );

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchNailSetInfo();
    fetchNailSets(1, true);
  }, [fetchNailSetInfo, fetchNailSets]);

  // 더 불러오기 함수
  const handleLoadMore = useCallback(() => {
    if (!similarLoading && hasMore) {
      fetchNailSets(page + 1);
    }
  }, [similarLoading, hasMore, fetchNailSets, page]);

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
      navigation.replace('NailSetDetailPage', {
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
      // 북마크 API 호출
      if (nailSet) {
        // 네일 세트를 보관함에 저장
        /* TODO: 네일 세트 아이디 타입 수정 후 수정 필요 */
        await createUserNailSet({
          thumb: { id: nailSet.id as number },
          index: { id: nailSet.id as number },
          middle: { id: nailSet.id as number },
          ring: { id: nailSet.id as number },
          pinky: { id: nailSet.id as number },
        });
        // 성공적으로 저장되면 북마크 상태 업데이트 및 토스트 메시지 표시
        setIsBookmarked(true);
        toast.showToast('보관함에 저장되었습니다');
        console.log(
          '네일 세트가 보관함에 성공적으로 저장되었습니다:',
          nailSetId,
        );
      }
    } catch (err) {
      console.error('Failed to save to bookmark', err);
      // 이미 저장된 네일인 경우 (HTTP 409 Conflict) 다른 메시지 표시
      if (err instanceof Error && err.message.includes('500')) {
        toast.showToast('이미 저장된 네일입니다');
      } else {
        toast.showToast('보관함에 저장되었습니다');
      }
      // API 오류 발생해도 북마크 상태는 true로 설정 (아이콘 숨김 처리)
      setIsBookmarked(true);
    }
  }, [nailSet, nailSetId]);

  /**
   * 북마크 삭제 모달 표시 함수
   * 북마크 모드에서 휴지통 아이콘 클릭 시 삭제 확인 모달을 표시합니다.
   */
  const handleDeleteBookmarkPress = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  /**
   * 북마크 삭제 취소 함수
   * 북마크 삭제 모달에서 취소 버튼 클릭 시 모달을 닫습니다.
   */
  const handleDeleteCancel = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  /**
   * 북마크 삭제 처리 함수
   * 북마크 모드에서 휴지통 아이콘 클릭 시 네일 세트를 보관함에서 삭제합니다.
   */
  const handleDeleteBookmark = useCallback(async () => {
    try {
      if (!nailSetId) return;
      // 백엔드 API 구현 전까지는 콘솔 로그만 출력
      console.log('네일 세트 삭제:', nailSetId);
      toast.showToast('보관함에서 삭제되었습니다');
      // 모달 닫기
      setShowDeleteModal(false);
      // 목록 화면으로 이동
      navigation.goBack();
    } catch (err) {
      console.error('보관함에서 삭제 실패:', err);
      toast.showToast('삭제 중 오류가 발생했습니다');
      setShowDeleteModal(false);
    }
  }, [nailSetId, navigation]);

  /**
   * AR 기능 핸들러
   * AR 버튼 클릭 시 "내 손에 올려보기" 기능을 실행합니다.
   */
  const handleArButtonPress = useCallback(() => {
    console.log('AR 기능 실행: 내 손에 올려보기');
    // AR 기능 구현 전까지는 로그만 출력
  }, []);

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
        title={isBookmarkMode ? '아트 상세' : `${styleName} 상세`}
        onBack={() => navigation.goBack()}
        rightContent={
          isBookmarkMode ? (
            // 북마크 모드일 때는 휴지통 아이콘 표시
            <TouchableOpacity
              style={styles.bookmarkIconButton}
              onPress={handleDeleteBookmarkPress}
            >
              <TrashIcon width={24} height={24} color={colors.gray600} />
            </TouchableOpacity>
          ) : !isBookmarked ? (
            // 일반 모드이고 북마크되지 않았을 때만 북마크 아이콘 표시
            <TouchableOpacity
              style={styles.bookmarkIconButton}
              onPress={handleBookmarkToggle}
            >
              <BookmarkIcon width={19} height={18.5} color={colors.gray600} />
            </TouchableOpacity>
          ) : null
        }
      />

      <View style={styles.contentContainer}>
        {/* 네일 세트 상세 이미지 */}
        <View style={styles.nailSetContainer}>
          <NailSet nailImages={nailSet} size="large" />
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttonsContainer}>
          {/* AR 버튼 (북마크 모드일 때만만 표시) */}
          {isBookmarkMode && <ArButton onPress={handleArButtonPress} />}

          {/* 북마크 버튼 (북마크 모드가 아닐때만 표시) */}
          {!isBookmarkMode && (
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={handleBookmarkToggle}
            >
              <View style={styles.buttonContent}>
                <BookmarkIcon width={16} height={16} color={colors.white} />
                <Text style={styles.bookmarkButtonText}>보관함에 저장</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* 유사한 네일 세트 또는 보관함의 다른 네일 세트 섹션 */}
        <View style={styles.similarSectionContainer}>
          <Text style={styles.similarSectionTitle}>
            {isBookmarkMode
              ? '보관함에 있는 다른 아트'
              : '선택한 네일과 비슷한'}
          </Text>
          {similarLoading && similarNailSets.length === 0 ? (
            <View style={styles.similarLoadingContainer}>
              <ActivityIndicator size="small" color={colors.purple500} />
            </View>
          ) : similarError && similarNailSets.length === 0 ? (
            <View style={styles.similarErrorContainer}>
              <Text style={styles.errorText}>{similarError}</Text>
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

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <Modal
          title="해당 아트를 삭제하시겠어요?"
          description=" "
          confirmText="돌아가기"
          cancelText="삭제하기"
          onConfirm={handleDeleteCancel}
          onCancel={handleDeleteBookmark}
        />
      )}
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
  buttonsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 24,
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
  noDataText: {
    ...typography.body2_SB,
    color: colors.gray400,
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
