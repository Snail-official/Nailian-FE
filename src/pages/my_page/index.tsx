import React, { useCallback } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList } from '~/shared/types/navigation';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '~/shared/styles/design';
import { vs } from '~/shared/lib/responsive';
import { fetchUserProfile, fetchPersonalNail } from '~/entities/user/api';
import { TabBarFooter } from '~/shared/ui/TabBar';
import {
  ProfileSection,
  PersonalNailBox,
  BookmarkContainer,
  MenuList,
} from './ui';

interface MyPageProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MyPage'>;
}

/**
 * 마이페이지 화면
 */
function MyPageScreen({ navigation }: MyPageProps) {
  // 데이터 페칭
  const { data: userProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });

  // 퍼스널 네일 결과 조회
  const { data: personalNailResult, error: personalNailError } = useQuery({
    queryKey: ['personalNail'],
    queryFn: fetchPersonalNail,
    retry: false,
  });

  // 에러 발생 시 콘솔에 출력
  React.useEffect(() => {
    if (personalNailError) {
      console.error('퍼스널 네일 에러 상세:', personalNailError);
    }
  }, [personalNailError]);

  const nickname = userProfile?.data?.nickname || '네일조아';

  /**
   * 화면에 포커스 될 때마다 데이터 다시 로드
   * 네일 보관함에서 항목 삭제 후 돌아올 때 갱신하기 위함
   */
  useFocusEffect(
    useCallback(() => {
      refetchProfile();
    }, [refetchProfile]),
  );

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
            <ProfileSection nickname={nickname} />

            {/* 구분선 */}
            <View style={styles.divider} />

            {/* 퍼스널 네일 측정 박스 */}
            <PersonalNailBox
              nickname={nickname}
              personalNailResult={personalNailResult}
              navigation={navigation}
            />

            {/* 네일 보관함 */}
            <BookmarkContainer navigation={navigation} />

            {/* 메뉴 리스트 */}
            <MenuList navigation={navigation} />
          </ScrollView>
        </View>
        <View style={styles.tabBarContainer}>
          <TabBarFooter activeTab="my_page" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: vs(74),
  },
  tabBarContainer: {
    borderTopColor: colors.gray100,
    borderTopWidth: 1,
  },
});

export default MyPageScreen;
