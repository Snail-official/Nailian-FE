import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/shared/types/navigation';
import { colors, typography } from '~/shared/styles/design';
import { fetchUserProfile, logoutFromService } from '~/entities/user/api';
import { fetchUserNailSets } from '~/entities/nail-set/api';
import { TabBarFooter } from '~/shared/ui/TabBar';
import ArrowRightIcon from '~/shared/assets/icons/ic_arrow_right.svg';
import UnsubscribeIcon from '~/shared/assets/icons/ic_unsubscribe.svg';

const BookmarkBar = require('~/shared/assets/images/bookmark_bar.png');
const ProfileImage = require('~/shared/assets/images/img_profile.png');

interface MyPageProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MyPage'>;
}

function MyPageScreen({ navigation }: MyPageProps) {
  const [nickname, setNickname] = useState<string>('');
  const [bookmarkCount, setBookmarkCount] = useState<number>(0);

  // 모든 데이터 호출을 하나의 useEffect로 통합
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 프로필 가져오기
        const profileResponse = await fetchUserProfile();
        if (profileResponse.data?.nickname) {
          setNickname(profileResponse.data.nickname);
        }

        // 네일셋 정보 가져오기
        const setsResponse = await fetchUserNailSets({ page: 1, size: 10 });
        if (setsResponse.data) {
          setBookmarkCount(setsResponse.data.pageInfo.totalElements);
        }
      } catch (err) {
        console.error('데이터 불러오기 실패:', err);
      }
    };

    fetchData();

    // 컴포넌트 언마운트 시 정리 함수 추가
    return () => {
      // 진행 중인 작업 취소 등 필요한 정리 작업 수행
    };
  }, []);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logoutFromService();
      navigation.replace('SocialLogin');
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
  };

  // 네일 보관함 페이지로 이동
  const handleNailBookmarkPress = () => {
    // 구현 필요: 네일 보관함 페이지로 이동
    console.log('네일 보관함 페이지로 이동');
  };

  // 각 메뉴 항목 클릭 핸들러
  const handleMenuPress = (menuType: string) => {
    const urls: Record<string, string> = {
      '1:1 문의': 'https://example.com/inquiry',
      FAQ: 'https://example.com/faq',
      '약관 및 정책': 'https://example.com/terms',
    };
    // URL이 있으면 웹페이지로 이동
    if (urls[menuType]) {
      // 여기에 웹뷰 네비게이션 로직 추가
      console.log(`${menuType} 페이지로 이동: ${urls[menuType]}`);
    } else {
      console.log(`${menuType} 페이지로 이동`);
    }
  };

  // 탭 변경 핸들러
  const handleTabPress = (tab: 'home' | 'ar_experience' | 'my_page') => {
    if (tab === 'my_page') return; // 이미 마이 페이지이므로 아무 작업도 하지 않음

    if (tab === 'home') {
      navigation.navigate('MainHome');
    } else {
      // AR 체험 페이지로 이동 (구현 필요)
      console.log('AR 체험 페이지로 이동');
    }
  };

  // 회원 탈퇴 처리
  const handleUnsubscribe = () => {
    // 구현 필요: 탈퇴하기 모달 창 표시
    console.log('탈퇴하기 모달 표시');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <View style={styles.container}>
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            removeClippedSubviews={false}
            showsVerticalScrollIndicator={false}
          >
            {/* 프로필 섹션 */}
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <Image source={ProfileImage} style={styles.profileImage} />
              </View>
              <Text style={styles.nickname}>{nickname || '네일조아'}</Text>
            </View>

            {/* 구분선 */}
            <View style={styles.divider} />

            {/* 네일 보관함 */}
            <TouchableOpacity
              style={styles.bookmarkContainer}
              onPress={handleNailBookmarkPress}
            >
              <View style={styles.bookmarkContent}>
                <View style={styles.bookmarkTextContainer}>
                  <Text style={styles.bookmarkTitle}>네일 보관함</Text>
                </View>
                <View style={styles.bookmarkCountContainer}>
                  <Text
                    style={styles.bookmarkCount}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {bookmarkCount}
                  </Text>
                  <ArrowRightIcon
                    width={24}
                    height={24}
                    color={colors.gray100}
                  />
                </View>
              </View>
              <Image source={BookmarkBar} style={styles.bookmarkBar} />
            </TouchableOpacity>

            {/* 메뉴 리스트 */}
            <View style={styles.menuList}>
              {/* 1:1 문의 */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuPress('1:1 문의')}
              >
                <Text style={styles.menuText}>1:1 문의</Text>
                <ArrowRightIcon width={24} height={24} color={colors.gray400} />
              </TouchableOpacity>

              {/* FAQ */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuPress('FAQ')}
              >
                <Text style={styles.menuText}>FAQ</Text>
                <ArrowRightIcon width={24} height={24} color={colors.gray400} />
              </TouchableOpacity>

              {/* 약관 및 정책 */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuPress('약관 및 정책')}
              >
                <Text style={styles.menuText}>약관 및 정책</Text>
                <ArrowRightIcon width={24} height={24} color={colors.gray400} />
              </TouchableOpacity>

              {/* 로그아웃 */}
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Text style={styles.menuText}>로그아웃</Text>
                <ArrowRightIcon width={24} height={24} color={colors.gray400} />
              </TouchableOpacity>

              {/* 탈퇴하기 */}
              <View style={styles.unsubscribeContainer}>
                <TouchableOpacity
                  style={styles.unsubscribeButton}
                  onPress={handleUnsubscribe}
                >
                  <Text style={styles.unsubscribeText}>탈퇴하기</Text>
                  <UnsubscribeIcon
                    width={16}
                    height={16}
                    color={colors.gray400}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
        <View style={styles.tabBarContainer}>
          <TabBarFooter activeTab="my_page" onTabPress={handleTabPress} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bookmarkBar: {
    height: '100%',
    left: 0,
    position: 'absolute',
    width: '100%',
    zIndex: 1,
  },
  bookmarkContainer: {
    backgroundColor: colors.purple500,
    borderRadius: 12,
    height: 72,
    marginHorizontal: 20,
    marginTop: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  bookmarkContent: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'space-between',
    paddingLeft: 18,
    paddingRight: 8,
    position: 'relative',
    zIndex: 2,
  },
  bookmarkCount: {
    ...typography.body2_SB,
    color: colors.white,
    flex: 1,
    maxWidth: 120,
    paddingBottom: 2,
    textAlign: 'right',
    textAlignVertical: 'center',
  },
  bookmarkCountContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
  },
  bookmarkTextContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  bookmarkTitle: {
    ...typography.body1_B,
    color: colors.white,
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
    position: 'relative',
  },
  divider: {
    backgroundColor: colors.gray50,
    height: 8,
    marginTop: 12,
    width: '100%',
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  menuItem: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 22,
    paddingRight: 20,
    paddingVertical: 18,
  },
  menuList: {
    marginTop: 24,
  },
  menuText: {
    ...typography.body5_M,
    color: colors.gray600,
    textAlign: 'center',
  },
  nickname: {
    ...typography.body1_B,
    color: colors.gray850,
    marginLeft: 14,
  },
  profileImage: {
    height: 54,
    width: 54,
  },
  profileImageContainer: {
    alignItems: 'center',
    borderRadius: 27,
    height: 54,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 54,
  },
  profileSection: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 22,
    marginTop: 18,
  },
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 74, // 탭바 높이만큼 패딩 추가
  },
  tabBarContainer: {
    borderTopColor: colors.gray100,
    borderTopWidth: 1,
  },
  unsubscribeButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
    justifyContent: 'flex-end',
    paddingBottom: 14,
    paddingLeft: 0,
    paddingRight: 2,
    paddingTop: 13,
  },
  unsubscribeContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: 20,
    marginTop: 10,
  },
  unsubscribeText: {
    ...typography.body5_M,
    color: colors.gray400,
    textAlign: 'center',
  },
});

export default MyPageScreen;
