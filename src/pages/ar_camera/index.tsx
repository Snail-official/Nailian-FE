import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  requireNativeComponent,
  StatusBar,
  ViewStyle,
  Text,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/shared/types/navigation';
import { colors, typography } from '~/shared/styles/design';
import { TabBarHeader } from '~/shared/ui/TabBar';
import FocusBracket from '~/shared/assets/icons/focus_bracket.svg';
import { scale, vs } from '~/shared/lib/responsive';

interface CameraViewProps {
  style?: ViewStyle;
}

const CameraView = requireNativeComponent<CameraViewProps>('CameraView');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ARCameraPage'>;
};

/**
 * AR 카메라 화면 컴포넌트
 *
 * AR 기능을 사용하여 네일 아트를 체험할 수 있는 카메라 화면입니다.
 *
 * @param {Props} props AR 카메라 컴포넌트 props
 * @param {NativeStackNavigationProp} props.navigation 네비게이션 객체
 */
function ARCameraPage({ navigation }: Props) {
  // 화면 크기 가져오기
  const { width, height } = Dimensions.get('window');
  const [frameLayout, setFrameLayout] = useState({
    top: height * 0.2,
    bottom: height * 0.2,
    left: width * 0.15,
    right: width * 0.15,
  });

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
          <CameraView style={styles.cameraView} />

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
  safeArea: {
    backgroundColor: colors.black,
    flex: 1,
  },
});

export default ARCameraPage;
