import React, { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import Button from '~/shared/ui/Button';
import FilterIcon from '~/shared/assets/icons/ic_filter.svg';
import { INailSet } from '~/shared/types/nail-set';
import FilterModal, { FilterValues } from '../FilterModal';
import NailGrid from '../NailGrid';
// 손가락 타입 정의
export type FingerType = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';

// 손가락 타입과 인덱스 매핑
export const FINGER_MAP = [
  { index: 0, type: 'pinky' }, // 소지
  { index: 1, type: 'ring' }, // 약지
  { index: 2, type: 'middle' }, // 중지
  { index: 3, type: 'index' }, // 검지
  { index: 4, type: 'thumb' }, // 엄지
];

/**
 * 네일 이미지 인터페이스
 */
export interface NailImage {
  id: string;
  imageUrl: string;
}

/**
 * 네일 세트 인터페이스 (API 요청 형식에 맞춤)
 */
export interface NailSet {
  thumb?: NailImage;
  index?: NailImage;
  middle?: NailImage;
  ring?: NailImage;
  pinky?: NailImage;
}

interface NailSelectionProps {
  /**
   * 네일 아이템 선택 시 호출되는 콜백 함수
   */
  onSelectNail?: (id: string) => void;
  /**
   * 현재 네일 세트가 변경될 때 호출되는 콜백 함수
   */
  onNailSetChange?: (nailSet: Partial<INailSet>) => void;
}

/**
 * 네일 선택 컴포넌트
 *
 * AR 체험 화면에서 사용자가 각 손가락별로 네일 디자인을 선택할 수 있는 영역을 제공합니다.
 * 필터 기능을 통해 다양한 네일 스타일을 필터링할 수 있고,
 * 손가락별로 네일 디자인을 선택하여 가상으로 적용해볼 수 있습니다.
 *
 * 주요 기능:
 * - 손가락별 네일 선택 탭 UI 제공
 * - 필터 모달을 통한 네일 스타일 필터링
 * - 선택된 네일을 표시하는 그리드 뷰
 * - 선택된 네일 정보를 상위 컴포넌트로 전달
 *
 * @param {NailSelectionProps} props - 네일 선택 컴포넌트 속성
 * @returns {JSX.Element} 네일 선택 컴포넌트
 */
export default function NailSelection({
  onSelectNail,
  onNailSetChange,
}: NailSelectionProps) {
  // 필터 모달 상태
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({});

  // 네일 버튼 상태 관리
  const [selectedNailButton, setSelectedNailButton] = useState<number | null>(
    null,
  );
  const [isSelectingImage, setIsSelectingImage] = useState(false);
  const [currentNailSet, setCurrentNailSet] = useState<Partial<INailSet>>({});

  // 필터 버튼 클릭 핸들러
  const handleFilterClick = useCallback(() => {
    // 필터 모달 열기
    setIsFilterModalVisible(true);
  }, []);

  // 필터 모달 취소 핸들러 (뒤로가기 버튼)
  const handleCancelFilter = useCallback(() => {
    // 모달 닫기만 하고 필터는 적용하지 않음
    setIsFilterModalVisible(false);
  }, []);

  // 필터 적용 핸들러
  const handleApplyFilter = useCallback((filterValues: FilterValues) => {
    // 모달 닫기
    setIsFilterModalVisible(false);

    // 필터 적용
    setActiveFilters(filterValues);
  }, []);

  // 손가락 버튼 클릭 핸들러
  const handleNailButtonClick = useCallback(
    (index: number) => {
      // 이미 선택된 버튼이면 선택 해제
      if (selectedNailButton === index) {
        setSelectedNailButton(null);
        setIsSelectingImage(false);
        return;
      }

      // 새 버튼 선택 및 이미지 선택 모드로 전환
      setSelectedNailButton(index);
      setIsSelectingImage(true);
    },
    [selectedNailButton],
  );

  // 네일 이미지 삭제 핸들러
  const handleNailImageDelete = useCallback(
    (index: number) => {
      const fingerType =
        (FINGER_MAP.find(item => item.index === index)?.type as FingerType) ||
        'pinky';

      setCurrentNailSet(prev => {
        const updatedNailSet = { ...prev };
        delete updatedNailSet[fingerType];

        // 부모 컴포넌트에 변경사항 알림
        onNailSetChange?.(updatedNailSet);

        return updatedNailSet;
      });

      setSelectedNailButton(null);
    },
    [onNailSetChange],
  );

  // 네일 그리드에서 이미지 선택 시 콜백
  const handleNailImageSelect = useCallback(
    (nailId: string) => {
      // 이미지 선택 모드이고 선택된 버튼이 있는 경우
      if (isSelectingImage && selectedNailButton !== null) {
        // 선택 모드 해제
        setIsSelectingImage(false);
        setSelectedNailButton(null);
      }

      // 외부에서 제공된 콜백 실행
      onSelectNail?.(nailId);
    },
    [isSelectingImage, selectedNailButton, onSelectNail],
  );

  // 네일 세트 변경 핸들러
  const handleNailSetChange = useCallback(
    (nailSet: Partial<INailSet>) => {
      setCurrentNailSet(nailSet);
      onNailSetChange?.(nailSet);
    },
    [onNailSetChange],
  );

  // 네일 버튼 렌더링
  const renderNailButtons = useCallback(
    () =>
      FINGER_MAP.map(fingerMap => {
        const { index, type } = fingerMap;
        const fingerType = type as FingerType;
        const nailImage = currentNailSet[fingerType];
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

  // 화면 터치 핸들러 - 선택 모드 해제
  const handleScreenTouch = useCallback(() => {
    if (selectedNailButton !== null) {
      setSelectedNailButton(null);
      setIsSelectingImage(false);
    }
  }, [selectedNailButton]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleScreenTouch}
      style={styles.container}
    >
      {/* 상단 고정 영역 */}
      <View style={styles.fixedHeader}>
        {/* 네일 추가 버튼 영역 */}
        <View style={styles.nailButtonsContainer}>{renderNailButtons()}</View>

        {/* 필터 버튼 */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={handleFilterClick}
            activeOpacity={0.7}
          >
            <View style={styles.filterButtonContent}>
              <FilterIcon
                width={scale(20)}
                height={scale(20)}
                color={colors.gray600}
              />
              <Text style={styles.filterText}>필터</Text>
              {Object.keys(activeFilters).length > 0 && (
                <View style={styles.filterActiveIndicator} />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 네일 그리드 (스크롤 영역) */}
      <View style={styles.gridContainer}>
        <NailGrid
          onSelectNail={handleNailImageSelect}
          onNailSetChange={handleNailSetChange}
          activeFilters={activeFilters}
          selectedNailButton={selectedNailButton}
          isSelectingImage={isSelectingImage}
          fingerMap={FINGER_MAP}
        />
      </View>

      {/* 필터 모달 */}
      <FilterModal
        visible={isFilterModalVisible}
        onClose={handleCancelFilter}
        onApply={handleApplyFilter}
        initialValues={activeFilters}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  filterActiveIndicator: {
    backgroundColor: colors.purple500,
    borderRadius: scale(3),
    height: scale(6),
    position: 'absolute',
    right: scale(3),
    top: scale(8),
    width: scale(6),
  },
  filterButton: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  filterButtonContent: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: scale(4),
    padding: scale(10),
    paddingHorizontal: scale(12),
    position: 'relative',
  },
  filterContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: vs(12),
    marginTop: vs(20),
    paddingRight: scale(22),
  },
  filterText: {
    ...typography.body2_SB,
    color: colors.gray700,
  },
  fixedHeader: {
    paddingHorizontal: 0,
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 0,
  },
  nailButtonsContainer: {
    flexDirection: 'row',
    gap: scale(10),
    justifyContent: 'flex-start',
    paddingLeft: scale(22),
    paddingRight: scale(22),
  },
});
