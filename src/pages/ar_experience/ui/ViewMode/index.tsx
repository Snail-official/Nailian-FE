import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  BackHandler,
  Platform,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import BottomSheet, {
  BottomSheetRefProps,
} from '~/pages/ar_experience/ui/BottomSheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import NailOverlay from '~/pages/ar_experience/ui/NailOverlay';
import { TabBarHeader } from '~/shared/ui/TabBar';
import ArButton from '~/features/nail-set-ar/ui/ArButton';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Shape } from '~/shared/api/types';
import { RootStackParamList } from '~/shared/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { INailSet } from '~/shared/types/nail-set';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import NailSelection from '../NailSelection';

// 손가락 타입 정의
export type FingerType = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';

// 손가락 타입 상수
export const FINGER_TYPES = [
  'thumb',
  'index',
  'middle',
  'ring',
  'pinky',
] as const;

/**
 * 네일 세트 인터페이스 (API 요청 형식에 맞춤)
 */
export interface NailSet {
  thumb?: { id: number; imageUrl: string; shape?: Shape };
  index?: { id: number; imageUrl: string; shape?: Shape };
  middle?: { id: number; imageUrl: string; shape?: Shape };
  ring?: { id: number; imageUrl: string; shape?: Shape };
  pinky?: { id: number; imageUrl: string; shape?: Shape };
}

/**
 * AR 뷰 페이지
 *
 * 네일 세트 상세 페이지에서 전달받은 네일 세트를 AR로 보여주는 화면입니다.
 * 사용자는 네일 세트를 수정할 수 없고 볼 수만 있습니다.
 *
 * @returns {JSX.Element} AR 뷰 페이지 컴포넌트
 */
export default function ARViewPage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ARViewPage'>>();

  // 바텀시트 참조 생성
  const bottomSheetRef = useRef<BottomSheetRefProps>(null);
  // 현재 바텀시트 인덱스 상태
  const [bottomSheetIndex, setBottomSheetIndex] = useState(0);

  // INailSet을 NailSet으로 변환
  const convertToNailSet = (nailSet: INailSet): NailSet => ({
    thumb: nailSet.thumb
      ? {
          id: -1, // INail에는 id가 없으므로 -1로 설정
          imageUrl: nailSet.thumb.imageUrl,
          shape: nailSet.thumb.shape || 'ROUND', // 기본값 설정
        }
      : undefined,
    index: nailSet.index
      ? {
          id: -1,
          imageUrl: nailSet.index.imageUrl,
          shape: nailSet.index.shape || 'ROUND', // 기본값 설정
        }
      : undefined,
    middle: nailSet.middle
      ? {
          id: -1,
          imageUrl: nailSet.middle.imageUrl,
          shape: nailSet.middle.shape || 'ROUND', // 기본값 설정
        }
      : undefined,
    ring: nailSet.ring
      ? {
          id: -1,
          imageUrl: nailSet.ring.imageUrl,
          shape: nailSet.ring.shape || 'ROUND', // 기본값 설정
        }
      : undefined,
    pinky: nailSet.pinky
      ? {
          id: -1,
          imageUrl: nailSet.pinky.imageUrl,
          shape: nailSet.pinky.shape || 'ROUND', // 기본값 설정
        }
      : undefined,
  });

  // route.params에서 전달받은 네일 세트를 NailSet 타입으로 변환
  const [currentNailSet] = useState<NailSet>(
    convertToNailSet(route.params.nailSet),
  );

  /**
   * AR 버튼 클릭 핸들러
   * 선택된 네일 세트를 AR 카메라 페이지로 전달합니다.
   */
  const handleArButtonPress = useCallback(() => {
    navigation.navigate('ARCameraPage', { nailSet: currentNailSet });
  }, [navigation, currentNailSet]);

  /**
   * 뒤로가기 버튼 핸들러
   * 사용자가 뒤로가기 버튼을 클릭했을 때 이전 화면으로 돌아갑니다.
   */
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  /**
   * 바텀시트 인덱스 변경 핸들러
   * 바텀시트의 위치가 변경되었을 때 호출됩니다.
   *
   * @param {number} index - 변경된 바텀시트 인덱스
   */
  const handleSheetChange = useCallback((index: number) => {
    setBottomSheetIndex(index);
  }, []);

  /**
   * Android 뒤로가기 버튼 제어
   * Android에서 물리적 뒤로가기 버튼을 눌렀을 때의 동작을 처리합니다.
   */
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (bottomSheetIndex !== 0) {
          bottomSheetRef.current?.snapToIndex(0);
          return true; // 이벤트 처리 완료
        }
        return false; // 기본 뒤로가기 동작 수행
      },
    );

    return () => backHandler.remove();
  }, [bottomSheetIndex]); // 의존성 배열에 bottomSheetIndex 포함

  // 바텀시트 커스텀 핸들 컴포넌트
  const renderCustomHandle = (
    <View style={styles.header}>
      <View style={styles.indicator} />
    </View>
  );

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" />

          {/* 상단 탭바 */}
          <TabBarHeader title="" onBack={handleGoBack} rightContent={null} />

          {/* 메인 콘텐츠 영역 */}
          <View style={styles.contentArea}>
            {/* 상단 타이틀 */}
            <View style={styles.titleContainer}>
              <Text style={styles.mainTitle}>네일 아트를 확인해보세요</Text>
              <Text style={styles.subTitle}>
                AR로 실제 손에 적용해볼 수 있어요
              </Text>
            </View>

            {/* 손 이미지와 네일 오버레이 컨테이너 */}
            <View style={styles.handContainer}>
              {/* 기본 손 이미지 */}
              <Image
                source={require('~/shared/assets/images/hand.png')}
                style={styles.handImage}
                resizeMode="contain"
              />

              {/* 네일 오버레이 - 선택된 네일팁을 손 위에 표시 */}
              <NailOverlay nailSet={currentNailSet} />
            </View>

            {/* AR 버튼 */}
            <View style={styles.arButtonContainer}>
              <ArButton onPress={handleArButtonPress} />
            </View>
          </View>

          {/* 바텀시트 */}
          <BottomSheet
            ref={bottomSheetRef}
            snapPoints={['20%']}
            initialIndex={0}
            handleType="custom"
            customHandle={renderCustomHandle}
            onChange={handleSheetChange}
            backgroundStyle={styles.bottomSheetBackground}
            contentContainerStyle={styles.contentContainer}
            enablePanDownToClose={false}
            enableContentPanningGesture={false}
            enableHandlePanningGesture={false}
          >
            <NailSelection
              currentNailSet={currentNailSet}
              onNailSetChange={() => {}}
              readOnly={true}
            />
          </BottomSheet>
        </View>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  arButtonContainer: {
    alignItems: 'center',
    marginTop: vs(18),
  },
  bottomSheetBackground: {
    backgroundColor: colors.white,
    borderColor: colors.black,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 30,
    // iOS의 안전 영역 고려
    paddingBottom: Platform.OS === 'ios' ? vs(34) : 0,
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  contentArea: {
    backgroundColor: colors.white,
    flex: 1,
    paddingTop: vs(8),
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: vs(10),
  },
  handContainer: {
    alignItems: 'center',
    height: vs(370),
    marginTop: vs(24),
    position: 'relative',
  },
  handImage: {
    height: vs(370),
    width: scale(237),
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderLeftColor: colors.gray100,
    borderLeftWidth: 1,
    borderRightColor: colors.gray100,
    borderRightWidth: 1,
    borderTopColor: colors.gray100,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
    elevation: 0,
    paddingVertical: vs(15),
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  indicator: {
    backgroundColor: colors.gray200,
    borderRadius: 100,
    height: vs(4),
    width: scale(44),
  },
  mainTitle: {
    ...typography.head2_B,
    color: colors.gray850,
  },
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
  },
  subTitle: {
    ...typography.body4_M,
    color: colors.gray500,
    marginTop: vs(4),
  },
  titleContainer: {
    marginLeft: scale(22),
  },
});
