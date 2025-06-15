import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';

const ProfileImage = require('~/shared/assets/images/img_profile.png');

interface ProfileSectionProps {
  nickname: string;
}

/**
 * 프로필 섹션 컴포넌트
 */
export function ProfileSection({ nickname }: ProfileSectionProps) {
  return (
    <View style={styles.profileSection}>
      <View style={styles.profileImageContainer}>
        <Image source={ProfileImage} style={styles.profileImage} />
      </View>
      <Text style={styles.nickname}>{nickname}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  nickname: {
    ...typography.body1_B,
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
});
