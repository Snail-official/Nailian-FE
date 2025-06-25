import { NailSet } from '~/features/ar-experience/model/types';

// 프레임 레이아웃 인터페이스
export interface FrameLayout {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// 카메라 뷰 매니저 타입 정의
export interface CameraViewManagerType {
  setNailSet: (nodeId: number, nailSet: NailSet) => void;
  capturePhoto: (nodeId: number) => Promise<void>;
  clearOverlay: (nodeId: number) => void;
}

// 모델 매니저 타입 정의
export interface ModelManagerType {
  initModel: (modelType: string) => Promise<boolean>;
  getModelLoadStatus: (modelType: string) => Promise<string>;
}
