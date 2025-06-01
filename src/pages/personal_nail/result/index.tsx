import React from 'react';
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
import ArrowRightIcon from '~/shared/assets/icons/ic_arrow_right.svg';

const PersonalBarImage = require('~/shared/assets/images/personal_bar.png');

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

  const { data: personalNailResult } = useQuery({
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
            <BackIcon
              width={scale(48)}
              height={scale(48)}
              color={colors.gray800}
            />
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
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.scrollContent}>
            {/* 배경색 영역 */}
            <View
              style={[
                styles.backgroundColorSection,
                {
                  backgroundColor: convertColorNumberToHex(
                    result.background_color,
                  ),
                },
              ]}
            >
              {/* 헤더 - 배경색 영역 안에 포함 */}
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={handleBack}
                  style={styles.backButton}
                >
                  <BackIcon
                    width={scale(48)}
                    height={scale(48)}
                    color={colors.gray800}
                  />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>퍼스널네일 측정 결과</Text>
                <View style={styles.headerSpacer} />
              </View>
            </View>

            {/* 네일 아이콘 */}
            <View style={styles.iconContainer}>
              <View style={styles.iconWrapper}>
                <Image
                  source={{ uri: result.icon_url }}
                  style={styles.icon}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* 결과 박스 */}
            <View style={styles.resultBoxWrapper}>
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
                <Text style={styles.recommendationTitleLine}>
                  <Text style={styles.recommendationTitleHighlight}>
                    {userNickname}
                  </Text>
                  <Text style={styles.recommendationTitle}>
                    님은{'\n'}이런 아트가 어울려요
                  </Text>
                </Text>
              </View>

              {/* 중앙 정렬을 위한 감싸는 컨테이너 */}
              <View style={styles.centerContainer}>
                {/* 네일 그리드 */}
                {isNailsLoading ? (
                  <View style={styles.nailsLoadingContainer}>
                    <ActivityIndicator size="small" color={colors.purple500} />
                  </View>
                ) : (
                  <FlatList
                    data={nails
                      .filter(
                        (nail): nail is NailItemType => nail !== undefined,
                      )
                      .slice(0, 10)}
                    renderItem={renderNailItem}
                    keyExtractor={item => `nail-${item.id}`}
                    numColumns={2}
                    columnWrapperStyle={styles.nailRow}
                    ItemSeparatorComponent={NailSeparator}
                    scrollEnabled={false}
                    removeClippedSubviews={false}
                  />
                )}
              </View>

              {/* 하단 버튼 */}
              <View style={styles.personalBarWrapper}>
                <TouchableOpacity
                  style={styles.personalBarContainer}
                  onPress={() => navigation.navigate('ARExperiencePage')}
                  activeOpacity={0.8}
                >
                  <View style={styles.personalBarContent}>
                    <Text style={styles.personalBarText}>
                      내 손에 어울리는 조합 만들러 가기
                    </Text>
                    <ArrowRightIcon
                      width={scale(24)}
                      height={scale(24)}
                      color={colors.white}
                    />
                  </View>
                  <Image
                    source={PersonalBarImage}
                    style={styles.personalBarImage}
                  />
                </TouchableOpacity>
              </View>
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
    height: vs(221),
    width: '100%',
  },
  centerContainer: {
    alignItems: 'center',
    width: '100%',
  },
  contentWrapper: {
    flex: 1,
  },
  description: {
    ...typography.body5_M,
    color: colors.gray650,
    lineHeight: vs(20),
    marginTop: vs(23),
    textAlign: 'center',
  },
  divider: {
    backgroundColor: colors.gray50,
    height: vs(10),
    marginTop: vs(32),
    width: scale(375),
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
    height: vs(48),
    width: '100%',
  },
  headerSpacer: {
    width: scale(48),
  },
  headerTitle: {
    ...typography.title2_SB,
    color: colors.gray800,
    flex: 1,
    textAlign: 'center',
  },
  icon: {
    height: scale(100),
    width: scale(100),
  },
  iconContainer: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: vs(98),
    zIndex: 2,
  },
  iconWrapper: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.gray100,
    borderRadius: scale(50),
    borderWidth: 2,
    height: scale(100),
    justifyContent: 'center',
    width: scale(100),
  },
  nailItem: {
    width: scale(160),
  },
  nailRow: {
    gap: scale(12),
    width: scale(332),
  },
  nailSeparator: {
    height: vs(12),
  },
  nailsLoadingContainer: {
    alignItems: 'center',
    marginTop: vs(20),
  },
  personalBarContainer: {
    height: vs(69),
    overflow: 'hidden',
    position: 'relative',
    width: scale(331),
  },
  personalBarContent: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    position: 'relative',
    zIndex: 2,
  },
  personalBarImage: {
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 1,
  },
  personalBarText: {
    ...typography.body2_SB,
    color: colors.white,
  },
  personalBarWrapper: {
    alignItems: 'center',
    marginTop: vs(24),
    width: '100%',
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
  recommendationTitleLine: {
    ...typography.head2_B,
  },
  resultBox: {
    backgroundColor: colors.white,
    borderRadius: 16,
    elevation: 8,
    height: vs(274),
    paddingBottom: vs(31),
    paddingHorizontal: scale(22),
    paddingTop: vs(68),
    position: 'relative',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    width: scale(323),
  },
  resultBoxWrapper: {
    alignItems: 'center',
    marginTop: vs(-68),
    paddingHorizontal: scale(26),
    position: 'relative',
    zIndex: 1,
  },
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
  },
  scrollContent: {
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  tag: {
    backgroundColor: colors.white,
    borderColor: colors.gray200,
    borderRadius: 100,
    borderWidth: 1,
    marginVertical: vs(2),
    paddingHorizontal: scale(14),
    paddingVertical: vs(6),
  },
  tagText: {
    ...typography.body4_M,
    color: colors.gray750,
  },
  tagsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(6),
    justifyContent: 'center',
    marginTop: vs(8),
  },
  title: {
    ...typography.head1_B,
    color: colors.gray800,
    textAlign: 'center',
  },
});

export default PersonalNailResult;
