import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import { RootStackParamList } from '~/shared/types/navigation';
import { toast } from '~/shared/lib/toast';
import BottomSheet from '~/shared/ui/BottomSheet';
import NailOverlay from '~/pages/ar_experience/ui/NailOverlay';
import { TabBarHeader } from '~/shared/ui/TabBar';
import ArButton from '~/pages/ar_experience/ui/ArButton';
import BookmarkIcon from '~/shared/assets/icons/ic_group.svg';
import ApplyModal from '~/pages/ar_experience/ui/ApplyModal';
import ViewshotLightbox from '~/shared/ui/Lightbox';
import {
  useNailSetState,
  useCreateNailSet,
  useApplyEvent,
} from '~/features/ar-experience';
import { useBottomSheetControl } from '~/shared/hooks';
import NailSelection from './ui/NailSelection';

// 화면 크기 가져오기
const { height } = Dimensions.get('window');

// AR 체험 페이지
export default function ARExperiencePage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 네일셋 상태 관리 훅
  const { currentNailSet, setCurrentNailSet, isNailSetComplete } =
    useNailSetState();

  // 바텀시트 제어 훅
  const {
    bottomSheetRef,
    handleSheetChange,
    closeBottomSheet,
    openBottomSheet,
  } = useBottomSheetControl();

  // 이벤트 응모 관련 훅
  const {
    showApplyModal,
    savedNailSetId,
    handleApply,
    handleApplyComplete,
    handleApplyCancel,
  } = useApplyEvent({
    onShowModal: closeBottomSheet,
    onCloseModal: () => openBottomSheet(0),
  });

  // 네일셋 생성 훅
  const { handleCreateNailSet } = useCreateNailSet(
    currentNailSet,
    isNailSetComplete,
    { onSuccess: handleApply },
  );

  // AR 버튼 클릭 핸들러
  const handleArButtonPress = useCallback(() => {
    if (!isNailSetComplete()) {
      toast.showToast('모든 손가락에 네일팁을 선택해주세요', {
        position: 'bottom',
      });
    } else {
      navigation.navigate('ARCameraPage', { nailSet: currentNailSet });
    }
  }, [isNailSetComplete, navigation, currentNailSet]);

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
                onPress={handleCreateNailSet}
                style={styles.bookmarkContainer}
                activeOpacity={1}
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

            {/* 손 이미지와 네일 오버레이 + ViewshotLightbox 통합 */}
            <ViewshotLightbox
              viewShotContent={
                <View style={styles.handContainer}>
                  {/* 기본 손 이미지 */}
                  <Image
                    source={require('~/shared/assets/images/hand.png')}
                    style={styles.handImage}
                    resizeMode="contain"
                  />

                  {/* 네일 오버레이 */}
                  <NailOverlay nailSet={currentNailSet} />
                </View>
              }
            />

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
            maxDynamicContentSize={height * 0.93}
            backgroundStyle={styles.bottomSheetBackground}
            contentContainerStyle={styles.contentContainer}
            enableBackdrop={true}
            backdropPressBehavior="collapse"
            onChange={handleSheetChange}
          >
            <NailSelection
              currentNailSet={currentNailSet}
              onNailSetChange={nailSet => setCurrentNailSet(nailSet)}
              bottomSheetRef={bottomSheetRef}
            />
          </BottomSheet>

          {/* 응모 모달 */}
          <ApplyModal
            visible={showApplyModal}
            onClose={handleApplyCancel}
            nailSetId={savedNailSetId || 0}
            onComplete={handleApplyComplete}
          />
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
