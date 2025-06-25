import { useState, useEffect, RefObject } from 'react';
import { NativeModules, findNodeHandle } from 'react-native';
import { NailSet } from '~/features/ar-experience/model/types';
import { CameraViewManagerType } from './types';

// 카메라 캡처 훅
export function useCameraCapture(
  cameraRef: RefObject<React.Component>,
  nailSet: NailSet,
) {
  const { CameraViewManager } = NativeModules;
  const enhancedCameraViewManager = CameraViewManager as CameraViewManagerType;

  const [nailSetLoaded, setNailSetLoaded] = useState(false);
  const [showingResult, setShowingResult] = useState(false);
  const [processing, setProcessing] = useState(false);

  // 네일셋 데이터를 네이티브 모듈에 전달
  useEffect(() => {
    const applyNailSet = async () => {
      try {
        const nodeId = findNodeHandle(cameraRef.current);
        if (!nodeId) {
          console.error('카메라 뷰 참조를 찾을 수 없습니다.');
          return;
        }

        enhancedCameraViewManager.setNailSet(nodeId, nailSet);

        setTimeout(() => {
          setNailSetLoaded(true);
        }, 3000);
      } catch (error) {
        console.error('네일셋 적용 실패:', error);
        setNailSetLoaded(false);
      }
    };

    const timer = setTimeout(applyNailSet, 500);

    return () => {
      clearTimeout(timer);
      console.log('네일셋 적용 정리');
    };
  }, [nailSet, cameraRef, enhancedCameraViewManager]);

  // 캡처 핸들러
  const handleCapture = async () => {
    if (processing || showingResult || !nailSetLoaded) return;

    try {
      setProcessing(true);
      const nodeId = findNodeHandle(cameraRef.current);
      if (nodeId) {
        enhancedCameraViewManager.clearOverlay(nodeId);
        await enhancedCameraViewManager.capturePhoto(nodeId);
        setShowingResult(true);
      }
    } catch (error) {
      console.error('Error during capture and process:', error);
    } finally {
      setProcessing(false);
    }
  };

  // 오버레이 초기화 핸들러
  const handleClearOverlay = () => {
    if (!showingResult) return;

    const nodeId = findNodeHandle(cameraRef.current);
    if (nodeId) {
      enhancedCameraViewManager.clearOverlay(nodeId);
      setShowingResult(false);
    }
  };

  return {
    nailSetLoaded,
    showingResult,
    processing,
    handleCapture,
    handleClearOverlay,
  };
}
