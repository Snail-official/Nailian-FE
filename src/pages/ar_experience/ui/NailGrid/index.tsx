import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { colors } from '~/shared/styles/design';
import { NailListResponse, Shape } from '~/shared/api/types';
import { fetchNails } from '~/entities/nail-tip/api';
import { useLoadMore } from '~/shared/api/hooks';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { scale, vs } from '~/shared/lib/responsive';
import { NailSet, FingerType } from '~/pages/ar_experience';
import { FilterValues } from '../FilterModal';

interface NailGridProps {
  /**
   * 현재 네일 세트가 변경될 때 호출되는 콜백 함수
   */
  onNailSetChange?: (nailSet: Partial<NailSet>) => void;
  /**
   * 활성화된 필터 값
   */
  activeFilters?: FilterValues;
  /**
   * 현재 선택된 네일 버튼 인덱스
   */
  selectedNailButton?: number | null;
  /**
   * 이미지 선택 모드 여부
   */
  isSelectingImage?: boolean;
  /**
   * 손가락 타입과 인덱스 매핑
   */
  fingerMap: Array<{ index: number; type: string }>;
}

/**
 * 네일 그리드 컴포넌트
 *
 * AR 체험 화면에서 사용자가 선택할 수 있는 네일 디자인 이미지를 그리드 형태로 표시합니다.
 * 선택된 손가락에 적용할 네일 디자인을 선택할 수 있으며, 무한 스크롤과 필터링 기능을 제공합니다.
 *
 * 주요 기능:
 * - 네일 디자인 이미지를 그리드 형태로 표시
 * - 무한 스크롤을 통한 추가 네일 데이터 로딩
 * - 필터 조건에 따른 네일 디자인 필터링
 * - 네일 선택 시 상위 컴포넌트에 선택 정보 전달
 * - 로딩 상태 및 에러 상태 처리
 *
 * @param {NailGridProps} props - 네일 그리드 컴포넌트 속성
 * @returns {JSX.Element} 네일 그리드 컴포넌트
 */
export function NailGrid({
  onNailSetChange,
  activeFilters = {},
  selectedNailButton = null,
  isSelectingImage = false,
  fingerMap,
}: NailGridProps) {
  // 기본 데이터 상태
  const [nails, setNails] = useState<
    { id: number; imageUrl: string; shape?: Shape }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollViewRef =
    useRef<React.ComponentRef<typeof BottomSheetScrollView>>(null);

  // 인덱스로 손가락 타입 찾기
  const getFingerTypeByIndex = useCallback(
    (index: number): FingerType =>
      (fingerMap.find(item => item.index === index)?.type as FingerType) ||
      'pinky',
    [fingerMap],
  );

  // 네일 이미지 로드 함수 (필터 적용 지원)
  const loadNailImages = useCallback(
    async (page = 1, filters: FilterValues = activeFilters) => {
      // 이미 로딩 중이거나 더 이상 데이터가 없으면 중단
      if (isLoading) return;
      if (page > 1 && !hasMore) return;

      try {
        setIsLoading(true);
        const response: NailListResponse = await fetchNails({
          page,
          size: 24,
          category: filters.category,
          color: filters.color,
          shape: filters.shape,
        });

        if (response.data) {
          const newData =
            response.data?.content.map(nail => ({
              ...nail,
              id: nail.id, // 이미 숫자형이므로 변환 불필요
            })) ?? [];

          setNails(prev => (page === 1 ? newData : [...prev, ...newData]));
          setHasMore(
            response.data.pageInfo.currentPage <
              response.data.pageInfo.totalPages,
          );
        }
      } catch (error) {
        console.error('네일 목록 불러오기 실패:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, hasMore, activeFilters], // 실제 필요한 의존성 명시
  );

  // useLoadMore 훅을 사용하여 무한 스크롤 처리
  const { handleLoadMore, resetPage } = useLoadMore({
    onLoad: page => loadNailImages(page, activeFilters),
    hasMore,
    isLoading,
  });

  // 데이터 로드 트리거 - 초기 로드와 필터 변경 시
  useEffect(() => {
    // 페이지 초기화 및 데이터 로드
    setNails([]);
    setHasMore(true);
    resetPage();

    // 0ms 지연을 통해 상태 업데이트 완료 후 실행
    const timer = setTimeout(() => {
      loadNailImages(1, activeFilters);
    }, 0);

    return () => clearTimeout(timer);
  }, [activeFilters, loadNailImages, resetPage]);

  // 이미지를 네일 세트에 추가하는 함수
  const addImageToNailSet = useCallback(
    (
      index: number,
      nailItem: { id: number; imageUrl: string; shape?: Shape },
    ) => {
      const fingerType = getFingerTypeByIndex(index);

      // 네일 세트 업데이트 - 부모 컴포넌트의 콜백 직접 호출
      const updatedSet: Partial<NailSet> = {
        [fingerType]: {
          id: nailItem.id,
          imageUrl: nailItem.imageUrl,
          shape: nailItem.shape,
        },
      };

      // 바로 부모 컴포넌트에 업데이트된 상태 전달
      onNailSetChange?.(updatedSet);
    },
    [getFingerTypeByIndex, onNailSetChange],
  );

  // 그리드 네일 아이템 클릭 핸들러
  const handleNailItemClick = useCallback(
    (item: { id: number; imageUrl: string; shape?: Shape }) => {
      // 이미지 선택 모드일 때: 버튼에 이미지 추가
      if (isSelectingImage && selectedNailButton !== null) {
        addImageToNailSet(selectedNailButton, item);
      }
    },
    [isSelectingImage, selectedNailButton, addImageToNailSet],
  );

  // 네일 아이템 렌더링 함수
  const renderNailItem = useCallback(
    (props: { item: { id: number; imageUrl: string; shape?: Shape } }) => (
      <TouchableOpacity
        style={styles.nailItem}
        onPress={() => handleNailItemClick(props.item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: props.item.imageUrl }}
          style={styles.nailImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    ),
    [handleNailItemClick],
  );

  // 리스트 Footer 렌더링 (로딩 표시)
  const renderFooter = useCallback(() => {
    if (!isLoading) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.purple500} />
      </View>
    );
  }, [isLoading]);

  // 아이템 구분선 컴포넌트
  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  return (
    <BottomSheetScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
      bounces={false}
      showsVerticalScrollIndicator={true}
      onScroll={handleLoadMore}
      overScrollMode="never"
      directionalLockEnabled={true}
      disableScrollViewPanResponder={false}
    >
      {/* 네일 그리드 */}
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
    </BottomSheetScrollView>
  );
}

const styles = StyleSheet.create({
  columnWrapper: {
    gap: scale(10),
    justifyContent: 'flex-start',
    paddingHorizontal: scale(22),
  },
  container: {
    flex: 1,
    width: '100%',
  },
  flatListContent: {
    alignItems: 'flex-start',
    paddingBottom: vs(20),
  },
  loaderContainer: {
    alignItems: 'center',
    marginVertical: vs(20),
    paddingBottom: vs(20),
  },
  nailImage: {
    borderRadius: scale(4),
    height: '100%',
    width: '100%',
  },
  nailItem: {
    backgroundColor: colors.gray50,
    borderRadius: scale(4),
    height: scale(104),
    overflow: 'hidden',
    width: scale(104),
  },
  scrollViewContent: {
    paddingBottom: vs(40),
    paddingHorizontal: 0,
    paddingTop: vs(10),
  },
  separator: {
    height: vs(10),
  },
});

export default NailGrid;
