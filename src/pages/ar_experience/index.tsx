import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import BottomSheet from '~/pages/ar_experience/ui/BottomSheet';
import NailGrid from '~/pages/ar_experience/ui/NailGrid';
import { TabBarHeader } from '~/shared/ui/TabBar';
import ArButton from '~/features/nail-set-ar/ui/ArButton';
import BookmarkIcon from '~/shared/assets/icons/ic_group.svg';
import { useNavigation } from '@react-navigation/native';
/**
 * AR 체험 페이지
 * @returns {JSX.Element} AR 체험 페이지 컴포넌트
 */
export default function ARExperiencePage() {
  const navigation = useNavigation();

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

  // 바텀시트 커스텀 핸들 컴포넌트
  const renderCustomHandle = (
    <View style={styles.header}>
      <View style={styles.indicator} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 상단 탭바 */}
      <TabBarHeader
        title=""
        onBack={handleGoBack}
        rightContent={
          <TouchableOpacity onPress={handleBookmark}>
            <BookmarkIcon width={24} height={24} color={colors.gray600} />
          </TouchableOpacity>
        }
      />

      {/* 메인 콘텐츠 영역 */}
      <View style={styles.contentArea}>
        {/* 상단 타이틀 */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>먼저, 나만의 아트를 만들어보세요</Text>
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
        snapPoints={['30%', '94%']}
        initialIndex={0}
        handleType="custom"
        customHandle={renderCustomHandle}
        enablePanDownToClose={false}
        enableContentPanningGesture={true}
        enableHandlePanningGesture={true}
        enableOverDrag={false}
        maxDynamicContentSize={700}
        backgroundStyle={styles.bottomSheetBackground}
        contentContainerStyle={styles.contentContainer}
        enableBackdrop={true}
        backdropPressBehavior="collapse"
      >
        <NailGrid onSelectNail={handleNailSelect} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  arButtonContainer: {
    alignItems: 'center',
    marginTop: 18,
  },
  bottomSheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  contentArea: {
    flex: 1,
    paddingTop: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handImage: {
    alignSelf: 'center',
    height: 370,
    marginTop: 24,
    width: 237,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 15,
  },
  indicator: {
    backgroundColor: colors.gray200,
    borderRadius: 100,
    height: 4,
    width: 44,
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
    marginLeft: 22,
  },
});
