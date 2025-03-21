import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  Text,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/shared/types/navigation';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import { fetchUserProfile } from '~/entities/user/api';
import { fetchRecommendedNailSets } from '~/entities/nail-set/api';
import Logo from '~/shared/assets/icons/logo.svg';
import { TabBarFooter } from '~/shared/ui/TabBar';
import Banner from './ui/banner';
import RecommendedNailSets from './ui/recommended-nail-sets';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = scale(331);
const LEFT_MARGIN = (width - BANNER_WIDTH) / 2;

// 네일 세트 인터페이스 정의
interface NailSet {
  id: number;
  thumb: { imageUrl: string };
  index: { imageUrl: string };
  middle: { imageUrl: string };
  ring: { imageUrl: string };
  pinky: { imageUrl: string };
}

// 스타일 그룹 인터페이스 정의
interface StyleGroup {
  style: {
    id: number;
    name: string;
  };
  nailSets: NailSet[];
}

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
  const [nickname, setNickname] = useState<string>('');
  const [recommendedNailSets, setRecommendedNailSets] = useState<StyleGroup[]>(
    [],
  );

  /**
   * 탭 선택 핸들러
   *
   * 하단 탭바에서 탭 선택 시 해당 화면으로 이동합니다.
   *
   * @param {'home' | 'ar_experience' | 'my_page'} tab 선택된 탭
   */
  const handleTabPress = (tab: 'home' | 'ar_experience' | 'my_page') => {
    if (tab === 'home') return; // 이미 홈 화면이므로 아무 작업도 하지 않음

    if (tab === 'my_page') {
      navigation.navigate('MyPage');
    } else if (tab === 'ar_experience') {
      // AR 체험 페이지로 이동
      navigation.navigate('ARExperiencePage');
    }
  };

  /**
   * 사용자 프로필 정보 가져오기
   *
   * 컴포넌트 마운트 시 사용자 프로필 정보를 가져와 닉네임을 설정합니다.
   */
  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const response = await fetchUserProfile();
        setNickname(response.data?.nickname || '');
      } catch (err) {
        console.error('사용자 정보 불러오기 실패:', err);
      }
    };

    getUserProfile();
  }, []);

  /**
   * 추천 네일 세트 가져오기
   *
   * 컴포넌트 마운트 시 사용자 맞춤형 추천 네일 세트 목록을 가져옵니다.
   */
  useEffect(() => {
    const getRecommendedNailSets = async () => {
      try {
        const response = await fetchRecommendedNailSets();
        if (response.data) {
          setRecommendedNailSets(response.data);
        }
      } catch (err) {
        console.error('추천 네일 세트 불러오기 실패:', err);
      }
    };

    getRecommendedNailSets();
  }, []);

  /**
   * 배너 클릭 핸들러
   *
   * 배너 이미지 클릭 시 해당 링크로 이동하는 함수입니다.
   *
   * @param {Object} banner 배너 정보
   * @param {number} banner.id 배너 ID
   * @param {string} banner.imageUrl 배너 이미지 URL
   * @param {string} banner.link 배너 링크 URL
   */
  const handleBannerPress = (banner: {
    id: number;
    imageUrl: string;
    link: string;
  }) => {
    console.log('배너 클릭:', banner.id);
    // 필요시 navigation.navigate 등 추가
  };

  /**
   * 스타일 클릭 핸들러
   *
   * 스타일 헤더 클릭 시 해당 스타일의 네일 세트 목록 페이지로 이동하는 함수입니다.
   *
   * @param {number} styleId 스타일 ID
   * @param {string} styleName 스타일 이름
   */
  const handleStylePress = (styleId: number, styleName: string) => {
    console.log('스타일 클릭:', styleName);

    // 스타일 정보 설정 및 네일 세트 리스트 페이지로 이동
    navigation.navigate('NailSetListPage', {
      styleId,
      styleName,
    });
  };

  /**
   * 추천 네일 세트 클릭 핸들러
   *
   * 추천 네일 세트 클릭 시 해당 네일 세트의 상세 페이지로 이동하는 함수입니다.
   *
   * @param {NailSet} nailSet 선택된 네일 세트
   * @param {Object} styleInfo 스타일 정보
   * @param {number} styleInfo.id 스타일 ID
   * @param {string} styleInfo.name 스타일 이름
   */
  const handleRecommendedNailSetPress = (
    nailSet: NailSet,
    styleInfo: { id: number; name: string },
  ) => {
    console.log('추천 네일 세트 클릭:', nailSet.id);

    // 네일 세트 상세 페이지로 이동
    navigation.navigate('NailSetDetailPage', {
      nailSetId: nailSet.id,
      styleId: styleInfo.id,
      styleName: styleInfo.name,
      isBookmarked: false, // 북마크 상태는 상세 페이지에서 관리
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <View style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            removeClippedSubviews={false}
            showsVerticalScrollIndicator={false}
          >
            {/* 로고 */}
            <View style={styles.logoContainer}>
              <Logo width={scale(78)} height={vs(25)} />
            </View>

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
              nailSets={recommendedNailSets}
              onStylePress={handleStylePress}
              onNailSetPress={handleRecommendedNailSetPress}
            />

            {/* 푸터 */}
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
          </ScrollView>
        </View>

        <View style={styles.tabBarContainer}>
          <TabBarFooter activeTab="home" onTabPress={handleTabPress} />
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
  footer: {
    alignItems: 'center',
    backgroundColor: colors.gray50,
    flexDirection: 'row',
    paddingBottom: vs(41),
    paddingLeft: scale(26),
    paddingRight: scale(167),
    paddingTop: vs(25),
    width: '100%',
  },
  footerNotice: {
    marginTop: vs(8),
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
    paddingBottom: vs(74), // 탭바 높이만큼 패딩 추가
  },
  scrollView: {
    flex: 1,
  },
  tabBarContainer: {
    borderTopColor: colors.gray100,
    borderTopWidth: 1,
  },
});

export default MainHomeScreen;
