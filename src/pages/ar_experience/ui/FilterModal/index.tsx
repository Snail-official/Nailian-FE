import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  BackHandler,
} from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { TabBarHeader } from '~/shared/ui/TabBar';
import Button from '~/shared/ui/Button';
import { scale, vs } from '~/shared/lib/responsive';
import { Category, Color, Shape } from '~/shared/api/types';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

// 필터 탭 컴포넌트 import
import CategoryFilterTab from './ui/CategoryFilterTab';
import ColorFilterTab from './ui/ColorFilterTab';
import ShapeFilterTab from './ui/ShapeFilterTab';

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
 * AR 체험 화면에서 네일 디자인을 필터링하기 위한 모달 컴포넌트입니다.
 * 카테고리, 색상, 모양(쉐입) 세 가지 필터 옵션을 제공하며,
 * 각 필터 탭 간 전환이 가능하고 선택된 필터를 적용할 수 있습니다.
 *
 * 주요 기능:
 * - 카테고리, 색상, 모양 필터링 옵션 제공
 * - 탭 기반 필터 UI로 쉬운 필터 전환
 * - 선택한 필터 값 시각적 표시
 * - 필터 초기화 및 적용 기능
 * - Android 뒤로가기 버튼 핸들링
 * - SafeAreaView 통합으로 다양한 기기에서 안전한 화면 표시
 *
 * @param {FilterModalProps} props - 필터 모달 컴포넌트 속성
 * @returns {JSX.Element} 필터 모달 컴포넌트
 */
function FilterModal({
  visible,
  onClose,
  onApply,
  initialValues = {},
}: FilterModalProps) {
  // 안전 영역 인셋 가져오기
  const insets = useSafeAreaInsets();

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

  // 뒤로가기 버튼 핸들러 (Android)
  useEffect(() => {
    // Android에서만 적용, 모달이 열려있을 때만 작동
    if (Platform.OS !== 'android' || !visible) return;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // 모달이 열려있을 때 뒤로가기 버튼을 누르면 모달 닫기
        bottomSheetModalRef.current?.dismiss();
        return true; // 이벤트 처리 완료
      },
    );

    // 컴포넌트 언마운트 또는 상태 변경 시 이벤트 리스너 제거
    return () => backHandler.remove();
  }, [visible]);

  // 탭 변경 핸들러
  const handleTabChange = useCallback((tab: FilterTabType) => {
    setActiveTab(tab);
  }, []);

  // 카테고리 선택 핸들러
  const handleCategorySelect = useCallback((category: Category | undefined) => {
    setSelectedValues(prev => {
      if (category === undefined) {
        const newValues = { ...prev };
        delete newValues.category;
        return newValues;
      }
      return { ...prev, category };
    });
  }, []);

  // 색상 선택 핸들러
  const handleColorSelect = useCallback((color: Color | undefined) => {
    setSelectedValues(prev => {
      if (color === undefined) {
        const newValues = { ...prev };
        delete newValues.color;
        return newValues;
      }
      return { ...prev, color };
    });
  }, []);

  // 모양 선택 핸들러
  const handleShapeSelect = useCallback((shape: Shape | undefined) => {
    setSelectedValues(prev => {
      if (shape === undefined) {
        const newValues = { ...prev };
        delete newValues.shape;
        return newValues;
      }
      return { ...prev, shape };
    });
  }, []);

  // 필터 적용 핸들러
  const handleApply = useCallback(() => {
    // 필터 값 전달
    onApply(selectedValues);

    // 모달 닫기 - 애니메이션을 위해 onClose는 콜백으로 처리
    bottomSheetModalRef.current?.dismiss();
  }, [onApply, selectedValues]);

  // 닫기 핸들러 - 적용하지 않고 닫기
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

  // 필터 적용 버튼 활성화 여부 체크
  const isApplyButtonEnabled = useCallback(() => {
    // 필터 값이 변경되었는지 확인
    const initialKeys = Object.keys(initialValues) as (keyof FilterValues)[];
    const currentKeys = Object.keys(selectedValues) as (keyof FilterValues)[];

    // 키 개수가 다르거나, 키별로 값이 다르거나, 추가된 키가 있으면 변경된 것
    return (
      initialKeys.length !== currentKeys.length ||
      initialKeys.some(key => initialValues[key] !== selectedValues[key]) ||
      currentKeys.some(key => !initialKeys.includes(key))
    );
  }, [initialValues, selectedValues]);

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
      {/* SafeAreaView를 사용하여 노치, 홈 인디케이터 등의 영역을 고려한 안전한 레이아웃 제공 */}
      <SafeAreaView style={styles.modalContent}>
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
                <View
                  style={[
                    styles.tabIndicator,
                    activeTab !== tab && styles.inactiveTabIndicator,
                  ]}
                />
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
          {renderActiveTabContent()}
        </BottomSheetScrollView>

        {/* 적용하기 버튼 */}
        <View
          style={[
            styles.buttonContainer,
            { paddingBottom: insets.bottom + vs(16) },
          ]}
        >
          <Button
            variant="secondaryMedium"
            onPress={handleApply}
            disabled={!isApplyButtonEnabled()}
          >
            <Text style={[typography.title2_SB, { color: colors.white }]}>
              적용하기
            </Text>
          </Button>
        </View>
      </SafeAreaView>
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
    bottom: 0,
    left: 0,
    paddingHorizontal: scale(20),
    position: 'absolute',
    right: 0,
  },
  content: {
    flex: 1,
  },
  divider: {
    backgroundColor: colors.gray100,
    height: 1,
    marginBottom: vs(10),
    width: '100%',
  },
  inactiveTabIndicator: {
    backgroundColor: colors.white,
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
    paddingHorizontal: scale(31),
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
    color: colors.gray850,
    textAlign: 'center',
  },
});

export default FilterModal;
