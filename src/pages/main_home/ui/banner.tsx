import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { colors } from '~/shared/styles/design';
import { fetchHomeBanners } from '~/entities/banner/api';
import { BannerResponse } from '~/shared/api/types';

const BANNER_WIDTH = 331;
const BANNER_SPACING = 8;

interface BannerProps {
  /**
   * 배너 클릭 시 호출될 콜백 함수
   * @param banner 클릭된 배너 객체
   */
  onBannerPress?: (banner: {
    id: number;
    imageUrl: string;
    link: string;
  }) => void;
}

/**
 * 배너 슬라이더 컴포넌트
 *
 * 메인 화면에 표시되는 배너 슬라이더입니다. 여러 배너 이미지를
 * 가로 스와이프할 수 있으며, 현재 위치를 표시하는 인디케이터가 있습니다.
 * 배너 데이터는 컴포넌트 내부에서 API를 호출하여 가져옵니다.
 *
 * @example
 * // 기본 사용법
 * <Banner onBannerPress={(banner) => console.log('배너 클릭:', banner.id)} />
 *
 * // 배너 클릭 시 네비게이션
 * <Banner onBannerPress={(banner) => navigation.navigate('BannerDetail', { link: banner.link })} />
 */
export function Banner({ onBannerPress }: BannerProps) {
  const [banners, setBanners] = useState<BannerResponse['data']>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // 배너 데이터 가져오기
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

  // 스크롤 이벤트 처리
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (BANNER_WIDTH + BANNER_SPACING));
    setCurrentBannerIndex(index);
  };

  // 배너 클릭 핸들러
  const handleBannerPress = (banner: {
    id: number;
    imageUrl: string;
    link: string;
  }) => {
    if (onBannerPress) {
      onBannerPress(banner);
    }
  };

  return (
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
});

export default Banner;
