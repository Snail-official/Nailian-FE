import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SvgProps } from 'react-native-svg';
import { colors, typography, spacing } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import HomeIcon from '~/shared/assets/icons/ic_home.svg';
import BackIcon from '~/shared/assets/icons/ic_arrow_left.svg';
import ArIcon from '~/shared/assets/icons/ic_ar.svg';
import ProfileIcon from '~/shared/assets/icons/ic_my.svg';
import type { RootStackParamList } from '~/shared/types/navigation';

type TabType = 'home' | 'ar_experience' | 'my_page';
type TabRoute = 'MainHome' | 'ARExperiencePage' | 'MyPage';

interface TabData {
  id: TabType;
  label: string;
  Icon: React.FC<SvgProps>;
  route: TabRoute;
}

interface TabBarHeaderProps {
  title: string;
  onBack: () => void;
  rightContent?: React.ReactNode;
}

interface TabBarFooterProps {
  activeTab: TabType;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// 탭 데이터 정의
const TAB_DATA: TabData[] = [
  {
    id: 'home',
    label: '홈',
    Icon: HomeIcon,
    route: 'MainHome',
  },
  {
    id: 'ar_experience',
    label: 'AR 체험',
    Icon: ArIcon,
    route: 'ARExperiencePage',
  },
  {
    id: 'my_page',
    label: '마이',
    Icon: ProfileIcon,
    route: 'MyPage',
  },
];

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
 *   rightContent={<BookmarkIcon />} // 선택적인 우측 콘텐츠
 * />
 *
 * // 푸터 사용
 * <TabBarFooter activeTab="home" />
 */
export function TabBarHeader({
  title,
  onBack,
  rightContent,
}: TabBarHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <BackIcon width={scale(48)} height={scale(48)} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{title}</Text>
        {rightContent && (
          <View style={styles.rightContent}>{rightContent}</View>
        )}
      </View>
    </View>
  );
}

export function TabBarFooter({ activeTab }: TabBarFooterProps) {
  const navigation = useNavigation<NavigationProp>();

  const handleTabPress = (tab: TabType) => {
    const tabData = TAB_DATA.find(t => t.id === tab);
    if (tabData && tabData.id !== activeTab) {
      navigation.navigate(tabData.route);
    }
  };

  return (
    <SafeAreaView style={styles.footerContainer}>
      <View style={styles.footer}>
        {TAB_DATA.map(({ id, label, Icon }) => (
          <TouchableOpacity
            key={id}
            style={styles.tabItem}
            onPress={() => handleTabPress(id)}
          >
            <Icon
              width={scale(24)}
              height={scale(24)}
              color={activeTab === id ? colors.gray900 : colors.gray400}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === id && styles.activeTabLabel,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  activeTabLabel: {
    color: colors.gray900,
  },
  backButton: {
    flexShrink: 0,
    left: scale(0),
    padding: scale(8),
    position: 'absolute',
  },
  footer: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    height: vs(42),
    justifyContent: 'center',
    width: '100%',
  },
  footerContainer: {
    backgroundColor: colors.white,
    borderTopColor: colors.gray100,
    borderTopWidth: 1,
    bottom: 0,
    elevation: 3,
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
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
    height: vs(48),
    justifyContent: 'center',
    width: '100%',
  },
  headerContainer: {
    backgroundColor: colors.white,
    width: '100%',
  },
  headerTitle: {
    ...typography.title2_SB,
    color: colors.gray850,
    textAlign: 'center',
  },
  rightContent: {
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: scale(22),
    top: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(10),
    paddingVertical: spacing.small,
    width: scale(120),
  },
  tabLabel: {
    ...typography.caption_M,
    color: colors.gray400,
    marginTop: scale(2),
    textAlign: 'center',
  },
});
