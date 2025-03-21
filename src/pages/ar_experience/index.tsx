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
} from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import BottomSheet, {
  BottomSheetRefProps,
} from '~/pages/ar_experience/ui/BottomSheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import NailSelection from '~/pages/ar_experience/ui/NailSelection';
import { TabBarHeader } from '~/shared/ui/TabBar';
import ArButton from '~/features/nail-set-ar/ui/ArButton';
import BookmarkIcon from '~/shared/assets/icons/ic_group.svg';
import { useNavigation } from '@react-navigation/native';
import { scale, vs } from '~/shared/lib/responsive';

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

  // 네일 선택 핸들러
  const handleNailSelect = useCallback((id: string) => {
    console.log('선택한 네일 ID:', id);
    // 여기에 네일 선택 시 필요한 로직 추가
  }, []);

  // 북마크 핸들러
  const handleBookmark = useCallback(() => {
    console.log('북마크 버튼이 클릭되었습니다.');
  }, []);

  // AR 버튼 핸들러
  const handleArButtonPress = useCallback(() => {
    console.log('AR 버튼이 클릭되었습니다.');
  }, []);

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
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* 상단 탭바 */}
        <TabBarHeader
          title=""
          onBack={handleGoBack}
          rightContent={
            <TouchableOpacity onPress={handleBookmark}>
              <BookmarkIcon
                width={scale(19)}
                height={scale(18.5)}
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

          {/* 손 이미지 */}
          <Image
            source={require('~/shared/assets/images/hand.png')}
            style={styles.handImage}
            resizeMode="contain"
          />

          {/* AR 버튼 */}
          <View style={styles.arButtonContainer}>
            <ArButton onPress={handleArButtonPress} />
          </View>
        </View>

        {/* 바텀시트 */}
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={['25%', '93%']}
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
          <NailSelection onSelectNail={handleNailSelect} />
        </BottomSheet>
      </View>
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
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  contentArea: {
    flex: 1,
    paddingTop: vs(8),
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: vs(10),
  },
  handImage: {
    alignSelf: 'center',
    height: vs(370),
    marginTop: vs(24),
    width: scale(237),
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: vs(15),
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
  subTitle: {
    ...typography.body4_M,
    color: colors.gray500,
  },
  titleContainer: {
    marginLeft: scale(22),
  },
});
