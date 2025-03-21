import React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  requireNativeComponent,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/shared/types/navigation';
import { colors } from '~/shared/styles/design';
import { TabBarHeader } from '~/shared/ui/TabBar';

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
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.container}>
        {/* 상단 탭바 헤더 */}
        <TabBarHeader
          title="AR체험"
          onBack={() => navigation.goBack()}
          rightContent={null}
        />

        {/* 카메라 뷰 */}
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  camera: {
    height: '100%',
    width: '100%',
  },
  cameraContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
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
