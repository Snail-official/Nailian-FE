import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RootStackParamList } from '~/shared/types/navigation';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import {
  fetchUserProfile,
  logoutFromService,
  deleteUser,
} from '~/entities/user/api';
import { fetchUserNailSets } from '~/entities/nail-set/api';
import { TabBarFooter } from '~/shared/ui/TabBar';
import Modal from '~/shared/ui/Modal';
import ArrowRightIcon from '~/shared/assets/icons/ic_arrow_right.svg';
import UnsubscribeIcon from '~/shared/assets/icons/ic_unsubscribe.svg';
import { useAuthStore } from '~/shared/store/authStore';
import { toast } from '~/shared/lib/toast';

const BookmarkBar = require('~/shared/assets/images/bookmark_bar.png');
const ProfileImage = require('~/shared/assets/images/img_profile.png');
const EmptyNailImage = require('~/shared/assets/images/img_emptynail.png');

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
  const [currentModal, setCurrentModal] = React.useState<
    'none' | 'logout' | 'unsubscribe'
  >('none');
  const queryClient = useQueryClient();

  // React Query를 사용한 데이터 페칭
  const { data: userProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });

  const { data: nailSets, refetch: refetchNailSets } = useQuery({
    queryKey: ['userNailSets'],
    queryFn: () => fetchUserNailSets({ page: 1, size: 10 }),
  });

  const nickname = userProfile?.data?.nickname || '네일조아';
  const bookmarkCount = nailSets?.data?.pageInfo?.totalElements || 0;

  /**
   * 화면에 포커스 될 때마다 데이터 다시 로드
   * 네일 보관함에서 항목 삭제 후 돌아올 때 갱신하기 위함
   */
  useFocusEffect(
    useCallback(() => {
      refetchProfile();
      refetchNailSets();
    }, [refetchProfile, refetchNailSets]),
  );

  /**
   * 로그아웃 모달 표시 함수
   *
   * 로그아웃 버튼 클릭 시 확인 모달을 표시합니다.
   */
  const handleLogoutButtonPress = () => {
    setCurrentModal('logout');
  };

  /**
   * 모달 닫기 함수
   *
   * 모든 모달을 닫고 상태를 초기화합니다.
   */
  const closeModal = () => {
    setCurrentModal('none');
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
      // React Query 캐시 초기화
      queryClient.clear();
      closeModal();
      navigation.replace('SocialLogin');
    } catch (err) {
      console.error('로그아웃 실패:', err);
      // 에러 발생해도 모달은 닫기
      closeModal();
    }
  };

  /**
   * 네일 보관함 페이지 이동 함수
   *
   * 네일 보관함 카드 클릭 시 저장된 네일셋 목록 페이지로 이동합니다.
   */
  const handleNailBookmarkPress = () => {
    navigation.navigate('NailSetListPage', {
      styleId: -1, // 북마크 모드를 위한 특별한 값 사용
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
  const handleMenuPress = async (menuType: string) => {
    const urls: Record<string, string> = {
      '1:1 문의': 'https://www.notion.so/1-1-1d4a61f4f3718080af26de9177d78887',
      FAQ: 'https://www.notion.so/FAQ-1d4a61f4f3718095891aec01cdbb82d5',
      '약관 및 정책': 'https://www.notion.so/1d4a61f4f37180a89490fd3bde2b3a7b',
    };
    // URL이 있으면 웹페이지로 이동
    if (urls[menuType]) {
      try {
        const url = urls[menuType];
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
    } else {
      toast.showToast('링크 주소가 없습니다', { position: 'bottom' });
    }
  };

  /**
   * 회원 탈퇴 모달 표시 함수
   *
   * 탈퇴하기 버튼 클릭 시 확인 모달을 표시합니다.
   */
  const handleUnsubscribeButtonPress = () => {
    setCurrentModal('unsubscribe');
  };

  /**
   * 회원 탈퇴 처리 함수
   *
   * 회원 탈퇴 API를 호출하고 성공 시 로그인 화면으로 이동합니다.
   */
  const handleUnsubscribe = async () => {
    try {
      await deleteUser();
      // 로컬에 저장된 인증 토큰 제거
      await useAuthStore.getState().clearTokens();
      // React Query 캐시 초기화
      queryClient.clear();
      closeModal();
      navigation.replace('SocialLogin');
    } catch (err) {
      toast.showToast('회원 탈퇴에 실패했습니다', { position: 'bottom' });
      // 에러 발생해도 모달은 닫기
      closeModal();
    }
  };

  // 모달 렌더링 함수
  const renderModal = () => {
    switch (currentModal) {
      case 'logout':
        return (
          <Modal
            title="로그아웃하시겠어요?"
            description=" "
            confirmText="로그아웃"
            cancelText="돌아가기"
            onConfirm={handleLogout}
            onCancel={closeModal}
          />
        );
      case 'unsubscribe':
        return (
          <Modal
            title="정말 탈퇴하시겠어요?"
            description="소중한 정보가 모두 사라져요"
            confirmText="탈퇴하기"
            cancelText="돌아가기"
            onConfirm={handleUnsubscribe}
            onCancel={closeModal}
          />
        );
      default:
        return null;
    }
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
                <Text style={styles.nickname}>{nickname}</Text>
              </View>

              {/* 구분선 */}
              <View style={styles.divider} />

              {/* 퍼스널 네일 측정 박스 */}
              <View style={styles.personalNailBox}>
                <View style={styles.personalNailContent}>
                  <View style={styles.personalNailRow}>
                    <Text style={styles.personalNailTitle}>
                      네일리안님의{'\n'}퍼스널네일을 측정해보세요
                    </Text>
                    <Image
                      source={EmptyNailImage}
                      style={styles.emptyNailImage}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.measureButton}
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation.navigate('PersonalNailFunnelPage', { step: 1 })
                    }
                  >
                    <Text style={styles.measureButtonText}>측정하기</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 네일 보관함 */}
              <TouchableOpacity
                style={styles.bookmarkContainer}
                onPress={handleNailBookmarkPress}
                activeOpacity={1}
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
                  activeOpacity={1}
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
                  activeOpacity={1}
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
                  activeOpacity={1}
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
                  activeOpacity={1}
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
                    activeOpacity={1}
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
            <TabBarFooter activeTab="my_page" />
          </View>
        </View>
      </SafeAreaView>

      {/* 모달 렌더링 */}
      {renderModal()}
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
  emptyNailImage: {
    height: scale(64),
    marginLeft: scale(54),
    width: scale(64),
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  measureButton: {
    backgroundColor: colors.gray900,
    borderRadius: 8,
    paddingHorizontal: scale(30),
    paddingVertical: scale(10),
  },
  measureButtonText: {
    ...typography.body2_SB,
    color: colors.white,
    textAlign: 'center',
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
    ...typography.body1_B,
    color: colors.gray850,
    textAlign: 'center',
  },
  personalNailBox: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    elevation: 5,
    justifyContent: 'center',
    marginBottom: vs(24),
    marginHorizontal: scale(20),
    marginTop: vs(24),
    padding: scale(20),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  personalNailContent: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
  },
  personalNailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: scale(16),
    width: '100%',
  },
  personalNailTitle: {
    ...typography.title2_SB,
    color: colors.gray900,
    textAlign: 'left',
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
