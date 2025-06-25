import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { colors } from '~/shared/styles/design';
import { TabBarHeader } from '~/shared/ui/TabBar';
import { vs } from '~/shared/lib/responsive';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBackHandler } from '~/shared/hooks';
import { useFilter, FilterValues } from '~/features/filter';
import {
  FilterTabs,
  ApplyButton,
  CategoryFilterTab,
  ColorFilterTab,
  ShapeFilterTab,
} from './ui';

// 필터 모달 Props 인터페이스
interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filterValues: FilterValues) => void;
  initialValues?: FilterValues;
}

// 필터 모달 Ref 인터페이스
export interface FilterModalRefProps {
  present: () => void;
  dismiss: () => void;
}

// 필터 모달 컴포넌트
function FilterModal({
  visible,
  onClose,
  onApply,
  initialValues = {},
}: FilterModalProps) {
  const {
    activeTab,
    selectedValues,
    handleTabChange,
    handleCategorySelect,
    handleColorSelect,
    handleShapeSelect,
    resetFilter,
    isApplyButtonEnabled,
  } = useFilter({ initialValues });

  // 바텀시트 모달 ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // 모달 표시/숨김 처리
  useEffect(() => {
    if (visible) {
      // 모달 열기 및 초기값 설정
      resetFilter(initialValues);
      bottomSheetModalRef.current?.present();
    } else {
      // 모달 닫기
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible, initialValues, resetFilter]);

  // 뒤로가기 버튼 핸들러 (Android)
  useBackHandler({
    onBackPress: () => {
      // 모달이 열려있을 때 뒤로가기 버튼을 누르면 모달 닫기
      bottomSheetModalRef.current?.dismiss();
      return true;
    },
    enabled: visible,
  });

  // 필터 적용 핸들러
  const handleApplyFilter = useCallback(() => {
    // 필터 값 전달
    onApply(selectedValues);

    // 모달 닫기
    bottomSheetModalRef.current?.dismiss();
  }, [onApply, selectedValues]);

  // 닫기 핸들러
  const handleClose = useCallback(() => {
    // 모달 닫기
    bottomSheetModalRef.current?.dismiss();
  }, []);

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

  // 현재 활성화된 탭에 따라 필터 컴포넌트 렌더링
  const renderActiveTabContent = useCallback(() => {
    switch (activeTab) {
      case 'category':
        return (
          <CategoryFilterTab
            selectedCategory={selectedValues.category}
            onSelectCategory={handleCategorySelect}
          />
        );
      case 'color':
        return (
          <ColorFilterTab
            selectedColor={selectedValues.color}
            onSelectColor={handleColorSelect}
          />
        );
      case 'shape':
        return (
          <ShapeFilterTab
            selectedShape={selectedValues.shape}
            onSelectShape={handleShapeSelect}
          />
        );
      default:
        return null;
    }
  }, [
    activeTab,
    selectedValues.category,
    selectedValues.color,
    selectedValues.shape,
    handleCategorySelect,
    handleColorSelect,
    handleShapeSelect,
  ]);

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
      {/* SafeAreaView */}
      <SafeAreaView style={styles.modalContent}>
        {/* 상단 탭바 */}
        <TabBarHeader title="필터" onBack={handleClose} rightContent={null} />

        {/* 필터 탭 */}
        <FilterTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* 필터 항목 목록 */}
        <BottomSheetScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          {renderActiveTabContent()}
        </BottomSheetScrollView>

        {/* 적용하기 버튼 */}
        <ApplyButton
          onApply={handleApplyFilter}
          enabled={isApplyButtonEnabled()}
        />
      </SafeAreaView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  modalBackground: {
    backgroundColor: colors.white,
  },
  modalContent: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: vs(80),
    paddingTop: vs(4),
  },
});

export default FilterModal;
