import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '~/shared/styles/design';
import HomeIcon from '~/shared/assets/icons/ic_home.svg';
import BackIcon from '~/shared/assets/icons/ic_arrow_left.svg';
import GalleryIcon from '~/shared/assets/icons/ic_ar.svg';
import ProfileIcon from '~/shared/assets/icons/ic_my.svg';

interface TabBarHeaderProps {
  title: string;
  onBack: () => void;
}

interface TabBarFooterProps {
  activeTab: 'home' | 'gallery' | 'profile';
  onTabPress: (tab: 'home' | 'gallery' | 'profile') => void;
}

export function TabBarHeader({ title, onBack }: TabBarHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack && (
        <TouchableOpacity onPress={onBack}>
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
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onTabPress('home')}
      >
        <HomeIcon
          width={24}
          height={24}
          fill={activeTab === 'home' ? colors.gray850 : colors.gray400}
        />
        <Text style={styles.tabLabel}>홈</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onTabPress('gallery')}
      >
        <GalleryIcon
          width={24}
          height={24}
          fill={activeTab === 'gallery' ? colors.gray850 : colors.gray400}
        />
        <Text style={styles.tabLabel}>사진첩</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onTabPress('profile')}
      >
        <ProfileIcon
          width={24}
          height={24}
          fill={activeTab === 'profile' ? colors.gray850 : colors.gray400}
        />
        <Text style={styles.tabLabel}>내정보</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: colors.white,
    borderTopColor: colors.gray100,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexShrink: 0,
    height: 74,
    justifyContent: 'space-around',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    width: 375,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
    flexShrink: 0,
    gap: 107,
    height: 48,
    paddingLeft: 5,
    paddingRight: 159,
    width: 375,
  },
  headerTitle: {
    ...typography.title2_SB,
    color: colors.gray850,
    textAlign: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.small,
  },
  tabLabel: {
    ...typography.caption_M,
    color: colors.gray400,
    textAlign: 'center',
  },
});
