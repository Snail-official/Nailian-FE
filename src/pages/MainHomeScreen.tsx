import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/shared/types/navigation';
import { colors } from '~/shared/styles/design';
import Logo from '~/shared/assets/icons/logo.svg';
import { fetchHomeBanners } from '~/entities/banner/api';
import { BannerResponse } from '~/shared/api/types';

const BANNER_WIDTH = 331;
const BANNER_SPACING = 8;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainHome'>;
};

function MainHomeScreen({ navigation }: Props) {
  const [banners, setBanners] = useState<BannerResponse['data']>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetchHomeBanners();
        setBanners(response.data || []);
      } catch (err) {
        console.error('배너 데이터 불러오기 실패:', err);
      }
    };

    fetchBanners();
  }, []);

  // 배너 클릭 핸들러
  const handleBannerPress = (banner: {
    id: number;
    imageUrl: string;
    link: string;
  }) => {
    console.log('배너 클릭:', banner.id);
  };

  // 스크롤 이벤트 처리
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (BANNER_WIDTH + BANNER_SPACING));
    setCurrentBannerIndex(index);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        {/* 로고 */}
        <View style={styles.logoContainer}>
          <Logo width={78} height={25} />
        </View>

        {/* 배너 컨테이너 */}
        <View style={styles.bannerWrapper}>
          {/* 배너 */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.bannerContainer}
            pagingEnabled
            snapToInterval={BANNER_WIDTH + BANNER_SPACING}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {banners?.map(banner => (
              <TouchableOpacity
                key={banner.id}
                onPress={() => handleBannerPress(banner)}
                style={styles.bannerItem}
              >
                <Image
                  source={{ uri: banner.imageUrl }}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 페이지 인디케이터 */}
          {banners && banners.length > 1 && (
            <View style={styles.paginationContainer}>
              {banners.map((banner, index) => (
                <View
                  key={banner.id}
                  style={[
                    styles.paginationDot,
                    index === currentBannerIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    height: 158,
    overflow: 'hidden',
    width: BANNER_WIDTH,
  },
  bannerImage: {
    borderRadius: 4,
    flexShrink: 0,
    height: 158,
    width: BANNER_WIDTH,
  },
  bannerItem: {
    flexShrink: 0,
    marginRight: BANNER_SPACING,
  },
  bannerWrapper: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    marginTop: 14,
    width: '100%',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  paginationDot: {
    backgroundColor: colors.gray200,
    borderRadius: 2,
    height: 4,
    marginHorizontal: 3,
    width: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.gray600,
  },
  safeArea: {
    backgroundColor: colors.gray50,
    flex: 1,
  },
});

export default MainHomeScreen;
