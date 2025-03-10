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
import { scale, vs } from '~/shared/lib/responsive';
import { fetchUserProfile, logoutFromService } from '~/entities/user/api';
import { fetchUserNailSets } from '~/entities/nail-set/api';
import { TabBarFooter } from '~/shared/ui/TabBar';
import Modal from '~/shared/ui/Modal';
import ArrowRightIcon from '~/shared/assets/icons/ic_arrow_right.svg';
import UnsubscribeIcon from '~/shared/assets/icons/ic_unsubscribe.svg';
import { useAuthStore } from '~/shared/store/authStore';

const BookmarkBar = require('~/shared/assets/images/bookmark_bar.png');
const ProfileImage = require('~/shared/assets/images/img_profile.png');

interface MyPageProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MyPage'>;
}

/**
 * 마이페이지 화면 컴포넌트
 *
 * 사용자의 프로필 정보와 네일 보관함, 앱 설정 및 계정 관리 기능을 제공하는 화면입니다.
 * 주요 기능:
 * - 사용자 닉네임 및 프로필 표시
 * - 네일 보관함 접근 및 보관된 네일 세트 수 표시
 * - 1:1 문의, FAQ, 약관 및 정책 등의 메뉴
 * - 로그아웃 및 회원 탈퇴 기능
 *
 * @param {MyPageProps} props 마이페이지 컴포넌트 props
 * @param {NativeStackNavigationProp} props.navigation 네비게이션 객체
 */
function MyPageScreen({ navigation }: MyPageProps) {
  const [nickname, setNickname] = useState<string>('');
  const [bookmarkCount, setBookmarkCount] = useState<number>(0);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [showUnsubscribeModal, setShowUnsubscribeModal] =
    useState<boolean>(false);

  /**
   * 사용자 프로필 데이터 및 네일셋 정보 로드
   *
   * 컴포넌트 마운트 시 실행되며, 사용자 프로필 정보와
   * 보관함에 저장된 네일셋 개수를 가져옵니다.
   */
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

  /**
   * 로그아웃 모달 표시 함수
   *
   * 로그아웃 버튼 클릭 시 확인 모달을 표시합니다.
   */
  const handleLogoutButtonPress = () => {
    setShowLogoutModal(true);
  };

  /**
   * 로그아웃 취소 함수
   *
   * 로그아웃 모달에서 취소 버튼 클릭 시 모달을 닫습니다.
   */
  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  /**
   * 로그아웃 처리 함수
   *
   * 로그아웃 API를 호출하고 로컬 토큰을 제거한 후
   * 로그인 화면으로 이동합니다.
   */
  const handleLogout = async () => {
    try {
      await logoutFromService();
      // 로컬에 저장된 인증 토큰 제거
      await useAuthStore.getState().clearTokens();
      setShowLogoutModal(false);
      navigation.replace('SocialLogin');
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
  };

  /**
   * 네일 보관함 페이지 이동 함수
   *
   * 네일 보관함 카드 클릭 시 저장된 네일셋 목록 페이지로 이동합니다.
   */
  const handleNailBookmarkPress = () => {
    navigation.navigate('NailSetListPage', {
      styleId: 0, // 0은 북마크 모드를 의미합니다
      styleName: '네일 보관함',
    });
  };

  /**
   * 메뉴 항목 클릭 핸들러
   *
   * 각 메뉴 항목(1:1 문의, FAQ, 약관 및 정책 등) 클릭 시
   * 해당 페이지로 이동하는 함수입니다.
   *
   * @param {string} menuType 선택된 메뉴 유형
   */
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

  /**
   * 탭 변경 핸들러
   *
   * 하단 탭바에서 탭 선택 시 해당 화면으로 이동하는 함수입니다.
   *
   * @param {'home' | 'ar_experience' | 'my_page'} tab 선택된 탭
   */
  const handleTabPress = (tab: 'home' | 'ar_experience' | 'my_page') => {
    if (tab === 'my_page') return; // 이미 마이 페이지이므로 아무 작업도 하지 않음

    if (tab === 'home') {
      navigation.navigate('MainHome');
    } else {
      // AR 체험 페이지로 이동 (구현 필요)
      console.log('AR 체험 페이지로 이동');
    }
  };

  /**
   * 회원 탈퇴 모달 표시 함수
   *
   * 탈퇴하기 버튼 클릭 시 확인 모달을 표시합니다.
   */
  const handleUnsubscribeButtonPress = () => {
    setShowUnsubscribeModal(true);
  };

  /**
   * 회원 탈퇴 취소 함수
   *
   * 회원 탈퇴 모달에서 취소 버튼 클릭 시 모달을 닫습니다.
   */
  const handleUnsubscribeCancel = () => {
    setShowUnsubscribeModal(false);
  };

  /**
   * 회원 탈퇴 처리 함수
   *
   * 회원 탈퇴 요청을 처리하는 함수입니다.
   * 현재는 실제 API 연동 없이 콘솔 로그만 출력합니다.
   */
  const handleUnsubscribe = () => {
    // 실제 탈퇴 API가 없으므로 콘솔 로그만 출력
    console.log('회원 탈퇴 처리');
    setShowUnsubscribeModal(false);
  };

  return (
    <>
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
                  <Text style={styles.bookmarkTitle}>네일 보관함</Text>
                  <View style={styles.bookmarkCountContainer}>
                    <Text style={styles.bookmarkCount}>
                      {bookmarkCount > 10000000000000000000
                        ? '10000000000000000000000000...'
                        : bookmarkCount}
                    </Text>
                    <ArrowRightIcon
                      width={scale(24)}
                      height={scale(24)}
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
                  <ArrowRightIcon
                    width={scale(24)}
                    height={scale(24)}
                    color={colors.gray400}
                  />
                </TouchableOpacity>

                {/* FAQ */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress('FAQ')}
                >
                  <Text style={styles.menuText}>FAQ</Text>
                  <ArrowRightIcon
                    width={scale(24)}
                    height={scale(24)}
                    color={colors.gray400}
                  />
                </TouchableOpacity>

                {/* 약관 및 정책 */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress('약관 및 정책')}
                >
                  <Text style={styles.menuText}>약관 및 정책</Text>
                  <ArrowRightIcon
                    width={scale(24)}
                    height={scale(24)}
                    color={colors.gray400}
                  />
                </TouchableOpacity>

                {/* 로그아웃 */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleLogoutButtonPress}
                >
                  <Text style={styles.menuText}>로그아웃</Text>
                  <ArrowRightIcon
                    width={scale(24)}
                    height={scale(24)}
                    color={colors.gray400}
                  />
                </TouchableOpacity>

                {/* 탈퇴하기 */}
                <View style={styles.unsubscribeContainer}>
                  <TouchableOpacity
                    style={styles.unsubscribeButton}
                    onPress={handleUnsubscribeButtonPress}
                  >
                    <Text style={styles.unsubscribeText}>탈퇴하기</Text>
                    <UnsubscribeIcon
                      width={scale(16)}
                      height={scale(16)}
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

      {/* 로그아웃 모달 */}
      {showLogoutModal && (
        <Modal
          title="로그아웃하시겠어요?"
          description=" "
          confirmText="로그아웃"
          cancelText="돌아가기"
          onConfirm={handleLogout}
          onCancel={handleLogoutCancel}
        />
      )}

      {/* 탈퇴 모달 */}
      {showUnsubscribeModal && (
        <Modal
          title="정말 탈퇴하시겠어요?"
          description="소중한 정보가 모두 사라져요"
          confirmText="탈퇴하기"
          cancelText="돌아가기"
          onConfirm={handleUnsubscribe}
          onCancel={handleUnsubscribeCancel}
        />
      )}
    </>
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
    borderRadius: scale(12),
    height: vs(72),
    marginHorizontal: scale(20),
    marginTop: vs(22),
    overflow: 'hidden',
    position: 'relative',
  },
  bookmarkContent: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    paddingLeft: scale(18),
    paddingRight: scale(8),
    position: 'relative',
    zIndex: 2,
  },
  bookmarkCount: {
    ...typography.body2_SB,
    color: colors.white,
    textAlign: 'right',
  },
  bookmarkCountContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  bookmarkTitle: {
    ...typography.body1_B,
    color: colors.white,
    marginRight: scale(8),
    width: scale(80),
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
    position: 'relative',
  },
  divider: {
    backgroundColor: colors.gray50,
    height: vs(8),
    marginTop: vs(12),
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
    paddingLeft: scale(22),
    paddingRight: scale(20),
    paddingVertical: scale(18),
  },
  menuList: {
    marginTop: vs(24),
  },
  menuText: {
    ...typography.body5_M,
    color: colors.gray600,
    textAlign: 'center',
  },
  nickname: {
    ...typography.title1_SB,
    color: colors.gray850,
    textAlign: 'center',
  },
  profileImage: {
    height: scale(54),
    width: scale(54),
  },
  profileImageContainer: {
    alignItems: 'center',
    borderRadius: scale(27),
    height: scale(54),
    justifyContent: 'center',
    marginRight: scale(14),
    overflow: 'hidden',
    width: scale(54),
  },
  profileSection: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: vs(22),
    paddingHorizontal: scale(18),
  },
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: vs(74), // 탭바 높이만큼 패딩 추가
  },
  tabBarContainer: {
    borderTopColor: colors.gray100,
    borderTopWidth: 1,
  },
  unsubscribeButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: scale(3),
    justifyContent: 'flex-end',
    paddingBottom: vs(14),
    paddingLeft: 0,
    paddingRight: scale(2),
    paddingTop: vs(13),
  },
  unsubscribeContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: scale(20),
    marginTop: vs(10),
  },
  unsubscribeText: {
    ...typography.body5_M,
    color: colors.gray400,
    textAlign: 'center',
  },
});

export default MyPageScreen;
