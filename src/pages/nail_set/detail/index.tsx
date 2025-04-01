import React, { useState, useCallback } from 'react';
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
import { useQuery, useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { RootStackParamList } from '~/shared/types/navigation';
import { INailSet } from '~/shared/types/nail-set';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '~/shared/styles/design';
import { TabBarHeader } from '~/shared/ui/TabBar';
import {
  fetchNailSetDetail,
  fetchSimilarNailSets,
  fetchUserNailSets,
  saveUserNailSet,
  deleteUserNailSet,
} from '~/entities/nail-set/api';
import TrashIcon from '~/shared/assets/icons/ic_trash.svg';
import NailSet from '~/features/nail-set/ui/NailSet';
import ArButton from '~/features/nail-set-ar/ui/ArButton';
import Modal from '~/shared/ui/Modal';
import { toast } from '~/shared/lib/toast';
import { scale, vs } from '~/shared/lib/responsive';
import { APIError } from '~/shared/api/types';
import { useErrorStore } from '~/features/error/model/errorStore';

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
  const errorStore = useErrorStore();
  const { nailSetId, styleId, styleName } = route.params;

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 북마크 모드 여부 확인
  const isBookmarkMode = styleName === '네일 보관함';

  // 네일 세트 상세 정보 조회
  const {
    data: nailSet,
    isLoading: loading,
    error: detailError,
  } = useQuery({
    queryKey: ['nailSet', nailSetId],
    queryFn: () => fetchNailSetDetail({ nailSetId }),
  });

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

  // 북마크 저장 뮤테이션
  const { mutate: saveBookmark, isPending: saveLoading } = useMutation({
    mutationFn: saveUserNailSet,
    onSuccess: () => {
      toast.showToast('보관함에 저장되었습니다');
    },
    onError: (error: unknown) => {
      if (error instanceof APIError && error.code === 409) {
        toast.showToast('이미 저장된 네일입니다');
      } else {
        errorStore.showError('보관함 저장에 실패했습니다');
      }
    },
  });

  // 북마크 삭제 뮤테이션
  const { mutate: deleteBookmark, isPending: deleteLoading } = useMutation({
    mutationFn: deleteUserNailSet,
    onSuccess: () => {
      toast.showToast('보관함에서 삭제되었습니다');
      setShowDeleteModal(false);
      navigation.goBack();
    },
    onError: () => {
      errorStore.showError('보관함에서 삭제 중 오류가 발생했습니다');
      setShowDeleteModal(false);
    },
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

  const handleBookmarkToggle = useCallback(() => {
    if (!nailSetId) return;
    saveBookmark({ nailSetId });
  }, [nailSetId, saveBookmark]);

  const handleDeleteBookmarkPress = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  const handleDeleteBookmark = useCallback(() => {
    if (!nailSetId) return;
    deleteBookmark({ nailSetId });
  }, [nailSetId, deleteBookmark]);

  const handleArButtonPress = useCallback(() => {
    navigation.navigate('ARExperiencePage');
  }, [navigation]);

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
  if (detailError || !nailSet?.data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {detailError instanceof Error
            ? detailError.message
            : '데이터를 불러오는데 실패했습니다.'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TabBarHeader
        title={isBookmarkMode ? '아트 상세' : `${styleName} 상세`}
        onBack={() => navigation.goBack()}
        rightContent={
          isBookmarkMode ? (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteBookmarkPress}
            >
              <TrashIcon
                width={scale(24)}
                height={scale(24)}
                color={colors.gray600}
              />
            </TouchableOpacity>
          ) : null
        }
      />

      <View style={styles.contentContainer}>
        <View style={styles.nailSetContainer}>
          <NailSet nailImages={nailSet.data} size="large" />
        </View>

        <View style={styles.buttonsContainer}>
          {isBookmarkMode && <ArButton onPress={handleArButtonPress} />}

          {!isBookmarkMode && (
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={handleBookmarkToggle}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.bookmarkButtonText}>보관함에 저장</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

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
              numColumns={2}
              data={similarNailSets}
              renderItem={renderNailSetItem}
              keyExtractor={item => `similar-nail-set-${item.id}`}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={false}
              contentContainerStyle={styles.nailSetList}
              columnWrapperStyle={styles.columnWrapper}
              ItemSeparatorComponent={RowSeparator}
              onEndReached={() => hasNextPage && fetchNextPage()}
              onEndReachedThreshold={0.5}
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
      </View>

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
    borderRadius: scale(4),
    height: scale(45),
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    width: scale(144),
  },
  bookmarkButtonText: {
    ...typography.body2_SB,
    color: colors.white,
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
    gap: scale(12),
    justifyContent: 'center',
    marginBottom: vs(24),
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
    paddingTop: vs(12),
  },
  deleteButton: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
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
    height: vs(108),
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  nailSetContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(24),
    width: '100%',
  },
  nailSetItem: {
    marginBottom: vs(12),
    width: '48%', // 약간의 간격을 두기 위해 48%로 설정
  },
  nailSetList: {
    paddingBottom: vs(20),
    paddingHorizontal: scale(20),
  },
  noDataText: {
    ...typography.body2_SB,
    color: colors.gray400,
  },
  rowSeparator: {
    height: vs(12),
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
    marginTop: vs(55),
    width: '100%',
  },
  similarSectionTitle: {
    ...typography.head2_B,
    color: colors.gray850,
    marginBottom: vs(12),
    marginLeft: scale(20),
  },
});

export default NailSetDetailPage;
