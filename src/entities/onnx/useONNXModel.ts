import { useState, useCallback } from 'react';
import * as ort from 'onnxruntime-react-native';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

declare const atob: (data: string) => string;

/**
 * 사용할 모델 이름
 * @path android/app/src/main/assets/{modelName}
 * @path ios/assets/{modelName}
 */
const modelName = 'ResNet101-DUC-12-int8.onnx';

/**
 * ONNX 모델을 React Native에서 쉽게 사용할 수 있게 해주는 커스텀 훅
 *
 * 이 훅은 다음과 같은 기능을 제공합니다:
 * 1. ONNX 모델 파일 로드 (iOS/Android 플랫폼 별 최적화)
 * 2. base64 인코딩된 이미지 데이터를 ArrayBuffer로 변환
 * 3. 모델 세션 상태 관리
 *
 * @returns {Object} 모델 관련 함수와 상태를 포함하는 객체
 * @returns {ort.InferenceSession|null} model - 로드된 ONNX 모델 세션 객체
 * @returns {Function} loadModel - 모델을 비동기적으로 로드하는 함수
 * @returns {Function} base64ToArrayBuffer - base64 문자열을 ArrayBuffer로 변환하는 함수
 *
 * @example
 * // 기본 사용법
 * function MyComponent() {
 *   const { model, loadModel, base64ToArrayBuffer } = useONNXModel();
 *
 *   // 컴포넌트 마운트 시 모델 로드
 *   useEffect(() => {
 *     const initModel = async () => {
 *       await loadModel();
 *       console.log('모델 로드 완료!');
 *     };
 *
 *     initModel();
 *   }, [loadModel]);
 *
 *   // 이미지 처리 예제
 *   const processImage = async (base64Image) => {
 *     if (!model) return;
 *
 *     // 이미지 데이터 변환
 *     const buffer = base64ToArrayBuffer(base64Image);
 *
 *     // 모델 입력 텐서 생성 (예시)
 *     const imageData = new Uint8Array(buffer);
 *     // ... 이미지 전처리 로직 ...
 *
 *     // 입력 텐서 생성
 *     const inputTensor = new ort.Tensor('float32', preprocessedData, [1, 3, height, width]);
 *
 *     // 모델 실행
 *     const results = await model.run({ input: inputTensor });
 *
 *     // 결과 처리
 *     return results;
 *   };
 *
 *   return (
 *     // 컴포넌트 렌더링 로직
 *   );
 * }
 */
export const useONNXModel = () => {
  const [model, setModel] = useState<ort.InferenceSession | null>(null);

  /**
   * base64 인코딩된 문자열을 ArrayBuffer로 변환합니다.
   *
   * @param {string} base64 - 변환할 base64 인코딩된 문자열
   * @returns {ArrayBuffer} 변환된 ArrayBuffer
   */
  const base64ToArrayBuffer = useCallback((base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }, []);

  /**
   * ONNX 모델을 비동기적으로 로드합니다.
   * Android와 iOS 플랫폼에 따라 다른 로드 방식을 사용합니다.
   *
   * @returns {Promise<void>} 모델 로드 작업이 완료되면 해결되는 Promise
   */
  const loadModel = useCallback(async () => {
    const loadStart = Date.now();
    try {
      console.log('모델 로드 시작...');

      if (Platform.OS === 'android') {
        const readStart = Date.now();
        console.log('모델 파일 읽기 시작...');
        const modelData = await RNFS.readFileAssets(modelName, 'base64');
        const binaryString = atob(modelData);
        const modelBuffer = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          modelBuffer[i] = binaryString.charCodeAt(i);
        }
        console.log(
          '모델 파일 읽기 완료 - 소요시간:',
          Date.now() - readStart,
          'ms',
        );
        console.log('모델 버퍼 크기:', modelBuffer.length);

        const sessionStart = Date.now();
        console.log('ONNX 세션 생성 시작...');
        const session = await ort.InferenceSession.create(modelBuffer, {
          intraOpNumThreads: 1,
          enableMemPattern: true,
          extra: {
            optimization_level: 'ORT_ENABLE_BASIC',
            'session.use_arena': '1',
          },
        });
        console.log(
          '세션 생성 완료 - 소요시간:',
          Date.now() - sessionStart,
          'ms',
        );
        setModel(session);
      } else {
        const modelPath = `${RNFS.MainBundlePath}/${modelName}`;
        const session = await ort.InferenceSession.create(modelPath);
        setModel(session);
      }
      console.log('전체 모델 로드 시간:', Date.now() - loadStart, 'ms');
    } catch (error) {
      console.error('모델 로드 실패:', error);
    }
  }, []);

  return {
    model,
    loadModel,
    base64ToArrayBuffer,
  };
};
