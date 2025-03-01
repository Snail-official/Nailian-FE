import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { TabBarHeader } from '~/shared/ui/TabBar';
import {
  fetchNailSetDetail,
  fetchSimilarNailSets,
} from '~/entities/nail-set/api';
import BookmarkIcon from '~/shared/assets/icons/ic_group.svg';
import Toast from '~/shared/ui/Toast';
import Button from '~/shared/ui/Button';
import { INailSet } from '../NailSetList';
import NailSet from '../NailSet';

/**
 * 네일 세트 상세 컴포넌트 Props
 */
interface NailSetDetailProps {
  /**
   * 위젯 표시 여부
   * true이면 모달이 표시됩니다.
   */
  visible: boolean;

  /**
   * 네일 세트 ID
   * 상세 정보를 조회하기 위한 ID입니다.
   */
  nailSetId: number;

  /**
   * 스타일 정보
   * 유사한 네일 세트를 필터링하는 데 사용됩니다.
   */
  style: {
    id: number;
    name: string;
  };

  /**
   * 닫기 버튼 클릭 핸들러
   * 사용자가 모달을 닫을 때 호출됩니다.
   */
  onClose: () => void;

  /**
   * 보관함 상태
   * 현재 네일 세트가 보관함에 저장되어 있는지 여부
   */
  isBookmarked?: boolean;

  /**
   * 보관함 클릭 핸들러
   * 보관함 버튼 클릭 시 호출됩니다.
   * @param nailSetId 보관할 네일 세트 ID
   */
  onBookmarkPress?: (nailSetId: number) => void;

  /**
   * 우측 상단 보관함 아이콘 표시 여부
   * 기본값은 true입니다.
   */
  showBookmarkIcon?: boolean;

  /**
   * 다른 네일 세트 선택 핸들러
   * 유사한 네일 세트 클릭 시 호출됩니다.
   * @param nailSetId 선택한 네일 세트 ID
   */
  onNailSetChange?: (nailSetId: number) => void;
}

// 유사한 네일 세트 목록에서 행 사이의 간격을 제공하는 구분선 컴포넌트
function RowSeparator() {
  return <View style={styles.rowSeparator} />;
}

/**
 * 네일 세트 상세 컴포넌트
 *
 * 네일 세트의 상세 정보와 유사한 네일 세트 목록을 보여주는 모달 컴포넌트입니다.
 * 보관함 기능과 유사 네일 세트 목록 표시 기능을 제공합니다.
 *
 * 주요 기능:
 * - 네일 세트 상세 이미지 표시
 * - 보관함 저장 버튼
 * - 유사한 네일 세트 목록 (2열 그리드 레이아웃)
 * - 무한 스크롤을 통한 추가 네일 세트 로딩
 * - 다른 네일 세트 선택 시 부모 컴포넌트에 알림
 *
 * @example
 * // 기본 사용법
 * <NailSetDetail
 *   visible={isModalVisible}
 *   nailSetId={123}
 *   style={{ id: 1, name: '심플' }}
 *   onClose={() => setIsModalVisible(false)}
 *   isBookmarked={false}
 *   onBookmarkPress={(id) => handleBookmark(id)}
 * />
 *
 * // 유사 네일 세트 선택 핸들러 포함
 * <NailSetDetail
 *   visible={isModalVisible}
 *   nailSetId={selectedNailSet.id}
 *   style={selectedStyle}
 *   onClose={handleClose}
 *   isBookmarked={bookmarkedNailSets.includes(selectedNailSet.id)}
 *   onBookmarkPress={handleBookmarkToggle}
 *   onNailSetChange={(newId) => handleNailSetChange(newId)}
 * />
 */
function NailSetDetail({
  visible,
  nailSetId,
  style,
  onClose,
  isBookmarked = false,
  onBookmarkPress,
  showBookmarkIcon = true,
  onNailSetChange,
}: NailSetDetailProps) {
  // 상태 관리
  const [nailSet, setNailSet] = useState<INailSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 토스트 상태 추가
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 유사한 네일 세트 목록 상태 추가
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

  // 유사한 네일 세트 목록 가져오기 함수
  const fetchSimilarNailSetList = useCallback(
    async (pageToFetch = 1, refresh = false) => {
      if (!style || !nailSetId) return;

      setSimilarLoading(true);
      setSimilarError(null);
      try {
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
    [style, nailSetId],
  );

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    if (visible && nailSetId) {
      fetchNailSetInfo();
      fetchSimilarNailSetList(1, true);
    }
  }, [visible, nailSetId, fetchNailSetInfo, fetchSimilarNailSetList]);

  // 더 불러오기 함수
  const handleLoadMore = useCallback(() => {
    if (!similarLoading && hasMore) {
      fetchSimilarNailSetList(page + 1);
    }
  }, [similarLoading, hasMore, fetchSimilarNailSetList, page]);

  // 유사한 네일 세트 클릭 핸들러
  const handleSimilarNailSetPress = useCallback(
    (item: INailSet) => {
      if (!item.id) return;

      console.log('유사한 네일 세트 클릭:', item.id);

      // 부모 컴포넌트에 네일 세트 변경 알림
      if (onNailSetChange) {
        onNailSetChange(item.id);
      }
    },
    [onNailSetChange],
  );

  // 토스트 메시지 표시 함수
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);

    // 3초 후 토스트 닫기
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  }, []);

  // 보관함 저장 함수
  const handleBookmark = useCallback(() => {
    if (onBookmarkPress) {
      onBookmarkPress(nailSetId);
      showToast('보관함에 저장되었습니다');
    }
  }, [nailSetId, onBookmarkPress, showToast]);

  // 타이틀 맨 오른쪽의 북마크 아이콘 렌더링
  const renderBookmarkIcon = useCallback(() => {
    // 북마크 아이콘이 비활성화되었거나 이미 보관함에 있는 경우 표시하지 않음
    if (!showBookmarkIcon || isBookmarked) return null;
    return (
      <TouchableOpacity
        style={styles.bookmarkIconButton}
        onPress={handleBookmark}
      >
        <BookmarkIcon width={24} height={24} color={colors.gray600} />
      </TouchableOpacity>
    );
  }, [showBookmarkIcon, isBookmarked, handleBookmark]);

  // 네일 세트 아이템 렌더링 함수를 useCallback으로 메모이제이션
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.headerContainer}>
          <TabBarHeader
            title={`${style?.name} 상세` || '네일 상세'}
            onBack={onClose}
            rightContent={renderBookmarkIcon()}
          />
        </View>

        {/* 로딩 인디케이터 */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.purple500} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {/* 네일 세트 상세 이미지 */}
            {nailSet && (
              <View style={styles.nailSetContainer}>
                <NailSet nailImages={nailSet} size="large" />
              </View>
            )}

            {/* 보관함 버튼 */}
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={handleBookmark}
              disabled={false}
            >
              <View style={styles.buttonContent}>
                <BookmarkIcon width={16} height={16} color={colors.white} />
                <Text style={styles.bookmarkButtonText}>보관함에 저장</Text>
              </View>
            </TouchableOpacity>

            {/* 유사한 네일 세트 섹션 */}
            <View style={styles.similarSectionContainer}>
              <Text style={styles.similarSectionTitle}>
                선택한 네일과 비슷한
              </Text>
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
                  contentContainerStyle={styles.nailSetList}
                  columnWrapperStyle={styles.columnWrapper}
                  ItemSeparatorComponent={RowSeparator}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={
                    similarLoading ? (
                      <View style={styles.footerLoading}>
                        <ActivityIndicator
                          size="small"
                          color={colors.purple500}
                        />
                      </View>
                    ) : null
                  }
                />
              )}
            </View>
          </View>
        )}

        {/* 토스트 메시지 */}
        <Toast
          message={toastMessage}
          visible={toastVisible}
          position="bottom"
        />
      </View>
    </Modal>
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
    color: colors.warn_red,
  },
  footerLoading: {
    alignItems: 'center',
    height: 108,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    position: 'relative',
    width: '100%',
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
  nailSetSeparator: {
    width: 8,
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

export default NailSetDetail;
