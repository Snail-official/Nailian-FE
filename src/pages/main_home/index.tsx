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
import { fetchUserProfile } from '~/entities/user/api';
import { fetchRecommendedNailSets } from '~/entities/nail-set/api';
import Logo from '~/shared/assets/icons/logo.svg';
import { TabBarFooter } from '~/shared/ui/TabBar';
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
    // 필요시 navigation.navigate 등 추가
  };

  // 네일 세트 클릭 핸들러
  const handleNailSetPress = (nailSet: NailSet) => {
    console.log('네일 세트 클릭:', nailSet.id);
    // 필요시 navigation.navigate 등 추가
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
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
            onNailSetPress={handleNailSetPress}
          />
        </ScrollView>
      </SafeAreaView>

      {/* TabBar를 화면 맨 아래에 고정 */}
      <TabBarFooter
        activeTab="home"
        onTabPress={tab => {
          console.log(`${tab} 탭 클릭됨`);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    marginTop: 14,
    width: '100%',
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
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  scrollView: {
    flex: 1,
  },
});

export default MainHomeScreen;
