import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  NativeModules,
  StatusBar,
  ViewStyle,
  Text,
  Dimensions,
  TouchableOpacity,
  findNodeHandle,
  NativeSyntheticEvent,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '~/shared/types/navigation';
import { colors, typography } from '~/shared/styles/design';
import { TabBarHeader } from '~/shared/ui/TabBar';
import FocusBracket from '~/shared/assets/icons/focus_bracket.svg';
import ArIcon from '~/shared/assets/icons/ic_ar.svg';
import { scale, vs } from '~/shared/lib/responsive';
import { NailSet } from '~/pages/ar_experience';
import { CameraView } from '~/shared/ui/CameraView';

const { CameraViewManager, ModelManager } = NativeModules;

// CameraViewManager 타입 정의
interface CameraViewManagerType {
  setNailSet: (nodeId: number, nailSet: NailSet) => void;
  capturePhoto: (nodeId: number) => Promise<void>;
  clearOverlay: (nodeId: number) => void;
}

// 타입 캐스팅
const EnhancedCameraViewManager = CameraViewManager as CameraViewManagerType;

/**
 * AR 카메라 화면 컴포넌트
 *
 * AR 기능을 사용하여 네일 아트를 체험할 수 있는 카메라 화면입니다.
 */
function ARCameraPage({
  navigation,
}: {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ARCameraPage'>;
}) {
  // 라우트 파라미터에서 네일셋 데이터 가져오기
  const route = useRoute<RouteProp<RootStackParamList, 'ARCameraPage'>>();
  const { nailSet } = route.params;
  const cameraRef = useRef(null);

  // 상태 관리
  const [processing, setProcessing] = useState(false);
  const [showingResult, setShowingResult] = useState(false);
  const [nailSetLoaded, setNailSetLoaded] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  // 화면 크기 가져오기
  const { width, height } = Dimensions.get('window');
  const [frameLayout, setFrameLayout] = useState({
    top: height * 0.2,
    bottom: height * 0.2,
    left: width * 0.15,
    right: width * 0.15,
  });

  // AR 화면 진입 시 세그멘테이션 모델 초기화
  useEffect(() => {
    const initializeModel = async () => {
      try {
        // 세그멘테이션 모델 초기화
        await ModelManager.initModel('segmentation');
        console.log('세그멘테이션 모델 초기화 성공');
      } catch (error) {
        console.error('세그멘테이션 모델 초기화 실패:', error);
        setModelError(
          '모델 초기화에 실패했습니다. 필요한 모델이 다운로드되어 있는지 확인해주세요.',
        );
      }
    };

    initializeModel();
  }, []);

  // 네일셋 데이터를 네이티브 모듈에 전달
  useEffect(() => {
    const applyNailSet = async () => {
      try {
        // 노드 ID 가져오기
        const nodeId = findNodeHandle(cameraRef.current);
        if (!nodeId) {
          console.error('카메라 뷰 참조를 찾을 수 없습니다.');
          return;
        }

        // 네이티브 모듈에 네일셋 데이터 전달
        EnhancedCameraViewManager.setNailSet(nodeId, nailSet);

        setTimeout(() => {
          setNailSetLoaded(true);
        }, 3000);
      } catch (error) {
        setNailSetLoaded(false);
      }
    };

    // 컴포넌트 마운트 시 약간 지연시켜 네일 세트 적용
    setTimeout(applyNailSet, 500);

    return () => {
      console.log('카메라 화면 언마운트');
    };
  }, [nailSet]);

  // 캡처 핸들러
  const handleCapture = async () => {
    if (processing || showingResult || !nailSetLoaded) return;

    try {
      setProcessing(true);
      const nodeId = findNodeHandle(cameraRef.current);
      if (nodeId) {
        // CameraViewManager를 통해 오버레이 초기화
        EnhancedCameraViewManager.clearOverlay(nodeId);
        // CameraViewManager를 통해 캡처 수행
        await EnhancedCameraViewManager.capturePhoto(nodeId);
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
      // CameraViewManager를 통해 오버레이 초기화
      EnhancedCameraViewManager.clearOverlay(nodeId);
      setShowingResult(false);
    }
  };

  // 컴포넌트 마운트 시 레이아웃 계산
  useEffect(() => {
    // 화면 크기에 맞게 프레임 위치 계산
    const frameTop = Math.max(100, height * 0.1); // 위쪽 여백
    const frameBottom = Math.max(100, height * 0.15); // 아래쪽 여백
    const frameSide = Math.max(60, width * 0.1); // 양 옆 여백

    setFrameLayout({
      top: frameTop,
      bottom: frameBottom,
      left: frameSide,
      right: frameSide,
    });
  }, [width, height]);

  // 브래킷 위치 스타일 객체 생성
  const topLeftStyle = { top: frameLayout.top, left: frameLayout.left };
  const topRightStyle = { top: frameLayout.top, right: frameLayout.right };
  const bottomLeftStyle = {
    bottom: frameLayout.bottom,
    left: frameLayout.left,
  };
  const bottomRightStyle = {
    bottom: frameLayout.bottom,
    right: frameLayout.right,
  };
  const guideTextBottomStyle = { bottom: 80 };

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
          {modelError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{modelError}</Text>
            </View>
          )}

          {/* 초점 프레임 - 네 모서리에 브래킷 배치 */}
          <View style={styles.focusFrameContainer}>
            {/* 좌상단 */}
            <View style={[styles.bracketContainer, topLeftStyle]}>
              <FocusBracket width={24} height={24} />
            </View>

            {/* 우상단 */}
            <View style={[styles.bracketContainer, topRightStyle]}>
              <FocusBracket
                width={24}
                height={24}
                style={styles.bracketRotate90}
              />
            </View>

            {/* 좌하단 */}
            <View style={[styles.bracketContainer, bottomLeftStyle]}>
              <FocusBracket
                width={24}
                height={24}
                style={styles.bracketRotateNeg90}
              />
            </View>

            {/* 우하단 */}
            <View style={[styles.bracketContainer, bottomRightStyle]}>
              <FocusBracket
                width={24}
                height={24}
                style={styles.bracketRotate180}
              />
            </View>

            {/* 안내 텍스트 */}
            <View style={[styles.guideTextContainer, guideTextBottomStyle]}>
              <Text style={styles.guideText}>
                손이 프레임 안에 모두 보이도록 해주세요
              </Text>
            </View>
          </View>

          {/* 버튼 컨테이너 */}
          <View style={styles.buttonContainer}>
            {!showingResult ? (
              <TouchableOpacity
                style={[
                  styles.button,
                  (processing || !nailSetLoaded) && styles.disabledButton,
                ]}
                onPress={handleCapture}
                disabled={processing || !nailSetLoaded}
              >
                <View style={styles.buttonIconContainer}>
                  <ArIcon
                    width={scale(26)}
                    height={scale(26)}
                    color={colors.white}
                  />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={handleClearOverlay}
              >
                <View style={styles.resetButtonContent}>
                  <ArIcon
                    width={scale(26)}
                    height={scale(26)}
                    color={colors.white}
                  />
                  <Text style={styles.buttonText}>다시찍기</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bracketContainer: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    position: 'absolute',
    width: 48,
  },
  bracketRotate180: {
    transform: [{ rotate: '180deg' }],
  },
  bracketRotate90: {
    transform: [{ rotate: '90deg' }],
  },
  bracketRotateNeg90: {
    transform: [{ rotate: '-90deg' }],
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.gray750,
    borderRadius: 26,
    elevation: 5,
    height: 52,
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: 52,
  },
  buttonContainer: {
    bottom: 30,
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 999,
  },
  buttonIconContainer: {
    alignItems: 'center',
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  buttonText: {
    ...typography.body2_SB,
    color: colors.white,
  },
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
  disabledButton: {
    backgroundColor: colors.gray300,
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: colors.warn_red,
    borderRadius: 10,
    left: 0,
    padding: 10,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  errorText: {
    ...typography.body1_B,
    color: colors.white,
  },
  focusFrameContainer: {
    bottom: 0,
    left: 0,
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  guideText: {
    ...typography.body1_B,
    borderRadius: scale(25),
    color: colors.white,
    overflow: 'hidden',
    paddingHorizontal: scale(20),
    paddingVertical: vs(10),
    textAlign: 'center',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  guideTextContainer: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  resetButton: {
    borderRadius: 21,
    height: 42,
    width: 134,
  },
  resetButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: scale(6),
    paddingHorizontal: scale(16),
  },
  safeArea: {
    backgroundColor: colors.black,
    flex: 1,
  },
});

export default ARCameraPage;
