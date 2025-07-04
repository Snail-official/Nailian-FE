import React, { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import Button from '~/shared/ui/Button';
import FilterIcon from '~/shared/assets/icons/ic_filter.svg';
import { NailSet, FingerType } from '~/pages/ar_experience';
import FilterModal, { FilterValues } from '../FilterModal';
import NailGrid from '../NailGrid';
import { BottomSheetRefProps } from '../BottomSheet';

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
  id: number;
  imageUrl: string;
}

interface NailSelectionProps {
  /**
   * 현재 선택된 네일셋
   */
  currentNailSet: NailSet;
  /**
   * 네일셋 변경 핸들러
   */
  onNailSetChange: (nailSet: NailSet) => void;
  /**
   * 읽기 전용 모드 (뷰 모드에서 사용)
   */
  readOnly?: boolean;
  /**
   * 바텀시트 참조
   */
  bottomSheetRef?: React.RefObject<BottomSheetRefProps>;
}
// 네일셋 변경 시 전달되는 임시 타입
interface NailSetUpdate extends Partial<NailSet> {
  nextFingerIndex?: number;
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
 * - 필터 결과가 없을 때 empty view 표시 및 필터 초기화 기능
 *
 * @param {NailSelectionProps} props - 네일 선택 컴포넌트 속성
 * @returns {JSX.Element} 네일 선택 컴포넌트
 */
export default function NailSelection({
  currentNailSet,
  onNailSetChange,
  readOnly = false,
  bottomSheetRef,
}: NailSelectionProps) {
  // 필터 모달 상태
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({});

  // 네일 버튼 상태 관리
  const [selectedNailButton, setSelectedNailButton] = useState<number | null>(
    null,
  );
  const [isSelectingImage, setIsSelectingImage] = useState(false);

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
      // 읽기 전용 모드에서는 동작하지 않음
      if (readOnly) return;

      // 이미 선택된 버튼이면 선택 해제
      if (selectedNailButton === index) {
        setSelectedNailButton(null);
        setIsSelectingImage(false);
        return;
      }

      // 새 버튼 선택 및 이미지 선택 모드로 전환
      setSelectedNailButton(index);
      setIsSelectingImage(true);
      // 바텀시트를 93% 스냅포인트로 확장
      bottomSheetRef?.current?.expand();
    },
    [selectedNailButton, readOnly, bottomSheetRef],
  );

  // 네일 이미지 삭제 핸들러
  const handleNailImageDelete = useCallback(
    (index: number) => {
      // 읽기 전용 모드에서는 동작하지 않음
      if (readOnly) return;

      const fingerType =
        (FINGER_MAP.find(item => item.index === index)
          ?.type as keyof NailSet) || 'pinky';

      // 부모 컴포넌트의 상태 업데이트
      const updatedNailSet = { ...currentNailSet };
      delete updatedNailSet[fingerType];
      onNailSetChange(updatedNailSet);

      setSelectedNailButton(null);
    },
    [currentNailSet, onNailSetChange, readOnly],
  );

  // 네일셋 변경 핸들러
  const handleNailSetChange = useCallback(
    (partialNailSet: NailSetUpdate) => {
      // 현재 네일셋과 새로운 변경사항을 병합
      const updatedNailSet = { ...currentNailSet, ...partialNailSet };

      // 다음 손가락 인덱스가 있으면 해당 손가락 선택
      if (partialNailSet.nextFingerIndex !== undefined) {
        setSelectedNailButton(partialNailSet.nextFingerIndex);
        setIsSelectingImage(true);
      } else {
        setSelectedNailButton(null);
        setIsSelectingImage(false);
      }

      onNailSetChange(updatedNailSet);
    },
    [currentNailSet, onNailSetChange],
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

        {/* 필터 버튼 - 읽기 전용 모드에서는 표시하지 않음 */}
        {!readOnly && (
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={handleFilterClick}
              activeOpacity={1}
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
        )}
      </View>

      {/* 그래디언트 이미지 */}
      <Image
        source={require('~/shared/assets/images/filter_modal_gradient.png')}
        style={styles.gradientImage}
        resizeMode="cover"
      />

      {/* 네일 그리드 (스크롤 영역) */}
      <View style={styles.gridContainer}>
        <NailGrid
          onNailSetChange={handleNailSetChange}
          activeFilters={activeFilters}
          selectedNailButton={selectedNailButton}
          isSelectingImage={isSelectingImage}
          fingerMap={FINGER_MAP}
          readOnly={readOnly}
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
    zIndex: 2,
  },
  filterText: {
    ...typography.body2_SB,
    color: colors.gray700,
  },
  fixedHeader: {
    paddingHorizontal: 0,
  },
  gradientImage: {
    height: scale(188),
    position: 'absolute',
    top: 0,
    width: scale(375),
    zIndex: 1,
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 0,
    zIndex: 0,
  },
  nailButtonsContainer: {
    flexDirection: 'row',
    gap: scale(10),
    justifyContent: 'flex-start',
    paddingLeft: scale(22),
    paddingRight: scale(22),
    zIndex: 2,
  },
});
