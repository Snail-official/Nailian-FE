import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Linking,
} from 'react-native';
import { colors } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import { toast } from '~/shared/lib/toast';
import { fetchHomeBanners } from '~/entities/banner/api';
import { BannerResponse } from '~/shared/api/types';
import { Banner as BannerType } from '../types';

const BANNER_WIDTH = scale(331);
const BANNER_SPACING = scale(8);

/**
 * 배너 슬라이더 컴포넌트
 */
function Banner() {
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
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(
        contentOffsetX / (BANNER_WIDTH + BANNER_SPACING),
      );
      setCurrentBannerIndex(index);
    },
    [],
  );

  // 배너 클릭 핸들러
  const handleBannerPress = useCallback(async (banner: BannerType) => {
    if (!banner.link) {
      toast.showToast('유효하지 않은 링크입니다', { position: 'bottom' });
      return;
    }

    const url = banner.link.startsWith('http')
      ? banner.link
      : `https://${banner.link}`;

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
            onPress={() => handleBannerPress(banner as BannerType)}
            style={styles.bannerItem}
            activeOpacity={1}
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
    height: vs(158),
    overflow: 'hidden',
    width: BANNER_WIDTH,
  },
  bannerImage: {
    borderRadius: scale(4),
    flexShrink: 0,
    height: vs(158),
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
    marginTop: vs(8),
  },
  paginationDot: {
    backgroundColor: colors.gray200,
    borderRadius: scale(2),
    height: vs(4),
    marginHorizontal: scale(3),
    width: scale(4),
  },
  paginationDotActive: {
    backgroundColor: colors.gray600,
  },
});

export default memo(Banner);
