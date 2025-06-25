import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { RootStackParamList } from '~/shared/types/navigation';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import ArrowRightIcon from '~/shared/assets/icons/ic_arrow_right.svg';
import UnsubscribeIcon from '~/shared/assets/icons/ic_unsubscribe.svg';
import { useModalStore } from '~/shared/ui/Modal';
import { logoutFromService, deleteUser } from '~/entities/user/api';
import { useAuthStore } from '~/shared/store/authStore';
import { toast } from '~/shared/lib/toast';

interface MenuListProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MyPage'>;
}

/**
 * 메뉴 리스트 컴포넌트
 */
export function MenuList({ navigation }: MenuListProps) {
  const queryClient = useQueryClient();
  const { showModal } = useModalStore();

  const menuItems = [
    { id: '1:1 문의', title: '1:1 문의' },
    { id: 'FAQ', title: 'FAQ' },
    { id: '약관 및 정책', title: '약관 및 정책' },
  ];

  // 메뉴 항목 클릭 핸들러
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

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      await logoutFromService();
      // 로컬에 저장된 인증 토큰 제거
      await useAuthStore.getState().clearTokens();
      // React Query 캐시 초기화
      queryClient.clear();
      navigation.replace('SocialLogin');
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
  };

  // 회원 탈퇴 처리 함수
  const handleUnsubscribe = async () => {
    try {
      await deleteUser();
      // 로컬에 저장된 인증 토큰 제거
      await useAuthStore.getState().clearTokens();
      queryClient.clear();
      navigation.replace('SocialLogin');
    } catch (err) {
      toast.showToast('회원 탈퇴에 실패했습니다', { position: 'bottom' });
    }
  };

  // 로그아웃 모달 표시 함수
  const handleLogoutButtonPress = () => {
    showModal('CONFIRM', {
      title: '로그아웃하시겠어요?',
      description: ' ',
      confirmText: '로그아웃',
      cancelText: '돌아가기',
      onConfirm: handleLogout,
      onCancel: () => {},
    });
  };

  // 회원 탈퇴 모달 표시 함수
  const handleUnsubscribeButtonPress = () => {
    showModal('CONFIRM', {
      title: '정말 탈퇴하시겠어요?',
      description: '소중한 정보가 모두 사라져요',
      confirmText: '탈퇴하기',
      cancelText: '돌아가기',
      onConfirm: handleUnsubscribe,
      onCancel: () => {},
    });
  };

  return (
    <View style={styles.menuList}>
      {/* 일반 메뉴 항목들 */}
      {menuItems.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.menuItem}
          onPress={() => handleMenuPress(item.id)}
          activeOpacity={1}
        >
          <Text style={styles.menuText}>{item.title}</Text>
          <ArrowRightIcon
            width={scale(24)}
            height={scale(24)}
            color={colors.gray400}
          />
        </TouchableOpacity>
      ))}

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
  );
}

const styles = StyleSheet.create({
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
