import React, { useRef } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '~/shared/types/navigation';
import { colors } from '~/shared/styles/design';
import { TabBarHeader } from '~/shared/ui/TabBar';
import { CameraView } from '~/shared/ui/CameraView';

// UI 컴포넌트 import

// 커스텀 훅 import
import { useFrameLayout, useCameraCapture } from '~/features/ar-camera';
import { useModelInitialization } from '~/features/model-management';
import { FocusFrame, CameraButton, ErrorMessage } from './ui';

// AR 카메라 화면 컴포넌트
function ARCameraPage({
  navigation,
}: {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ARCameraPage'>;
}) {
  // 라우트 파라미터에서 네일셋 데이터 가져오기
  const route = useRoute<RouteProp<RootStackParamList, 'ARCameraPage'>>();
  const { nailSet } = route.params;
  const cameraRef = useRef(null);

  // 모델 초기화 훅
  const { modelError } = useModelInitialization('segmentation');

  // 프레임 레이아웃 훅
  const frameLayout = useFrameLayout();

  // 카메라 캡처 훅 사용
  const {
    nailSetLoaded,
    showingResult,
    processing,
    handleCapture,
    handleClearOverlay,
  } = useCameraCapture(cameraRef, nailSet);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent={true} />
      <View style={styles.container}>
        {/* 상단 탭바 헤더 */}
        <TabBarHeader
          title="AR체험"
          onBack={() => navigation.goBack()}
          rightContent={null}
        />

        {/* 카메라 뷰 */}
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.cameraView}
            onCaptureComplete={event =>
              console.log('캡처 완료:', event.nativeEvent)
            }
            onError={event => console.error('오류 발생:', event.nativeEvent)}
          />

          {/* 모델 로드 오류 메시지 */}
          <ErrorMessage message={modelError} />

          {/* 초점 프레임 */}
          <FocusFrame frameLayout={frameLayout} />

          {/* 카메라 버튼 */}
          <CameraButton
            showingResult={showingResult}
            processing={processing}
            nailSetLoaded={nailSetLoaded}
            onCapture={handleCapture}
            onClearOverlay={handleClearOverlay}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  cameraView: {
    height: '100%',
    width: '100%',
  },
  container: {
    backgroundColor: colors.black,
    flex: 1,
  },
  safeArea: {
    backgroundColor: colors.black,
    flex: 1,
  },
});

export default ARCameraPage;
