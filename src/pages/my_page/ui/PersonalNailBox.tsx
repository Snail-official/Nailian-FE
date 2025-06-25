import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/shared/types/navigation';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import { GetPersonalNailResponse } from '~/shared/api/types';

const EmptyNailImage = require('~/shared/assets/images/img_emptynail.png');

interface PersonalNailBoxProps {
  nickname: string;
  personalNailResult?: GetPersonalNailResponse;
  navigation: NativeStackNavigationProp<RootStackParamList, 'MyPage'>;
}

/**
 * 퍼스널 네일 측정 박스 컴포넌트
 */
export function PersonalNailBox({
  nickname,
  personalNailResult,
  navigation,
}: PersonalNailBoxProps) {
  const handleViewResult = () => {
    if (personalNailResult?.data) {
      navigation.navigate('PersonalNailResult', {
        personalNailResult: personalNailResult.data,
      });
    }
  };

  const handleMeasure = () => {
    navigation.navigate('PersonalNailFunnelPage', { step: 1 });
  };

  return (
    <View style={styles.personalNailBox}>
      <View style={styles.personalNailContent}>
        {personalNailResult?.data?.title ? (
          <View style={styles.personalNailInfo}>
            <View style={styles.personalNailTitleContainer}>
              <View style={styles.personalNailTitleWrapper}>
                <Text style={styles.personalNailTitlePrefix}>
                  <Text style={styles.personalNailResultNickname}>
                    {nickname}
                  </Text>
                  <Text style={styles.personalNailTitleSuffix}>님은{'\n'}</Text>
                  <Text style={styles.personalNailTypeText}>
                    {personalNailResult.data.title}
                  </Text>
                  <Text style={styles.personalNailTitleSuffix}>입니다</Text>
                </Text>
              </View>
              <Image
                source={{ uri: personalNailResult.data.icon_url }}
                style={styles.personalNailIcon}
              />
            </View>
            <View style={styles.personalNailButtons}>
              <TouchableOpacity
                style={styles.viewResultButton}
                activeOpacity={0.8}
                onPress={handleViewResult}
              >
                <Text style={styles.viewResultButtonText}>결과보기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.measureButton}
                activeOpacity={0.8}
                onPress={handleMeasure}
              >
                <Text style={styles.measureButtonText}>다시 측정하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.personalNailEmptyContent}>
              <Text style={styles.personalNailTitle}>
                <Text style={styles.personalNailNickname}>{nickname}</Text>
                <Text style={styles.personalNailTitleSuffix}>
                  님의{'\n'}퍼스널네일을 측정해보세요
                </Text>
              </Text>
              <Image source={EmptyNailImage} style={styles.emptyNailImage} />
            </View>
            <TouchableOpacity
              style={styles.measureButton}
              activeOpacity={0.8}
              onPress={handleMeasure}
            >
              <Text style={styles.measureButtonText}>측정하기</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyNailImage: {
    height: scale(64),
    width: scale(64),
  },
  measureButton: {
    alignItems: 'center',
    backgroundColor: colors.gray900,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: scale(30),
    paddingVertical: vs(10),
    width: scale(125),
  },
  measureButtonText: {
    ...typography.body3_B,
    color: colors.white,
    textAlign: 'center',
  },
  personalNailBox: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    elevation: 8,
    height: vs(157),
    justifyContent: 'space-between',
    marginHorizontal: scale(24),
    marginTop: vs(24),
    paddingBottom: vs(16),
    paddingHorizontal: scale(22),
    paddingTop: vs(22),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    width: scale(327),
  },
  personalNailButtons: {
    flexDirection: 'row',
    gap: scale(12),
    justifyContent: 'center',
  },
  personalNailContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    width: '100%',
  },
  personalNailEmptyContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  personalNailIcon: {
    height: scale(64),
    width: scale(64),
  },
  personalNailInfo: {
    flex: 1,
    width: '100%',
  },
  personalNailNickname: {
    ...typography.title2_SB,
    color: colors.purple500,
  },
  personalNailResultNickname: {
    ...typography.title2_SB,
    color: colors.gray800,
  },
  personalNailTitle: {
    ...typography.title2_SB,
    color: colors.gray800,
    flex: 1,
  },
  personalNailTitleContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(16),
    width: '100%',
  },
  personalNailTitlePrefix: {
    ...typography.title2_SB,
  },
  personalNailTitleSuffix: {
    ...typography.title2_SB,
    color: colors.gray800,
  },
  personalNailTitleWrapper: {
    flex: 1,
  },
  personalNailTypeText: {
    ...typography.title2_SB,
    color: colors.purple500,
  },
  viewResultButton: {
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: scale(30),
    paddingVertical: vs(10),
    width: scale(125),
  },
  viewResultButtonText: {
    ...typography.body3_B,
    color: colors.gray850,
    textAlign: 'center',
  },
});
