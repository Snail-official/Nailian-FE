import { useCallback, useState } from 'react';
import { Category, Color, Shape } from '~/shared/api/types';

// 필터 항목 유형 (카테고리, 색상, 쉐입)
export type FilterTabType = 'category' | 'color' | 'shape';

// 필터 값 인터페이스
export interface FilterValues {
  category?: Category;
  color?: Color;
  shape?: Shape;
}

// 필터 훅 반환 타입
interface UseFilterReturn {
  activeTab: FilterTabType;
  selectedValues: FilterValues;
  handleTabChange: (tab: FilterTabType) => void;
  handleCategorySelect: (category: Category | undefined) => void;
  handleColorSelect: (color: Color | undefined) => void;
  handleShapeSelect: (shape: Shape | undefined) => void;
  resetFilter: (initialValues?: FilterValues) => void;
  isApplyButtonEnabled: () => boolean;
}

interface UseFilterProps {
  initialValues?: FilterValues;
}

// 필터 훅
export function useFilter({
  initialValues = {},
}: UseFilterProps = {}): UseFilterReturn {
  // 선택된 탭
  const [activeTab, setActiveTab] = useState<FilterTabType>('category');

  // 선택된 필터 값
  const [selectedValues, setSelectedValues] =
    useState<FilterValues>(initialValues);

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

  // 필터 값 초기화
  const resetFilter = useCallback((values: FilterValues = {}) => {
    setSelectedValues(values);
  }, []);

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

  return {
    activeTab,
    selectedValues,
    handleTabChange,
    handleCategorySelect,
    handleColorSelect,
    handleShapeSelect,
    resetFilter,
    isApplyButtonEnabled,
  };
}
