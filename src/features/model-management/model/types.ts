// 모델 매니저 타입 정의
export interface ModelManagerType {
  initModel: (modelType: string) => Promise<boolean>;
  getModelLoadStatus: (modelType: string) => Promise<string>;
  preloadModel: (url: string, modelType: string) => Promise<boolean>;
}

// 모델 로딩 상태
export type ModelLoadingStatus = 'idle' | 'loading' | 'success' | 'error';

// 모델 타입
export type ModelType = 'segmentation' | 'detection';
