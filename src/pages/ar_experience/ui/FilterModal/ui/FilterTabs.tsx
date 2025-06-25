import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import { FilterTabType } from '~/features/filter';

interface FilterTabsProps {
  activeTab: FilterTabType;
  onTabChange: (tab: FilterTabType) => void;
}

// 필터 탭 컴포넌트
export function FilterTabs({ activeTab, onTabChange }: FilterTabsProps) {
  return (
    <>
      <View style={styles.tabContainer}>
        {(['category', 'color', 'shape'] as FilterTabType[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => onTabChange(tab)}
            activeOpacity={1}
          >
            <View style={styles.tabItemContainer}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab === 'category'
                  ? '카테고리'
                  : tab === 'color'
                    ? '색상'
                    : '쉐입'}
              </Text>
              <View
                style={[
                  styles.tabIndicator,
                  activeTab !== tab && styles.inactiveTabIndicator,
                ]}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 구분선 */}
      <View style={styles.divider} />
    </>
  );
}

const styles = StyleSheet.create({
  activeTabText: {
    ...typography.body2_SB,
    color: colors.gray850,
  },
  divider: {
    backgroundColor: colors.gray100,
    height: 1,
    marginBottom: vs(10),
    width: '100%',
  },
  inactiveTabIndicator: {
    backgroundColor: colors.white,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
  },
  tabContainer: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: scale(25),
    height: vs(35),
    justifyContent: 'space-around',
    marginTop: vs(18),
    paddingHorizontal: scale(31),
    width: '100%',
  },
  tabIndicator: {
    alignSelf: 'stretch',
    backgroundColor: colors.gray850,
    borderRadius: scale(2),
    height: vs(2),
  },
  tabItemContainer: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: vs(12),
    width: scale(88),
  },
  tabText: {
    ...typography.body2_SB,
    color: colors.gray850,
    textAlign: 'center',
  },
});
