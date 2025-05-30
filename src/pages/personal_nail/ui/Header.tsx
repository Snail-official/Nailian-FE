import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import ArrowLeftIcon from '~/shared/assets/icons/ic_arrow_left.svg';

interface HeaderProps {
  onBack: () => void;
}

function Header({ onBack }: HeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <ArrowLeftIcon width={48} height={48} color={colors.gray800} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>퍼스널네일 측정</Text>
      <View style={styles.rightPlaceholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: scale(40),
    justifyContent: 'center',
    paddingLeft: scale(8),
    width: scale(40),
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.gray100,
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: vs(56),
    justifyContent: 'space-between',
    paddingLeft: scale(4),
    width: '100%',
  },
  headerTitle: {
    color: colors.gray850,
    flex: 1,
    textAlign: 'center',
    ...typography.title2_SB,
  },
  rightPlaceholder: {
    width: scale(40),
  },
});

export default Header;
