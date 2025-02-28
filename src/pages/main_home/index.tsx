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
import Logo from '~/shared/assets/icons/logo.svg';
import { TabBarFooter } from '~/shared/ui/TabBar';
import Banner from './ui/banner';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = 331;
const LEFT_MARGIN = (width - BANNER_WIDTH) / 2;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainHome'>;
};

function MainHomeScreen({ navigation }: Props) {
  const [nickname, setNickname] = useState<string>('');

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

  // 배너 클릭 핸들러
  const handleBannerPress = (banner: {
    id: number;
    imageUrl: string;
    link: string;
  }) => {
    console.log('배너 클릭:', banner.id);
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

          {/* 여기에 추가 콘텐츠가 들어갈 수 있음 */}
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
    backgroundColor: colors.gray50,
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
