import React, { useCallback, useState, useRef } from 'react';
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
import { useInfiniteQuery } from '@tanstack/react-query';
import { colors } from '~/shared/styles/design';
import { NailListResponse, Shape } from '~/shared/api/types';
import { fetchNails } from '~/entities/nail-tip/api';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { scale, vs } from '~/shared/lib/responsive';
import { NailSet, FingerType } from '~/pages/ar_experience';
import EmptyView from '~/shared/ui/EmptyView';
import { FilterValues } from '../FilterModal';

interface NailGridProps {
  /**
   * 현재 네일 세트가 변경될 때 호출되는 콜백 함수
   */
  onNailSetChange?: (nailSet: NailSetUpdate) => void;
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
  onResetFilter?: () => void;
}

// 네일셋 변경 시 전달되는 임시 타입
interface NailSetUpdate extends Partial<NailSet> {
  nextFingerIndex?: number;
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
  onResetFilter,
}: NailGridProps) {
  const scrollViewRef =
    useRef<React.ComponentRef<typeof BottomSheetScrollView>>(null);

  // 인덱스로 손가락 타입 찾기
  const getFingerTypeByIndex = useCallback(
    (index: number): FingerType =>
      (fingerMap.find(item => item.index === index)?.type as FingerType) ||
      'pinky',
    [fingerMap],
  );

  // 네일 이미지 무한 스크롤 쿼리
  const {
    data: nailData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['nails', activeFilters],
    queryFn: async ({ pageParam = 0 }) =>
      fetchNails({
        page: pageParam,
        size: 24,
        category: activeFilters.category,
        color: activeFilters.color,
        shape: activeFilters.shape,
      }),
    getNextPageParam: lastPage => {
      const totalPages = lastPage.data?.pageInfo?.totalPages || 0;
      const currentPage = lastPage.data?.pageInfo?.currentPage || 0;
      return currentPage < totalPages - 1 ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
  });

  // 모든 페이지의 데이터를 하나의 배열로 합치기
  const nails =
    nailData?.pages.flatMap(
      page =>
        page.data?.content.map(nail => ({
          ...nail,
          id: nail.id,
        })) ?? [],
    ) ?? [];

  // 이미지를 네일 세트에 추가하는 함수
  const addImageToNailSet = useCallback(
    (
      index: number,
      nailItem: { id: number; imageUrl: string; shape?: Shape },
    ) => {
      const fingerType = getFingerTypeByIndex(index);

      // 현재 선택된 손가락에 네일을 추가하고, 다음 손가락을 선택하는 정보를 한 번에 전달
      const currentIndex = fingerMap.findIndex(item => item.index === index);
      const nextFinger = fingerMap[currentIndex + 1];
      const shouldSelectNextFinger =
        nextFinger && currentIndex < fingerMap.length - 1;

      const updatedSet: NailSetUpdate = {
        [fingerType]: {
          id: nailItem.id,
          imageUrl: nailItem.imageUrl,
          shape: nailItem.shape,
        },
        ...(shouldSelectNextFinger && { nextFingerIndex: nextFinger.index }),
      };

      onNailSetChange?.(updatedSet);
    },
    [getFingerTypeByIndex, onNailSetChange, fingerMap],
  );

  // 그리드 네일 아이템 클릭 핸들러
  const handleNailItemClick = useCallback(
    (item: { id: number; imageUrl: string; shape?: Shape }) => {
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
        activeOpacity={1}
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
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.purple500} />
      </View>
    );
  }, [isFetchingNextPage]);

  // 아이템 구분선 컴포넌트
  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  // 스크롤 이벤트 핸들러
  const onScrollEndHandler = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;

      const paddingToBottom = 0.8;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height * paddingToBottom;

      if (isCloseToBottom && hasNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage],
  );

  return (
    <BottomSheetScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
      bounces={false}
      showsVerticalScrollIndicator={true}
      onScroll={onScrollEndHandler}
      overScrollMode="never"
      directionalLockEnabled={true}
      disableScrollViewPanResponder={false}
    >
      {!isLoading && nails.length === 0 ? (
        <View style={styles.emptyViewWrapper}>
          <EmptyView
            message="조건에 맞는 네일이 없어요."
            buttonText="필터 초기화"
            onButtonPress={onResetFilter}
          />
        </View>
      ) : (
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
      )}
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
  emptyViewWrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
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
