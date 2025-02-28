import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '~/shared/styles/design';
import HomeIcon from '~/shared/assets/icons/ic_home.svg';
import BackIcon from '~/shared/assets/icons/ic_arrow_left.svg';
import ArIcon from '~/shared/assets/icons/ic_ar.svg';
import ProfileIcon from '~/shared/assets/icons/ic_my.svg';

type TabType = 'home' | 'ar_experience' | 'my_page';

interface TabBarHeaderProps {
  title: string;
  onBack: () => void;
}

interface TabBarFooterProps {
  activeTab: TabType;
  onTabPress: (tab: TabType) => void;
}

// 탭 데이터 정의
const TAB_DATA = [
  {
    id: 'home',
    label: '홈',
    Icon: HomeIcon,
  },
  {
    id: 'ar_experience',
    label: 'AR 체험',
    Icon: ArIcon,
  },
  {
    id: 'my_page',
    label: '마이',
    Icon: ProfileIcon,
  },
] as const;

/**
 * 탭바 컴포넌트
 *
 * 앱의 상단 헤더와 하단 네비게이션을 구성하는 컴포넌트입니다.
 * 헤더는 뒤로가기와 타이틀을, 푸터는 메인 네비게이션 탭을 제공합니다.
 *
 * @example
 * // 헤더 사용
 * <TabBarHeader
 *   title="웨딩네일"
 *   onBack={() => navigation.goBack()}
 * />
 *
 * // 푸터 사용
 * <TabBarFooter
 *   activeTab="home"
 *   onTabPress={(tab) => handleTabPress(tab)}
 * />
 */

export function TabBarHeader({ title, onBack }: TabBarHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

export function TabBarFooter({ activeTab, onTabPress }: TabBarFooterProps) {
  return (
    <View style={styles.footer}>
      {TAB_DATA.map(({ id, label, Icon }) => (
        <TouchableOpacity
          key={id}
          style={styles.tabItem}
          onPress={() => onTabPress(id as TabType)}
        >
          <Icon
            width={24}
            height={24}
            color={activeTab === id ? colors.gray900 : colors.gray400}
          />
          <Text
            style={[styles.tabLabel, activeTab === id && styles.activeTabLabel]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  activeTabLabel: {
    color: colors.gray900,
  },
  backButton: {
    left: 5,
    padding: 8,
    position: 'absolute',
  },
  footer: {
    backgroundColor: colors.white,
    borderTopColor: colors.gray100,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    height: 74,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
    height: 48,
    justifyContent: 'center',
    width: '100%',
  },
  headerTitle: {
    ...typography.title2_SB,
    color: colors.gray900,
    textAlign: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.small,
    width: 120,
  },
  tabLabel: {
    ...typography.caption_M,
    color: colors.gray400,
    marginTop: 2,
    textAlign: 'center',
  },
});
