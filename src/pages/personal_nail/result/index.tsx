import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import { RootStackParamList } from '~/shared/types/navigation';
import { fetchPersonalNail, fetchUserProfile } from '~/entities/user/api';
import { fetchNailSetDetail } from '~/entities/nail-set/api';
import NailSet from '~/features/nail-set/ui/NailSet';
import BackIcon from '~/shared/assets/icons/ic_arrow_left.svg';

interface PersonalNailResultProps {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'PersonalNailResult'
  >;
  route: RouteProp<RootStackParamList, 'PersonalNailResult'>;
}

interface NailItemType {
  id: number;
  thumb: {
    imageUrl: string;
  };
  index: {
    imageUrl: string;
  };
  middle: {
    imageUrl: string;
  };
  ring: {
    imageUrl: string;
  };
  pinky: {
    imageUrl: string;
  };
}

// 색상 코드 변환 함수
const convertColorNumberToHex = (colorNumber: number) => {
  const hex = colorNumber.toString(16).padStart(6, '0');
  return `#${hex}`;
};

// 네일 아이템 간 구분선 컴포넌트
function NailSeparator() {
  return <View style={styles.nailSeparator} />;
}

/**
 * 퍼스널 네일 측정 결과 페이지
 *
 * 사용자의 퍼스널 네일 진단 결과를 표시하는 화면입니다.
 * - 진단 결과 아이콘, 타이틀, 태그, 설명
 * - 추천 네일 아트 목록
 *
 * @param navigation - 네비게이션 객체
 * @param route - 라우트 객체 (personalNailResult가 전달될 수 있음)
 */
function PersonalNailResult({ navigation, route }: PersonalNailResultProps) {
  const initialResult = route.params?.personalNailResult;

  // 사용자 정보 조회
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });

  const { data: personalNailResult, isLoading: isResultLoading } = useQuery({
    queryKey: ['personalNail'],
    queryFn: fetchPersonalNail,
    enabled: !initialResult,
    staleTime: 0,
  });

  const result = initialResult || personalNailResult?.data;

  const { data: nailSetsData, isLoading: isNailsLoading } = useQuery({
    queryKey: ['recommendedNailSets', result?.set_ids],
    queryFn: async () => {
      if (!result?.set_ids) return [];
      const nailSets = await Promise.all(
        result.set_ids.map(id => fetchNailSetDetail({ nailSetId: id })),
      );
      return nailSets.map(response => response.data);
    },
    enabled: !!result?.set_ids,
  });

  // 실제 유저 닉네임 가져오기, 없으면 기본값 사용
  const userNickname = userProfile?.data?.nickname || '사용자';

  const handleBack = () => {
    navigation.goBack();
  };

  // 결과가 없으면 에러 표시
  if (!result) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <BackIcon width={scale(48)} height={scale(48)} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>퍼스널네일 측정 결과</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>결과를 불러올 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const nails = nailSetsData || [];

  // 네일 아이템 렌더링
  const renderNailItem = ({ item }: { item: NailItemType; index: number }) => (
    <View style={styles.nailItem}>
      <NailSet nailImages={item} size="small" />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <BackIcon width={scale(48)} height={scale(48)} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>퍼스널네일 측정 결과</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.scrollContent}>
            <View
              style={[
                styles.backgroundColorSection,
                {
                  backgroundColor: convertColorNumberToHex(
                    result.background_color,
                  ),
                },
              ]}
            />
            {/* 결과 박스 */}
            <View style={styles.resultBoxWrapper}>
              <View style={styles.iconContainer}>
                <View style={styles.iconWrapper}>
                  <Image
                    source={{ uri: result.icon_url }}
                    style={styles.icon}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <View style={styles.resultBox}>
                {/* 타이틀 */}
                <Text style={styles.title}>{result.title}</Text>

                {/* 태그들 */}
                <View style={styles.tagsContainer}>
                  {result.tags.map(tag => (
                    <View key={`tag-${tag}`} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                {/* 설명 */}
                <Text style={styles.description}>{result.description}</Text>
              </View>
            </View>

            {/* 경계선 */}
            <View style={styles.divider} />

            {/* 추천 네일 섹션 */}
            <View style={styles.recommendationSection}>
              <View style={styles.recommendationTitleContainer}>
                <View style={styles.recommendationTitleWrapper}>
                  <Text style={styles.recommendationTitleHighlight}>
                    {userNickname}
                  </Text>
                  <Text style={styles.recommendationTitle}>님은</Text>
                </View>
                <Text style={styles.recommendationTitle}>
                  이런 아트가 어울려요
                </Text>
              </View>

              {/* 네일 그리드 */}
              {isNailsLoading ? (
                <View style={styles.nailsLoadingContainer}>
                  <ActivityIndicator size="small" color={colors.purple500} />
                </View>
              ) : (
                <FlatList
                  data={nails
                    .filter((nail): nail is NailItemType => nail !== undefined)
                    .slice(0, 6)}
                  renderItem={renderNailItem}
                  keyExtractor={item => `nail-${item.id}`}
                  numColumns={2}
                  columnWrapperStyle={styles.nailRow}
                  ItemSeparatorComponent={NailSeparator}
                  scrollEnabled={false}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: scale(48),
    justifyContent: 'center',
    width: scale(48),
  },
  backgroundColorSection: {
    height: vs(220),
    left: 0,
    position: 'absolute',
    right: 0,
    top: vs(-86),
    zIndex: 0,
  },
  contentWrapper: {
    flex: 1,
  },
  description: {
    ...typography.body1_B,
    color: colors.gray650,
    lineHeight: vs(22),
    marginTop: vs(24),
    textAlign: 'center',
  },
  divider: {
    backgroundColor: colors.gray50,
    height: vs(10),
    marginTop: vs(32),
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    ...typography.body1_B,
    color: colors.gray600,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: vs(56),
    paddingHorizontal: scale(20),
    position: 'relative',
    zIndex: 2,
  },
  headerSpacer: {
    width: scale(44),
  },
  headerTitle: {
    ...typography.head2_B,
    color: colors.black,
    flex: 1,
    textAlign: 'center',
  },
  icon: {
    height: scale(80),
    width: scale(80),
  },
  iconContainer: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: vs(-50),
    zIndex: 1,
  },
  iconWrapper: {
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: scale(50),
    height: scale(100),
    justifyContent: 'center',
    width: scale(100),
  },
  nailItem: {
    marginHorizontal: scale(6),
    marginVertical: scale(6),
  },
  nailRow: {
    justifyContent: 'center',
  },
  nailSeparator: {
    height: vs(12),
  },
  nailsLoadingContainer: {
    alignItems: 'center',
    marginTop: vs(20),
  },
  recommendationSection: {
    marginTop: vs(38),
    paddingBottom: vs(40),
    paddingHorizontal: scale(20),
  },
  recommendationTitle: {
    ...typography.head2_B,
    color: colors.black,
  },
  recommendationTitleContainer: {
    marginBottom: vs(24),
  },
  recommendationTitleHighlight: {
    ...typography.head2_B,
    color: colors.purple500,
  },
  recommendationTitleWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: vs(4),
  },
  resultBox: {
    backgroundColor: colors.white,
    borderRadius: 16,
    elevation: 4,
    paddingBottom: vs(30),
    paddingHorizontal: scale(22),
    paddingTop: vs(65),
    position: 'relative',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  resultBoxWrapper: {
    paddingHorizontal: scale(20),
    position: 'relative',
  },
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
  },
  scrollContent: {
    marginTop: vs(86),
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  tag: {
    borderColor: colors.gray200,
    borderRadius: 100,
    borderWidth: 1,
    marginHorizontal: scale(4),
    marginVertical: vs(2),
    paddingHorizontal: scale(14),
    paddingVertical: vs(6),
  },
  tagText: {
    ...typography.body4_M,
    color: colors.gray750,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: vs(8),
  },
  title: {
    ...typography.head1_B,
    color: colors.black,
    textAlign: 'center',
  },
});

export default PersonalNailResult;
