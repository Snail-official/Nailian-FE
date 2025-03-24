import { useState, useEffect, useCallback } from 'react';
import {
  Platform,
  NativeModules,
  NativeEventEmitter,
  EmitterSubscription,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchLatestModels } from '~/entities/model/api';
import { ModelInfo } from '~/shared/api/types';

/**
 * 모델 로딩 상태
 */
export type ModelLoadingStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * 저장된 모델 버전 정보
 */
interface StoredModelInfo {
  releaseDate: string;
  url: string;
}

/**
 * AsyncStorage 키
 */
const STORAGE_KEYS = {
  SEGMENTATION_MODEL: 'MODEL_SEGMENTATION_INFO',
  DETECTION_MODEL: 'MODEL_DETECTION_INFO',
};

/**
 * 모델 로더 훅 반환 타입
 */
interface UseModelLoaderReturn {
  status: ModelLoadingStatus;
  isLoaded: boolean;
  error: Error | null;
  reload: () => Promise<void>;
  modelInfo: {
    segmentation?: StoredModelInfo;
    detection?: StoredModelInfo;
  };
}

const { ModelManager } = NativeModules;

// ModelManager 이벤트 이미터 (다운로드 진행률 등 이벤트 수신용)
const modelManagerEmitter = ModelManager
  ? new NativeEventEmitter(NativeModules.ModelManager)
  : null;

/**
 * 모델 로드를 처리하는 커스텀 훅
 *
 * @param {boolean} autoLoad - 자동으로 모델을 로드할지 여부 (기본값: true)
 * @returns {UseModelLoaderReturn} 모델 로드 상태, 에러, 재로드 함수, 모델 정보
 */
const useModelLoader = (autoLoad = true): UseModelLoaderReturn => {
  const [status, setStatus] = useState<ModelLoadingStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [modelInfo, setModelInfo] = useState<{
    segmentation?: StoredModelInfo;
    detection?: StoredModelInfo;
  }>({});

  /**
   * AsyncStorage에서 저장된 모델 정보 로드
   */
  const loadStoredModelInfo = async () => {
    try {
      const segmentationInfoStr = await AsyncStorage.getItem(
        STORAGE_KEYS.SEGMENTATION_MODEL,
      );
      const detectionInfoStr = await AsyncStorage.getItem(
        STORAGE_KEYS.DETECTION_MODEL,
      );
      const segmentation = segmentationInfoStr
        ? (JSON.parse(segmentationInfoStr) as StoredModelInfo)
        : undefined;
      const detection = detectionInfoStr
        ? (JSON.parse(detectionInfoStr) as StoredModelInfo)
        : undefined;
      setModelInfo({
        segmentation,
        detection,
      });
    } catch (e) {
      // 에러 처리
      console.error('저장된 모델 정보 로드 실패:', e);
    }
  };

  /**
   * 이미 로드된 모델인지 확인 (네이티브 모듈 호출)
   */
  const isModelAlreadyLoaded = async (modelType: string): Promise<boolean> => {
    if (!ModelManager) return false;
    try {
      const loadStatus = await ModelManager.getModelLoadStatus(modelType);
      return loadStatus === 'loaded';
    } catch (e) {
      console.error(`모델 로드 상태 확인 실패 (${modelType}):`, e);
      return false;
    }
  };

  /**
   * 모델이 최신 버전인지 확인
   */
  const isModelUpToDate = (
    storedInfo: StoredModelInfo | undefined,
    serverInfo: ModelInfo,
  ): boolean => {
    if (!storedInfo) return false;
    return (
      storedInfo.releaseDate === serverInfo.releaseDate &&
      storedInfo.url === serverInfo.url
    );
  };

  /**
   * 모델 정보 저장 (AsyncStorage 사용)
   */
  const saveModelInfo = async (
    modelType: 'segmentation' | 'detection',
    serverModelInfo: ModelInfo,
  ) => {
    try {
      const info: StoredModelInfo = {
        releaseDate: serverModelInfo.releaseDate,
        url: serverModelInfo.url,
      };
      const storageKey =
        modelType === 'segmentation'
          ? STORAGE_KEYS.SEGMENTATION_MODEL
          : STORAGE_KEYS.DETECTION_MODEL;
      await AsyncStorage.setItem(storageKey, JSON.stringify(info));
      setModelInfo(prev => ({
        ...prev,
        [modelType]: info,
      }));
      return info;
    } catch (e) {
      console.error(`${modelType} 모델 정보 저장 실패:`, e);
      return undefined;
    }
  };

  /**
   * 중복된 모델 처리 로직 (세그멘테이션, 디텍션)
   */
  const processModel = useCallback(
    async (
      modelType: 'segmentation' | 'detection',
      serverModelInfo: ModelInfo,
    ) => {
      const modelUrl = serverModelInfo.url;
      const currentInfo = modelInfo[modelType];
      const upToDate = isModelUpToDate(currentInfo, serverModelInfo);
      const loaded = await isModelAlreadyLoaded(modelType);
      if (!upToDate || !loaded) {
        if (modelUrl) {
          const result = await ModelManager.preloadModel(modelUrl, modelType);
          if (!result) {
            throw new Error(`${modelType} 모델 로드에 실패했습니다.`);
          }
          await saveModelInfo(modelType, serverModelInfo);
        }
      }
    },
    [modelInfo],
  );

  const loadModels = useCallback(async (): Promise<void> => {
    try {
      setStatus('loading');
      setError(null);
      const modelResponse = await fetchLatestModels();
      if (modelResponse.data?.models) {
        const models =
          Platform.OS === 'ios'
            ? modelResponse.data.models.ios
            : modelResponse.data.models.android;
        if (!ModelManager) {
          throw new Error('ModelManager 네이티브 모듈을 찾을 수 없습니다.');
        }
        try {
          await processModel('segmentation', models.segmentation);
          await processModel('detection', models.detection);
          setStatus('success');
        } catch (nativeError) {
          throw new Error(
            `모델 로드 중 오류 발생: ${nativeError instanceof Error ? nativeError.message : String(nativeError)}`,
          );
        }
      } else {
        throw new Error('모델 정보를 찾을 수 없습니다.');
      }
    } catch (e) {
      setStatus('error');
      setError(
        e instanceof Error ? e : new Error('알 수 없는 오류가 발생했습니다.'),
      );
      console.error('모델 로드 실패:', e);
    }
  }, [processModel]);

  // 이벤트 리스너 설정
  useEffect(() => {
    let progressListener: EmitterSubscription | null = null;
    let completionListener: EmitterSubscription | null = null;
    let errorListener: EmitterSubscription | null = null;
    if (modelManagerEmitter) {
      progressListener = modelManagerEmitter.addListener(
        'ModelDownloadProgress',
        (event: { modelType: string; progress: number }) => {
          // 이벤트 처리 로직
        },
      );
      completionListener = modelManagerEmitter.addListener(
        'ModelDownloadComplete',
        (event: { modelType: string; success: boolean }) => {
          // 이벤트 처리 로직
        },
      );
      errorListener = modelManagerEmitter.addListener(
        'ModelDownloadError',
        (event: { modelType: string; error: string }) => {
          console.error(
            `모델 다운로드 오류 (${event.modelType}): ${event.error}`,
          );
        },
      );
    }
    return () => {
      progressListener?.remove();
      completionListener?.remove();
      errorListener?.remove();
    };
  }, []);

  // 저장된 모델 정보 로드
  useEffect(() => {
    loadStoredModelInfo();
  }, []);

  // 자동 로드가 활성화된 경우 컴포넌트 마운트 시 모델 로드
  useEffect(() => {
    if (autoLoad) {
      loadModels();
    }
  }, [autoLoad, loadModels]);

  return {
    status,
    isLoaded: status === 'success',
    error,
    reload: loadModels,
    modelInfo,
  };
};

export default useModelLoader;
