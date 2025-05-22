import { NativeModules, NativeEventEmitter } from 'react-native';

const { ModelManager } = NativeModules;

// ModelManager 인터페이스 정의
export interface ModelManagerInterface {
  /**
   * 모델을 미리 로드합니다.
   * @param modelUrl 모델 URL
   * @param modelType 모델 타입 ('segmentation', 'handpose' 등)
   * @returns Promise<boolean> 로드 성공 여부
   */
  preloadModel(modelUrl: string, modelType: string): Promise<boolean>;

  /**
   * 모델 로드 상태를 확인합니다.
   * @param modelType 모델 타입
   * @returns Promise<boolean> 로드 완료 여부
   */
  getModelLoadStatus(modelType: string): Promise<boolean>;

  /**
   * 모델 파일 경로를 가져옵니다.
   * @param modelType 모델 타입
   * @returns Promise<string> 모델 파일 경로
   */
  getModelPath(modelType: string): Promise<string>;

  /**
   * 모델을 초기화합니다.
   * @param modelType 모델 타입
   * @returns Promise<boolean> 초기화 성공 여부
   */
  initModel(modelType: string): Promise<boolean>;

  /**
   * 모든 리소스(모델, 네일 이미지 등)의 로드 상태를 확인합니다.
   * @returns Promise<boolean> 모든 리소스 로드 완료 여부
   */
  checkResourceLoadStatus(): Promise<boolean>;

  /**
   * 리소스 로드 상태 변경을 구독합니다.
   * @param callback 상태 변경 시 호출될 콜백 함수
   */
  subscribeToResourceLoadStatus(callback: (isLoaded: boolean) => void): void;
}

// ModelManager 타입 지정
export const modelManager = ModelManager as ModelManagerInterface;

/**
 * 모든 리소스(모델, 네일 이미지)의 로드 상태를 관찰하는 함수
 * @param onStatusChanged 상태 변경 시 호출될 콜백 함수
 * @returns cleanup 함수
 */
export const observeResourceLoadStatus = (
  onStatusChanged: (isLoaded: boolean) => void,
): (() => void) => {
  let hasCleanedUp = false;
  let isAlreadyLoaded = false;

  console.log('리소스 로드 상태 관찰 시작');

  // 초기 상태 확인
  ModelManager.checkResourceLoadStatus()
    .then((isLoaded: boolean) => {
      if (!hasCleanedUp) {
        console.log('초기 리소스 상태:', isLoaded);
        isAlreadyLoaded = isLoaded;
        onStatusChanged(isLoaded);
      }
    })
    .catch((error: Error) => {
      console.error('리소스 상태 확인 실패:', error);
    });

  // 주기적으로 리소스 상태 확인 (0.3초 간격)
  const timerId = setInterval(() => {
    if (hasCleanedUp || isAlreadyLoaded) {
      clearInterval(timerId);
      console.log('리소스 로드 상태 확인 타이머 종료');
      return;
    }

    ModelManager.checkResourceLoadStatus()
      .then((isLoaded: boolean) => {
        if (hasCleanedUp) return;

        console.log('리소스 로드 상태 주기적 확인:', isLoaded);

        if (isLoaded) {
          isAlreadyLoaded = true;
          clearInterval(timerId);
          console.log('모든 리소스 로드 완료, 타이머 종료');
        }

        onStatusChanged(isLoaded);
      })
      .catch((error: Error) => {
        console.error('리소스 상태 확인 실패:', error);
      });
  }, 300);

  // cleanup 함수
  return () => {
    console.log('리소스 로드 상태 관찰 종료');
    hasCleanedUp = true;
    clearInterval(timerId);
  };
};
