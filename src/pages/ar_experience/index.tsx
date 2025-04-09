import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  Dimensions,
  BackHandler,
  Platform,
  SafeAreaView,
} from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import BottomSheet, {
  BottomSheetRefProps,
} from '~/pages/ar_experience/ui/BottomSheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import NailOverlay from '~/pages/ar_experience/ui/NailOverlay';
import { TabBarHeader } from '~/shared/ui/TabBar';
import ArButton from '~/features/nail-set-ar/ui/ArButton';
import BookmarkIcon from '~/shared/assets/icons/ic_group.svg';
import { useNavigation } from '@react-navigation/native';
import { scale, vs } from '~/shared/lib/responsive';
import { createUserNailSet } from '~/entities/nail-set/api';
import { toast } from '~/shared/lib/toast';
import { CreateNailSetRequest, Shape, APIError } from '~/shared/api/types';
import { RootStackParamList } from '~/shared/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import NailSelection from './ui/NailSelection';

// 화면 크기 가져오기
const { height } = Dimensions.get('window');

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
 * AR 체험 페이지
 *
 * 사용자가 다양한 네일 디자인을 선택하고 AR을 통해 자신의 손에 적용해볼 수 있는 화면입니다.
 *
 * 주요 기능:
 * - 손가락별 네일 디자인 선택 (엄지, 검지, 중지, 약지, 소지)
 * - 바텀시트를 통한 네일 디자인 브라우징 및 선택
 * - AR 버튼을 통한 선택한 네일 디자인의 실시간 적용
 * - 네일셋 북마크 기능
 *
 * @returns {JSX.Element} AR 체험 페이지 컴포넌트
 */
export default function ARExperiencePage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // 바텀시트 참조 생성
  const bottomSheetRef = useRef<BottomSheetRefProps>(null);
  // 현재 바텀시트 인덱스 상태 (0: 25%, 1: 93%)
  const [bottomSheetIndex, setBottomSheetIndex] = useState(0);

  // 현재 선택된 네일셋 상태 (API 타입에 맞게 관리)
  const [currentNailSet, setCurrentNailSet] = useState<NailSet>({});

  /**
   * 네일셋이 완전한지 확인하는 함수 (모든 손가락에 네일이 선택되었는지)
   */
  const isNailSetComplete = useCallback(
    () => FINGER_TYPES.every(finger => currentNailSet[finger as keyof NailSet]),
    [currentNailSet],
  );

  /**
   * AR 버튼 클릭 핸들러
   */
  const handleArButtonPress = useCallback(() => {
    if (!isNailSetComplete()) {
      toast.showToast('모든 손가락에 네일팁을 선택해주세요', {
        position: 'bottom',
      });
    } else {
      // 모든 손가락에 네일팁이 선택된 경우, 추가 로직 실행
      navigation.navigate('ARCameraPage');
    }
  }, [isNailSetComplete, navigation]);

  /**
   * 북마크 버튼 클릭 핸들러
   */
  const handleBookmark = useCallback(async () => {
    if (!isNailSetComplete()) {
      toast.showToast('아트가 완성되어야 저장 가능합니다', {
        position: 'bottom',
      });
      return;
    }

    // API 요청 형식으로 변환
    const requestData: CreateNailSetRequest = {
      thumb: { id: currentNailSet.thumb!.id },
      index: { id: currentNailSet.index!.id },
      middle: { id: currentNailSet.middle!.id },
      ring: { id: currentNailSet.ring!.id },
      pinky: { id: currentNailSet.pinky!.id },
    };

    try {
      // 네일셋 저장 API 호출
      await createUserNailSet(requestData);

      // 성공 시 메시지 표시
      toast.showToast('보관함에 저장되었습니다', { position: 'bottom' });
    } catch (error) {
      if (error instanceof APIError && error.code === 409) {
        toast.showToast('이미 저장된 아트입니다', { position: 'bottom' });
      } else {
        toast.showToast('저장에 실패했습니다', {
          position: 'bottom',
        });
      }
    }
  }, [currentNailSet, isNailSetComplete]);

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
   * 바텀시트가 확장된 상태에서는 먼저 바텀시트를 축소하고,
   * 바텀시트가 이미 축소된 상태에서는 일반적인 뒤로가기 동작을 수행합니다.
   */
  useEffect(() => {
    // Android에서만 적용
    if (Platform.OS !== 'android') return;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (bottomSheetIndex !== 0) {
          bottomSheetRef.current?.snapToIndex(0);
          return true; // 이벤트 처리 완료
        }
        return false; // 기본 뒤로가기 동작 수행 (뒤로 가기)
      },
    );

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => backHandler.remove();
  }, [bottomSheetIndex]);

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
          <TabBarHeader
            title=""
            onBack={handleGoBack}
            rightContent={
              <TouchableOpacity
                onPress={handleBookmark}
                style={styles.bookmarkContainer}
              >
                <BookmarkIcon
                  width={scale(19)}
                  height={scale(19)}
                  color={colors.gray600}
                />
              </TouchableOpacity>
            }
          />

          {/* 메인 콘텐츠 영역 */}
          <View style={styles.contentArea}>
            {/* 상단 타이틀 */}
            <View style={styles.titleContainer}>
              <Text style={styles.mainTitle}>
                먼저, 나만의 아트를 만들어보세요
              </Text>
              <Text style={styles.subTitle}>
                원하는 시안들을 골라 조합할 수 있어요
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
            snapPoints={['20%', '93%']}
            initialIndex={0}
            handleType="custom"
            customHandle={renderCustomHandle}
            enablePanDownToClose={false}
            enableContentPanningGesture={true}
            enableHandlePanningGesture={true}
            enableOverDrag={false}
            maxDynamicContentSize={Math.min(780, height * 0.8)}
            backgroundStyle={styles.bottomSheetBackground}
            contentContainerStyle={styles.contentContainer}
            enableBackdrop={true}
            backdropPressBehavior="collapse"
            onChange={handleSheetChange}
          >
            <NailSelection
              currentNailSet={currentNailSet}
              onNailSetChange={nailSet => setCurrentNailSet(nailSet)}
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
  bookmarkContainer: {
    alignItems: 'center',
    height: scale(24),
    justifyContent: 'center',
    width: scale(24),
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
    backgroundColor: colors.gray400,
    borderRadius: 100,
    height: vs(5),
    width: scale(60),
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
