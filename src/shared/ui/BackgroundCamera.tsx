import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, ViewStyle, Text } from 'react-native';
import { colors } from '~/shared/styles/design';
import { CameraView } from './CameraView';

interface BackgroundCameraProps {
  style?: ViewStyle;
}

/**
 * 배경용 카메라 컴포넌트
 * AR 카메라를 배경으로 사용할 때 사용하는 컴포넌트입니다.
 */
function BackgroundCamera({ style }: BackgroundCameraProps) {
  const cameraRef = useRef(null);
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 약간의 지연 후 카메라 활성화
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {isReady && !hasError ? (
        <CameraView
          ref={cameraRef}
          style={styles.cameraView}
          onCaptureComplete={event =>
            console.log('배경 카메라 - 캡처 완료:', event.nativeEvent)
          }
          onError={event => {
            console.error('배경 카메라 - 오류 발생:', event.nativeEvent);
            setHasError(true);
          }}
        />
      ) : hasError ? (
        <View style={styles.errorView}>
          <Text style={styles.errorText}>카메라를 불러올 수 없습니다</Text>
        </View>
      ) : (
        <View style={styles.loadingView}>
          <Text style={styles.loadingText}>카메라 로딩 중...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cameraView: {
    height: '100%',
    width: '100%',
  },
  container: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  errorText: {
    color: colors.warn_red,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorView: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.gray600,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingView: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default BackgroundCamera;
