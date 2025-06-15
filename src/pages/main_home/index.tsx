import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList } from '~/shared/types/navigation';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import { fetchUserProfile } from '~/entities/user/api';
import { fetchRecommendedNailSets } from '~/entities/nail-set/api';
import Logo from '~/shared/assets/icons/logo.svg';
import { TabBarFooter } from '~/shared/ui/TabBar';
import { useFocusEffect } from '@react-navigation/native';
import Banner from './ui/banner';
import RecommendedNailSets from './ui/recommended-nail-sets';
import Footer from './ui/Footer';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainHome'>;
};

/**
 * 메인 홈 화면
 */
function MainHomeScreen({ navigation }: Props) {
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    data: userProfile,
    error: userProfileError,
    refetch: refetchUserProfile,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });

  const {
    data: styleGroups = [],
    error: styleGroupsError,
    refetch: refetchStyleGroups,
  } = useQuery({
    queryKey: ['recommendedNailSets'],
    queryFn: async () => {
      const response = await fetchRecommendedNailSets();
      return response.data || [];
    },
  });

  const nickname = userProfile?.data?.nickname || '';

  /**
   * 화면에 포커스될 때마다 데이터 다시 로드
   */
  useFocusEffect(
    useCallback(() => {
      refetchUserProfile();
      refetchStyleGroups();
    }, [refetchUserProfile, refetchStyleGroups]),
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
              <Banner />

              {/* 추천 아트 타이틀 */}
              <View style={styles.recommendationContainer}>
                <Text style={styles.recommendationText}>
                  <Text style={styles.nicknameText}>{nickname}</Text>
                  <Text>님을 위한{'\n'}아트를 추천드려요</Text>
                </Text>
              </View>

              {/* 추천 네일 세트 목록 */}
              <RecommendedNailSets
                styleGroups={styleGroups}
                navigation={navigation}
              />
            </View>

            {/* 푸터 영역 */}
            <Footer />
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
    backgroundColor: colors.white,
    flex: 1,
    paddingTop: vs(8),
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
    paddingHorizontal: scale(22),
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
