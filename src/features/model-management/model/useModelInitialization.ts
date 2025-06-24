import { useState, useEffect } from 'react';
import { NativeModules } from 'react-native';
import { ModelManagerType, ModelType } from './types';

// 모델 초기화 훅
export function useModelInitialization(modelType: ModelType = 'segmentation') {
  // 모델 매니저 가져오기
  const { ModelManager } = NativeModules;
  const enhancedModelManager = ModelManager as ModelManagerType;

  // 상태 관리
  const [modelError, setModelError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // 모델 초기화
  useEffect(() => {
    const initializeModel = async () => {
      try {
        setIsInitializing(true);
        // 모델 초기화
        await enhancedModelManager.initModel(modelType);
        console.log(`${modelType} 모델 초기화 성공`);
        setIsInitialized(true);
        setModelError(null);
      } catch (error) {
        console.error(`${modelType} 모델 초기화 실패:`, error);
        setModelError(
          '모델 초기화에 실패했습니다. 필요한 모델이 다운로드되어 있는지 확인해주세요.',
        );
        setIsInitialized(false);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeModel();
  }, [enhancedModelManager, modelType]);

  return {
    modelError,
    isInitializing,
    isInitialized,
  };
}
