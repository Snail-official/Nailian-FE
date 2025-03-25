import { useState, useCallback } from 'react';

/**
 * 더 불러오기 구현을 위한 옵션 인터페이스
 */
interface LoadMoreOptions {
  /**
   * 다음 페이지 데이터를 로드하는 함수
   * @param page 로드할 페이지 번호
   */
  onLoad: (page: number) => Promise<void> | void;

  /**
   * 더 불러올 데이터가 있는지 여부
   */
  hasMore: boolean;

  /**
   * 현재 로딩 중인지 여부
   */
  isLoading: boolean;

  /**
   * 초기 페이지 번호 (기본값: 1)
   */
  initialPage?: number;

  /**
   * 디바운스 시간 (밀리초, 기본값: 300ms)
   */
  debounceTime?: number;
}

/**
 * 무한 스크롤 구현을 위한 커스텀 훅
 *
 * FlatList, ScrollView 등 스크롤 컴포넌트의 onEndReached와 함께 사용하여
 * 디바운싱 처리된 페이지네이션 로직을 제공합니다.
 *
 * @example
 * ```tsx
 * const { currentPage, handleLoadMore } = useInfiniteScroll({
 *   onLoadMore: fetchData,
 *   hasMoreData,
 *   isLoading,
 * });
 *
 * // FlatList에 적용
 * <FlatList
 *   data={items}
 *   onEndReached={handleLoadMore}
 *   onEndReachedThreshold={0.3}
 *   // ...기타 props
 * />
 * ```
 */
export function useLoadMore({
  onLoad,
  hasMore,
  isLoading,
  initialPage = 1,
  debounceTime = 300,
}: LoadMoreOptions) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [isEndReached, setIsEndReached] = useState<boolean>(false);

  /**
   * 스크롤 끝에 도달했을 때 추가 데이터를 로드하는 핸들러
   * 디바운싱을 통해 중복 호출을 방지합니다.
   */
  const handleLoadMore = useCallback(() => {
    // 이미 로딩 중이거나 더 불러올 데이터가 없거나 이미 처리 중이면 중단
    if (isLoading || !hasMore || isEndReached) return;

    // 엔드리치 플래그 설정
    setIsEndReached(true);

    // 다음 페이지 로드
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    onLoad(nextPage);

    // 디바운싱: 지정된 시간 후에 플래그 초기화
    setTimeout(() => {
      setIsEndReached(false);
    }, debounceTime);
  }, [currentPage, isLoading, hasMore, isEndReached, onLoad, debounceTime]);

  /**
   * 페이지 상태를 리셋하는 함수
   * 필터 변경 등으로 데이터를 처음부터 다시 로드할 때 사용
   */
  const resetPage = useCallback(() => {
    setCurrentPage(initialPage);
    setIsEndReached(false);
  }, [initialPage]);

  return {
    currentPage,
    setCurrentPage,
    resetPage,
    handleLoadMore,
    isEndReached,
  };
}
