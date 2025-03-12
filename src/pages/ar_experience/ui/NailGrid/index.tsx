import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Text,
} from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { NailListResponse } from '~/shared/api/types';
import { fetchNails } from '~/entities/nail-tip/api';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import FilterIcon from '~/shared/assets/icons/ic_filter.svg';
import Button from '~/shared/ui/Button';

// 손가락 타입 정의
export type FingerType = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';

// 손가락 타입과 인덱스 매핑
const FINGER_MAP = [
  { index: 0, type: 'pinky' }, // 소지
  { index: 1, type: 'ring' }, // 약지
  { index: 2, type: 'middle' }, // 중지
  { index: 3, type: 'index' }, // 검지
  { index: 4, type: 'thumb' }, // 엄지
];

/**
 * 네일 이미지 인터페이스
 */
interface NailImage {
  id: string;
  imageUrl: string;
}

/**
 * 네일 세트 인터페이스 (API 요청 형식에 맞춤)
 */
interface NailSet {
  thumb?: NailImage;
  index?: NailImage;
  middle?: NailImage;
  ring?: NailImage;
  pinky?: NailImage;
}

interface NailGridProps {
  /**
   * 네일 아이템 선택 시 호출되는 콜백 함수
   */
  onSelectNail?: (id: string) => void;
  /**
   * 현재 네일 세트가 변경될 때 호출되는 콜백 함수
   */
  onNailSetChange?: (nailSet: NailSet) => void;
}

/**
 * 네일 그리드 컴포넌트
 *
 * 네일 디자인 이미지를 그리드 형태로 표시합니다.
 * - 무한 스크롤을 지원합니다.
 * - 터치 가능한 네일 아이템을 제공합니다.
 * - 손가락별 네일팁을 선택하여 네일 세트를 구성합니다.
 *
 * @returns {JSX.Element} 네일 그리드 컴포넌트
 */
export function NailGrid({ onSelectNail, onNailSetChange }: NailGridProps) {
  // 기본 데이터 상태
  const [nails, setNails] = useState<{ id: string; imageUrl: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollViewRef =
    useRef<React.ComponentRef<typeof BottomSheetScrollView>>(null);

  // 네일 버튼 상태 관리
  const [selectedNailButton, setSelectedNailButton] = useState<number | null>(
    null,
  );

  // 네일 세트 상태 관리 (API 형식에 맞춤)
  const [currentNailSet, setCurrentNailSet] = useState<NailSet>({});

  // 이미지 선택 모드 상태
  const [isSelectingImage, setIsSelectingImage] = useState(false);

  // 인덱스로 손가락 타입 찾기
  const getFingerTypeByIndex = useCallback(
    (index: number): FingerType =>
      (FINGER_MAP.find(item => item.index === index)?.type as FingerType) ||
      'pinky',
    [],
  );

  // 네일 세트 변경 시 콜백 호출
  useEffect(() => {
    onNailSetChange?.(currentNailSet);
  }, [currentNailSet, onNailSetChange]);

  // 이미지를 네일 세트에 추가하는 함수
  const addImageToNailSet = useCallback(
    (index: number, nailItem: { id: string; imageUrl: string }) => {
      const fingerType = getFingerTypeByIndex(index);

      setCurrentNailSet(prev => ({
        ...prev,
        [fingerType]: {
          id: nailItem.id,
          imageUrl: nailItem.imageUrl,
        },
      }));

      // 선택 상태 해제
      setSelectedNailButton(null);
    },
    [getFingerTypeByIndex],
  );

  // 필터 버튼 클릭 핸들러
  const handleFilterClick = useCallback(() => {
    console.log('필터 버튼이 클릭되었습니다.');
  }, []);

  // 네일 버튼 클릭 핸들러
  const handleNailButtonClick = useCallback(
    (index: number) => {
      const fingerType = getFingerTypeByIndex(index);
      const hasImage = !!currentNailSet[fingerType];

      if (hasImage) {
        // 이미지가 있는 경우: 이미지 추가 상태 ↔ 이미지 선택 상태
        setSelectedNailButton(prevIndex =>
          prevIndex === index ? null : index,
        );
        setIsSelectingImage(false);
      } else {
        // 이미지가 없는 경우: 기본 상태 ↔ 선택 상태
        if (selectedNailButton === index) {
          // 같은 버튼 다시 클릭: 선택 취소
          setSelectedNailButton(null);
          setIsSelectingImage(false);
        } else {
          // 다른 버튼 클릭: 선택 + 이미지 선택 모드 활성화
          setSelectedNailButton(index);
          setIsSelectingImage(true);
        }
      }
    },
    [currentNailSet, selectedNailButton, getFingerTypeByIndex],
  );

  // 네일 이미지 삭제 핸들러
  const handleNailImageDelete = useCallback(
    (index: number) => {
      const fingerType = getFingerTypeByIndex(index);

      setCurrentNailSet(prev => {
        const updatedNailSet = { ...prev };
        delete updatedNailSet[fingerType];

        return updatedNailSet;
      });

      setSelectedNailButton(null);
    },
    [getFingerTypeByIndex],
  );

  // 그리드 네일 아이템 클릭 핸들러
  const handleNailItemClick = useCallback(
    (item: { id: string; imageUrl: string }) => {
      // 이미지 선택 모드일 때: 버튼에 이미지 추가
      if (isSelectingImage && selectedNailButton !== null) {
        addImageToNailSet(selectedNailButton, item);
        setIsSelectingImage(false);
        return;
      }

      // 기본 모드일 때: 외부 콜백 실행
      onSelectNail?.(item.id);
    },
    [isSelectingImage, selectedNailButton, onSelectNail, addImageToNailSet],
  );

  // 네일 이미지 로드 함수
  const loadNailImages = useCallback(
    async (page = 1) => {
      if (isLoading || !hasMore) return;

      try {
        setIsLoading(true);
        const response: NailListResponse = await fetchNails({
          page,
          size: 24,
        });

        if (response.data) {
          const newData =
            response.data?.data.map(nail => ({
              ...nail,
              id: String(nail.id),
            })) ?? [];

          setNails(prev => [...prev, ...newData]);
          setCurrentPage(page);
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
    [isLoading, hasMore],
  );

  // 초기 데이터 로드
  useEffect(() => {
    loadNailImages(1);
  }, [loadNailImages]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isLoading || !hasMore) return;

      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      const paddingToBottom = 20;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;

      if (isCloseToBottom) {
        loadNailImages(currentPage + 1);
      }
    },
    [isLoading, hasMore, currentPage, loadNailImages],
  );

  // 화면 터치 시 선택 상태 해제
  const handleScreenTouch = useCallback(() => {
    // 이미지 선택 모드일 때는 무시
    if (isSelectingImage) return;

    // 선택된 버튼이 있으면 선택 해제
    if (selectedNailButton !== null) {
      setSelectedNailButton(null);
    }
  }, [selectedNailButton, isSelectingImage]);

  // 네일 아이템 렌더링 함수
  const renderNailItem = useCallback(
    (props: { item: { id: string; imageUrl: string } }) => (
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

  // 네일 추가 버튼 렌더링
  const renderNailButtons = useCallback(
    () =>
      FINGER_MAP.map(fingerMap => {
        const { index, type } = fingerMap;
        const nailImage = currentNailSet[type as keyof NailSet];
        const isSelected = selectedNailButton === index;

        return (
          <Button
            key={`nail-button-${type}`}
            variant="add_nail"
            isSelected={isSelected}
            imageSource={nailImage ? { uri: nailImage.imageUrl } : undefined}
            onPress={() => handleNailButtonClick(index)}
            onImageDelete={() => handleNailImageDelete(index)}
          />
        );
      }),
    [
      currentNailSet,
      selectedNailButton,
      handleNailButtonClick,
      handleNailImageDelete,
    ],
  );

  // 아이템 구분선 컴포넌트
  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  // 로딩 푸터 컴포넌트
  const renderFooter = useCallback(() => {
    if (!isLoading) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={colors.purple500} />
      </View>
    );
  }, [isLoading]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleScreenTouch}
      style={styles.screenContainer}
    >
      <BottomSheetScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.scrollViewContent}
        bounces={false}
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        overScrollMode="never"
        directionalLockEnabled={true}
        disableScrollViewPanResponder={false}
      >
        {/* 필터 버튼 */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={handleFilterClick}
            activeOpacity={0.7}
          >
            <FilterIcon width={24} height={24} />
            <Text style={styles.filterText}>필터</Text>
          </TouchableOpacity>
        </View>

        {/* 네일 추가 버튼 영역 */}
        <View style={styles.nailButtonsContainer}>{renderNailButtons()}</View>

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
        {renderFooter()}
      </BottomSheetScrollView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  columnWrapper: {
    gap: 10,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
  },
  filterButton: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 10,
  },
  filterContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  filterText: {
    ...typography.body2_SB,
    color: colors.gray700,
    marginLeft: 4,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  loaderContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingBottom: 20,
  },
  nailButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  nailImage: {
    borderRadius: 4,
    height: '100%',
    width: '100%',
  },
  nailItem: {
    backgroundColor: colors.gray50,
    borderRadius: 4,
    height: 103,
    overflow: 'hidden',
    width: 103,
  },
  screenContainer: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    paddingBottom: 40,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  separator: {
    height: 10,
  },
});

export default NailGrid;
