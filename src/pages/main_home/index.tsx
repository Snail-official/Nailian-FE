import React, { useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  Text,
  Dimensions,
  Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList } from '~/shared/types/navigation';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import { fetchUserProfile } from '~/entities/user/api';
import { fetchRecommendedNailSets } from '~/entities/nail-set/api';
import Logo from '~/shared/assets/icons/logo.svg';
import { TabBarFooter } from '~/shared/ui/TabBar';
import { toast } from '~/shared/lib/toast';
import Banner from './ui/banner';
import RecommendedNailSets from './ui/recommended-nail-sets';
import { NailSet, StyleInfo, Banner as BannerType } from './types';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = scale(331);
const LEFT_MARGIN = (width - BANNER_WIDTH) / 2;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainHome'>;
};

/**
 * 메인 홈 화면 컴포넌트
 *
 * 앱의 메인 화면으로 사용자 맞춤형 네일 세트 추천, 배너 등을 보여줍니다.
 * 주요 기능:
 * - 배너 광고 표시
 * - 사용자별 추천 네일 세트 표시
 * - 스타일별 네일 세트 그룹화
 * - 네일 세트 상세 페이지 연결
 *
 * @param {Props} props 메인 홈 컴포넌트 props
 * @param {NativeStackNavigationProp} props.navigation 네비게이션 객체
 */
function MainHomeScreen({ navigation }: Props) {
  const scrollViewRef = useRef<ScrollView>(null);

  // React Query를 사용한 데이터 페칭
  const { data: userProfile, error: userProfileError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });

  const { data: styleGroups = [], error: styleGroupsError } = useQuery({
    queryKey: ['recommendedNailSets'],
    queryFn: async () => {
      const response = await fetchRecommendedNailSets();
      return response.data || [];
    },
  });

  const nickname = userProfile?.data?.nickname || '';

  /**
   * 배너 클릭 핸들러
   *
   * 배너 이미지 클릭 시 해당 링크로 이동하는 함수입니다.
   *
   * @param {BannerType} banner 배너 정보
   */
  const handleBannerPress = useCallback(async (banner: BannerType) => {
    // URL이 유효한지 확인
    if (!banner.link) {
      toast.showToast('유효하지 않은 링크입니다', { position: 'bottom' });
      return;
    }

    // 링크 형식 확인 및 처리
    const url = banner.link.startsWith('http')
      ? banner.link
      : `https://${banner.link}`;

    // URL을 열 수 있는지 확인 후 기본 브라우저로 열기
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.error('URL을 열 수 없습니다:', url);
        toast.showToast('브라우저를 열 수 없습니다', { position: 'bottom' });
      }
    } catch (error) {
      console.error('링크 열기 오류:', error);
      toast.showToast('링크를 여는 중 오류가 발생했습니다', {
        position: 'bottom',
      });
    }
  }, []);

  /**
   * 스타일 클릭 핸들러
   *
   * 스타일 헤더 클릭 시 해당 스타일의 네일 세트 목록 페이지로 이동하는 함수입니다.
   *
   * @param {number} styleId 스타일 ID
   * @param {string} styleName 스타일 이름
   */
  const handleStylePress = useCallback(
    (styleId: number, styleName: string) => {
      // 스타일 정보 설정 및 네일 세트 리스트 페이지로 이동
      navigation.navigate('NailSetListPage', {
        styleId,
        styleName: `${styleName}네일`,
      });
    },
    [navigation],
  );

  /**
   * 네일 세트 클릭 핸들러
   *
   * 네일 세트 클릭 시 해당 네일 세트의 상세 페이지로 이동하는 함수입니다.
   *
   * @param {NailSet} nailSet 선택된 네일 세트
   * @param {StyleInfo} styleInfo 스타일 정보
   */
  const handleNailSetPress = useCallback(
    (nailSet: NailSet, styleInfo: StyleInfo) => {
      // styleId가 유효한 값인지 확인 (0이 아닌 양수)
      const validStyleId =
        typeof styleInfo.id === 'number' && styleInfo.id > 0 ? styleInfo.id : 1; // 기본값으로 1 설정 (0은 북마크 모드를 의미하므로 피함)

      // 네일 세트 상세 페이지로 이동
      navigation.navigate('NailSetDetailPage', {
        nailSetId: nailSet.id,
        styleId: validStyleId,
        styleName: `${styleInfo.name}네일` || '추천 네일',
        isBookmarked: false, // 북마크 상태는 상세 페이지에서 관리
      });
    },
    [navigation],
  );

  if (userProfileError || styleGroupsError) {
    throw new Error('데이터를 불러오는데 실패했습니다');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <View style={styles.container}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            removeClippedSubviews={false}
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEventThrottle={16}
            overScrollMode="never"
            contentInsetAdjustmentBehavior="never"
          >
            {/* 상단 영역 - 로고 */}
            <View style={styles.topSection}>
              <View style={styles.logoContainer}>
                <Logo width={scale(78)} height={vs(25)} />
              </View>
            </View>

            {/* 본문 영역 */}
            <View style={styles.contentSection}>
              {/* 배너 */}
              <Banner onBannerPress={handleBannerPress} />

              {/* 추천 아트 타이틀 */}
              <View style={styles.recommendationContainer}>
                <Text style={styles.recommendationText}>
                  <Text style={styles.nicknameText}>{nickname}</Text>
                  <Text>님을 위한{'\n'}아트를 추천드려요</Text>
                </Text>
              </View>

              {/* 추천 네일 세트 목록 */}
              <RecommendedNailSets
                leftMargin={LEFT_MARGIN}
                styleGroups={styleGroups}
                onStylePress={handleStylePress}
                onNailSetPress={handleNailSetPress}
              />
            </View>

            {/* 푸터 영역 */}
            <View style={styles.footerSection}>
              <View style={styles.footer}>
                <View>
                  <Text style={styles.footerText}>버전 1.0.0</Text>
                  <Text style={styles.footerText}>
                    문의 메일 : snail.official.kr@gmail.com
                  </Text>
                  <View style={styles.footerNotice}>
                    <Text style={styles.footerText}>유의사항</Text>
                    <Text style={styles.footerText}>
                      • 위 아트 이미지는 모두 AI로 생성되었습니다.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        <View style={styles.tabBarContainer}>
          <TabBarFooter activeTab="home" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  contentSection: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    backgroundColor: colors.gray50,
    flexDirection: 'row',
    marginTop: vs(20),
    paddingBottom: vs(20),
    paddingLeft: scale(26),
    paddingRight: scale(167),
    paddingTop: vs(25),
    width: '100%',
  },
  footerNotice: {
    marginTop: vs(8),
  },
  footerSection: {
    marginBottom: vs(10),
    width: '100%',
  },
  footerText: {
    ...typography.caption_M,
    color: colors.gray400,
    letterSpacing: -0.1,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(15),
    marginTop: vs(14),
    width: '100%',
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  nicknameText: {
    color: colors.purple500, // #CD19FF
  },
  recommendationContainer: {
    marginTop: vs(28),
    paddingHorizontal: LEFT_MARGIN,
  },
  recommendationText: {
    ...typography.head2_B,
    color: colors.gray850, // #131313
    lineHeight: vs(30),
  },
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 0,
    paddingBottom: vs(54),
  },
  scrollView: {
    flex: 1,
  },
  tabBarContainer: {
    borderTopColor: colors.gray100,
    borderTopWidth: 1,
  },
  topSection: {
    backgroundColor: colors.white,
    minHeight: vs(40),
    width: '100%',
    zIndex: 10,
  },
});

export default MainHomeScreen;
