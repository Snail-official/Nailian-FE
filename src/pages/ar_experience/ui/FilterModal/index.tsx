import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { TabBarHeader } from '~/shared/ui/TabBar';
import Button from '~/shared/ui/Button';
import { scale, vs } from '~/shared/lib/responsive';
import { Category, Color, Shape } from '~/shared/api/types';
import ListItem from '~/shared/ui/List';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

/**
 * 필터 항목 유형 (카테고리, 색상, 쉐입)
 */
type FilterTabType = 'category' | 'color' | 'shape';

/**
 * 필터 값 인터페이스
 */
export interface FilterValues {
  category?: Category;
  color?: Color;
  shape?: Shape;
}

/**
 * 필터 모달 Props 인터페이스
 */
interface FilterModalProps {
  /**
   * 모달 표시 여부
   */
  visible: boolean;
  /**
   * 모달 닫기 콜백
   */
  onClose: () => void;
  /**
   * 필터 적용 콜백
   */
  onApply: (filterValues: FilterValues) => void;
  /**
   * 초기 필터 값
   */
  initialValues?: FilterValues;
}

/**
 * 필터 모달 Ref 인터페이스
 */
export interface FilterModalRefProps {
  /**
   * 모달 표시
   */
  present: () => void;
  /**
   * 모달 닫기
   */
  dismiss: () => void;
}

/**
 * 필터 모달 컴포넌트
 *
 * AR 체험 페이지의 네일 그리드에서 사용되는 필터 모달입니다.
 * 카테고리, 색상, 쉐입 필터링 기능을 제공합니다.
 */
function FilterModal({
  visible,
  onClose,
  onApply,
  initialValues = {},
}: FilterModalProps) {
  // 바텀시트 모달 ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // 선택된 탭 (카테고리, 색상, 쉐입)
  const [activeTab, setActiveTab] = useState<FilterTabType>('category');

  // 선택된 필터 값
  const [selectedValues, setSelectedValues] =
    useState<FilterValues>(initialValues);

  // visible prop이 변경될 때 모달 열기/닫기 처리
  useEffect(() => {
    if (visible) {
      // 모달 열기 및 초기값 설정
      setSelectedValues(initialValues);
      bottomSheetModalRef.current?.present();
    } else {
      // 모달 닫기
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible, initialValues]);

  // 필터 항목 데이터 - API 타입에 맞춤
  const filterItems = useCallback(
    () => ({
      category: [
        { id: 'ONE_COLOR', name: '원컬러' },
        { id: 'FRENCH', name: '프렌치' },
        { id: 'GRADIENT', name: '그라데이션' },
        { id: 'ART', name: '아트' },
      ],
      color: [
        { id: 'WHITE', name: '화이트', color: colors.white },
        { id: 'BLACK', name: '블랙', color: colors.gray900 },
        { id: 'BEIGE', name: '베이지', color: '#F7EDD1' },
        { id: 'PINK', name: '핑크', color: '#FFBBD3' },
        { id: 'YELLOW', name: '옐로우', color: '#FFF53A' },
        { id: 'GREEN', name: '그린', color: '#CDFB90' },
        { id: 'BLUE', name: '블루', color: '#CADCFF' },
        { id: 'SILVER', name: '실버', color: '#EAEAEA' },
      ],
      shape: [
        { id: 'SQUARE', name: '스퀘어' },
        { id: 'ROUND', name: '라운드' },
        { id: 'ALMOND', name: '아몬드' },
        { id: 'BALLERINA', name: '발레리나' },
        { id: 'STILETTO', name: '스틸레토' },
      ],
    }),
    [],
  );

  // 탭 변경 핸들러
  const handleTabChange = useCallback((tab: FilterTabType) => {
    setActiveTab(tab);
  }, []);

  // 필터 항목 선택 핸들러
  const handleItemSelect = useCallback(
    (type: FilterTabType, itemId: string) => {
      setSelectedValues(prev => {
        // 이미 선택된 항목을 다시 클릭하면 선택 해제
        if (prev[type] === itemId) {
          const newValues = { ...prev };
          delete newValues[type];
          return newValues;
        }
        // 새 항목 선택
        return { ...prev, [type]: itemId };
      });
    },
    [],
  );

  // 필터 적용 핸들러
  const handleApply = useCallback(() => {
    onApply(selectedValues);
    onClose();
  }, [onApply, onClose, selectedValues]);

  // 닫기 핸들러 - 적용하지 않고 닫기
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // 바텀시트 닫기 콜백
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  // 백드롭 컴포넌트 렌더링
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
        animatedIndex={props.animatedIndex}
        animatedPosition={props.animatedPosition}
      />
    ),
    [],
  );

  // 필터 적용 버튼 활성화 여부 체크
  const isApplyButtonEnabled = Object.keys(selectedValues).length > 0;

  // 선택된 필터 항목 렌더링
  const renderFilterItems = useCallback(() => {
    const items = filterItems()[activeTab];

    if (activeTab === 'color') {
      return (
        <View style={styles.filterItemsContainer}>
          {items.map(item => (
            <ListItem
              key={item.id}
              content={
                <View style={styles.colorItemContent}>
                  <View
                    style={[
                      styles.colorCircle,
                      // @ts-expect-error color 속성은 색상 항목에만 존재
                      { backgroundColor: item.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.colorItemText,
                      selectedValues.color === item.id &&
                        styles.colorItemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                </View>
              }
              selected={selectedValues.color === item.id}
              onPress={() => handleItemSelect('color', item.id)}
            />
          ))}
        </View>
      );
    }

    return (
      <View style={styles.filterItemsContainer}>
        {items.map(item => (
          <ListItem
            key={item.id}
            content={
              <Text
                style={[
                  styles.itemText,
                  selectedValues[activeTab] === item.id &&
                    styles.itemTextSelected,
                ]}
              >
                {item.name}
              </Text>
            }
            selected={selectedValues[activeTab] === item.id}
            onPress={() => handleItemSelect(activeTab, item.id)}
          />
        ))}
      </View>
    );
  }, [activeTab, filterItems, handleItemSelect, selectedValues]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={['100%']}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      enableDynamicSizing={false}
      handleComponent={null}
      backgroundStyle={styles.modalBackground}
    >
      <View style={styles.modalContent}>
        {/* 상단 탭바 */}
        <TabBarHeader title="필터" onBack={handleClose} rightContent={null} />

        {/* 필터 탭 */}
        <View style={styles.tabContainer}>
          {(['category', 'color', 'shape'] as FilterTabType[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => handleTabChange(tab)}
            >
              <View style={styles.tabItemContainer}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab === 'category'
                    ? '카테고리'
                    : tab === 'color'
                      ? '색상'
                      : '쉐입'}
                </Text>
                {activeTab === tab && <View style={styles.tabIndicator} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 필터 항목 목록 */}
        <BottomSheetScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          {renderFilterItems()}
        </BottomSheetScrollView>

        {/* 적용하기 버튼 */}
        <View style={styles.buttonContainer}>
          <Button
            variant="secondaryMedium"
            onPress={handleApply}
            disabled={!isApplyButtonEnabled}
          >
            <Text style={[typography.title2_SB, { color: colors.white }]}>
              적용하기
            </Text>
          </Button>
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  activeTabText: {
    ...typography.body2_SB,
    color: colors.gray850,
  },
  buttonContainer: {
    alignItems: 'center',
    bottom: vs(16),
    left: 0,
    paddingHorizontal: scale(20),
    position: 'absolute',
    right: 0,
  },
  colorCircle: {
    borderColor: colors.gray100,
    borderRadius: scale(10),
    borderWidth: 1,
    height: scale(20),
    marginRight: scale(10),
    width: scale(20),
  },
  colorItemContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
  },
  colorItemText: {
    ...typography.body2_SB,
    color: colors.gray700,
  },
  colorItemTextSelected: {
    ...typography.body2_SB,
    color: colors.purple500,
  },
  content: {
    flex: 1,
  },
  divider: {
    backgroundColor: colors.gray100,
    height: 1,
    width: '100%',
  },
  filterItemsContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  itemText: {
    ...typography.body2_SB,
    color: colors.gray700,
    textAlign: 'center',
  },
  itemTextSelected: {
    ...typography.body2_SB,
    color: colors.purple500,
    textAlign: 'center',
  },
  modalBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: scale(30),
    borderTopRightRadius: scale(30),
  },
  modalContent: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: vs(80),
    paddingHorizontal: scale(20),
    paddingTop: vs(24),
  },
  tab: {
    alignItems: 'center',
    flex: 1,
  },
  tabContainer: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: scale(25),
    height: vs(35),
    justifyContent: 'space-around',
    marginTop: vs(18),
    paddingHorizontal: scale(20),
    width: '100%',
  },
  tabIndicator: {
    alignSelf: 'stretch',
    backgroundColor: colors.gray850,
    borderRadius: scale(2),
    height: vs(2),
  },
  tabItemContainer: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: vs(12),
    width: scale(88),
  },
  tabText: {
    ...typography.body2_SB,
    color: colors.gray400,
    textAlign: 'center',
  },
});

export default FilterModal;
