import React, { useRef } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
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

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <CameraView
        ref={cameraRef}
        style={styles.cameraView}
        onCaptureComplete={event =>
          console.log('배경 카메라 - 캡처 완료:', event.nativeEvent)
        }
        onError={event =>
          console.error('배경 카메라 - 오류 발생:', event.nativeEvent)
        }
      />
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
    zIndex: -1,
  },
});

export default BackgroundCamera;
