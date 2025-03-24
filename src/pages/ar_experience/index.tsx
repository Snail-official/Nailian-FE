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
import NailSelection from '~/pages/ar_experience/ui/NailSelection';
import NailOverlay from '~/pages/ar_experience/ui/NailOverlay';
import { TabBarHeader } from '~/shared/ui/TabBar';
import ArButton from '~/features/nail-set-ar/ui/ArButton';
import BookmarkIcon from '~/shared/assets/icons/ic_group.svg';
import { useNavigation } from '@react-navigation/native';
import { scale, vs } from '~/shared/lib/responsive';
import { INail, INailSet } from '~/shared/types/nail-set';

// 화면 크기 가져오기
const { height } = Dimensions.get('window');

/**
 * AR 체험 페이지
 * @returns {JSX.Element} AR 체험 페이지 컴포넌트
 */
export default function ARExperiencePage() {
  const navigation = useNavigation();
  // 바텀시트 참조 생성
  const bottomSheetRef = useRef<BottomSheetRefProps>(null);
  // 현재 바텀시트 인덱스 상태 (0: 25%, 1: 93%)
  const [bottomSheetIndex, setBottomSheetIndex] = useState(0);

  // 현재 선택된 네일셋 상태
  const [currentNailSet, setCurrentNailSet] = useState<Partial<INailSet>>({});

  // 네일 선택 핸들러
  const handleNailSelect = useCallback((id: string) => {
    console.log('선택한 네일 ID:', id);
    // 여기에 네일 선택 시 필요한 로직 추가
  }, []);

  // 네일셋 변경 핸들러 - NailGrid 컴포넌트에서 호출됨
  const handleNailSetChange = useCallback((nailSet: Partial<INailSet>) => {
    setCurrentNailSet(nailSet);
  }, []);

  // 북마크 핸들러
  const handleBookmark = useCallback(() => {
    console.log('북마크 버튼이 클릭되었습니다.');
  }, []);

  // AR 버튼 핸들러
  const handleArButtonPress = useCallback(() => {
    console.log('AR 버튼이 클릭되었습니다.');
    // 모든 손가락에 네일팁이 선택되었는지 확인
    const fingerTypes: Array<keyof Omit<INailSet, 'id'>> = [
      'thumb',
      'index',
      'middle',
      'ring',
      'pinky',
    ];
    const allFingersSelected = fingerTypes.every(
      finger =>
        currentNailSet[finger] &&
        typeof currentNailSet[finger] === 'object' &&
        (currentNailSet[finger] as INail).imageUrl,
    );

    if (!allFingersSelected) {
      // 모든 손가락에 네일팁이 선택되지 않은 경우, 사용자에게 알림
      console.log('모든 손가락에 네일팁을 선택해주세요.');
      // 실제 구현에서는 토스트 메시지나 모달 등으로 사용자에게 안내
    } else {
      // 모든 손가락에 네일팁이 선택된 경우, 추가 로직 실행
      console.log('AR 체험을 시작합니다!');
    }
  }, [currentNailSet]);

  // 뒤로가기 핸들러
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // 바텀시트 인덱스 변경 핸들러
  const handleSheetChange = useCallback((index: number) => {
    setBottomSheetIndex(index);
  }, []);

  // 뒤로가기 버튼 핸들러 (Android)
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
              <TouchableOpacity onPress={handleBookmark}>
                <BookmarkIcon
                  width={scale(24)}
                  height={scale(24)}
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
            maxDynamicContentSize={Math.min(780, height * 0.9)}
            backgroundStyle={styles.bottomSheetBackground}
            contentContainerStyle={styles.contentContainer}
            enableBackdrop={true}
            backdropPressBehavior="collapse"
            onChange={handleSheetChange}
          >
            <NailSelection
              onSelectNail={handleNailSelect}
              onNailSetChange={handleNailSetChange}
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
    backgroundColor: colors.gray50,
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
  },
  titleContainer: {
    marginLeft: scale(22),
  },
});
