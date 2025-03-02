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
import { CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '~/shared/types/navigation';
import { colors, typography } from '~/shared/styles/design';
import { fetchUserProfile } from '~/entities/user/api';
import { fetchRecommendedNailSets } from '~/entities/nail-set/api';
import Logo from '~/shared/assets/icons/logo.svg';
import { TabBarFooter } from '~/shared/ui/TabBar';
import NailSetList from '~/features/nail-set/ui/NailSetList';
import NailSetDetail from '~/features/nail-set/ui/NailSetDetail';
import Toast from '~/shared/ui/Toast';
import Banner from './ui/banner';
import RecommendedNailSets from './ui/recommended-nail-sets';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = 331;
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

function MainHomeScreen({ navigation }: Props) {
  const [nickname, setNickname] = useState<string>('');
  const [recommendedNailSets, setRecommendedNailSets] = useState<StyleGroup[]>(
    [],
  );

  // NailSetList 상태
  const [nailSetListVisible, setNailSetListVisible] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // NailSetDetail 상태
  const [nailSetDetailVisible, setNailSetDetailVisible] = useState(false);
  const [selectedNailSet, setSelectedNailSet] = useState<NailSet | null>(null);
  const [bookmarkedNailSets, setBookmarkedNailSets] = useState<number[]>([]);

  // 토스트 상태
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 탭 변경 핸들러 추가
  const handleTabPress = (tab: 'home' | 'ar_experience' | 'my_page') => {
    if (tab === 'home') return; // 이미 홈 화면이므로 아무 작업도 하지 않음

    if (tab === 'my_page') {
      navigation.navigate('MyPage');
    } else {
      // AR 체험 페이지로 이동 (구현 필요)
      console.log('AR 체험 페이지로 이동');
    }
  };

  // 사용자 정보 가져오기
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

  // 추천 네일 세트 가져오기
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

  // MainHomeScreen에서만 토스트 함수 구현
  const showBookmarkToast = (isAdd: boolean) => {
    setToastMessage(
      isAdd ? '보관함에 저장되었습니다' : '보관함에서 삭제되었습니다',
    );
    setToastVisible(true);

    // 3초 후에 토스트 닫기
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  // 북마크 토글 핸들러
  const handleBookmarkToggle = (nailSetId: number) => {
    const isAlreadyBookmarked = bookmarkedNailSets.includes(nailSetId);

    if (isAlreadyBookmarked) {
      setBookmarkedNailSets(bookmarkedNailSets.filter(id => id !== nailSetId));
    } else {
      setBookmarkedNailSets([...bookmarkedNailSets, nailSetId]);
    }

    showBookmarkToast(!isAlreadyBookmarked);
  };

  // 배너 클릭 핸들러
  const handleBannerPress = (banner: {
    id: number;
    imageUrl: string;
    link: string;
  }) => {
    console.log('배너 클릭:', banner.id);
    // 필요시 navigation.navigate 등 추가
  };

  // 스타일 클릭 핸들러
  const handleStylePress = (style: { id: number; name: string }) => {
    console.log('스타일 클릭:', style.name);
    setSelectedStyle(style);
    setNailSetListVisible(true);
  };

  // 네일 세트 클릭 핸들러 (RecommendedNailSets용)
  const handleRecommendedNailSetPress = (
    nailSet: NailSet,
    style: { id: number; name: string },
  ) => {
    console.log('추천 네일 세트 클릭:', nailSet.id);
    setSelectedNailSet(nailSet);
    setSelectedStyle(style);
    setNailSetDetailVisible(true);
  };

  // 네일 세트 클릭 핸들러 (NailSetList용)
  const handleNailSetPress = (nailSet: NailSet) => {
    console.log('네일 세트 클릭:', nailSet.id);
    setSelectedNailSet(nailSet);
    setNailSetDetailVisible(true);
  };

  // NailSetList 닫기 핸들러
  const handleNailSetListClose = () => {
    setNailSetListVisible(false);
  };

  // NailSetDetail 닫기 핸들러
  const handleNailSetDetailClose = () => {
    setNailSetDetailVisible(false);
  };

  // 네일 세트 변경 핸들러 추가
  const handleNailSetChange = (newNailSetId: number) => {
    // 선택된 네일 세트 목록에서 새로운 ID에 해당하는 네일 세트 찾기
    const allNailSets: NailSet[] = [];

    // 추천 네일 세트 목록에서 검색
    recommendedNailSets.forEach(group => {
      group.nailSets.forEach(nailSet => {
        allNailSets.push(nailSet);
      });
    });

    // NailSetList를 통해 가져온 모든 네일 세트도 검색 대상에 포함
    // 이 부분은 NailSetList 컴포넌트에서 데이터를 가져오는 형태에 맞게 조정 필요
    // 예시 코드이므로 실제 구현에 맞게 수정해야 함

    const newNailSet = allNailSets.find(item => item.id === newNailSetId);

    if (newNailSet) {
      setSelectedNailSet(newNailSet);
    }
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
              <Logo width={78} height={25} />
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

          {/* 네일 세트 목록 오버레이 */}
          {selectedStyle && (
            <NailSetList
              visible={nailSetListVisible}
              style={selectedStyle}
              onNailSetPress={handleNailSetPress}
              onClose={handleNailSetListClose}
            />
          )}

          {/* 네일 세트 상세 오버레이 */}
          {selectedNailSet && selectedStyle && (
            <NailSetDetail
              visible={nailSetDetailVisible}
              nailSetId={selectedNailSet.id}
              style={selectedStyle}
              onClose={handleNailSetDetailClose}
              isBookmarked={bookmarkedNailSets.includes(selectedNailSet.id)}
              onBookmarkPress={handleBookmarkToggle}
              onNailSetChange={handleNailSetChange}
            />
          )}

          {/* 토스트 메시지 */}
          <Toast
            message={toastMessage}
            visible={toastVisible}
            position="bottom"
          />
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
    paddingBottom: 41,
    paddingLeft: 26,
    paddingRight: 167,
    paddingTop: 25,
    width: '100%',
  },
  footerNotice: {
    marginTop: 8,
  },
  footerText: {
    ...typography.caption_M,
    color: colors.gray400,
    letterSpacing: -0.1,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    marginTop: 14,
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
    marginTop: 28,
    paddingHorizontal: LEFT_MARGIN,
  },
  recommendationText: {
    ...typography.head2_B,
    color: colors.gray850, // #131313
    lineHeight: 30,
  },
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 74, // 탭바 높이만큼 패딩 추가
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
