import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  typography,
  spacing,
  commonStyles,
} from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import NailItem from '~/features/nail-selection/ui/NailItem';
import {
  fetchNailPreferences,
  saveNailPreferences,
} from '~/entities/nail-preference/api';
import { useOnboardingNavigation } from '~/features/onboarding/model/useOnboardingNavigation';
import Button from '~/shared/ui/Button';
import { toast } from '~/shared/lib/toast';
import { useLoadMore } from '~/shared/api/hooks';

/**
 * 온보딩 네일 선택 화면
 *
 * 사용자가 마음에 드는 네일 디자인을 3개 이상 선택하는 화면입니다.
 * - 최소 3개 이상 선택해야 다음 단계로 진행할 수 있습니다.
 * - 최대 10개까지 선택할 수 있습니다.
 * - 스크롤 시 추가 이미지가 로드됩니다.
 */

// 네일 아이템의 타입 정의 (API 응답과 일치)
type NailItem = {
  id: number;
  imageUrl: string;
};

/**
 * 아이템 구분선 컴포넌트
 *
 * FlatList에서 각 네일 아이템 사이의 간격을 제공하는 구분선입니다.
 *
 * @returns {JSX.Element} 구분선 뷰 컴포넌트
 */
function ItemSeparator() {
  return <View style={styles.separator} />;
}

export default function NailSelectScreen() {
  const navigation = useOnboardingNavigation();
  const [nails, setNails] = useState<NailItem[]>([]);
  const [selectedNails, setSelectedNails] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // 네일 선택 토글 함수
  const toggleNailSelection = useCallback((nailId: number) => {
    setSelectedNails(prevSelected => {
      if (prevSelected.includes(nailId)) {
        // 이미 선택된 경우 제거
        return prevSelected.filter(id => id !== nailId);
      } else if (prevSelected.length < 10) {
        // 최대 10개까지만 선택 가능
        return [...prevSelected, nailId];
      }
      // 이미 10개 선택한 경우
      toast.showToast('네일은 최대 10개까지만 선택할 수 있습니다.');
      return prevSelected;
    });
  }, []);

  // 네일 데이터 가져오기
  const fetchNailData = useCallback(
    async (page: number) => {
      if (isLoading) return;

      try {
        setIsLoading(true);
        const response = await fetchNailPreferences({
          page,
          size: 20,
        });

        if (response.data?.content) {
          // 응답 데이터 구조에 맞게 처리
          const newNails = response.data.content.map(item => ({
            id: item.id,
            imageUrl: item.imageUrl,
          }));

          setNails(prev => (page === 1 ? newNails : [...prev, ...newNails]));

          // 더 불러올 데이터가 있는지 확인
          const hasNext =
            response.data.pageInfo.currentPage <
            response.data.pageInfo.totalPages;
          setHasMore(hasNext);
        }
      } catch (error) {
        console.error('네일 추천 목록 조회 실패', error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  // useLoadMore 훅 사용하여 무한 스크롤 처리
  const { handleLoadMore, resetPage } = useLoadMore({
    onLoad: page => fetchNailData(page),
    hasMore,
    isLoading,
  });

  // 초기 데이터 로드
  useEffect(() => {
    resetPage();
    fetchNailData(1);
  }, [fetchNailData, resetPage]);

  const handleCompleteSelection = async () => {
    if (selectedNails.length < 3) {
      toast.showToast('최소 3개의 네일을 선택해주세요');
      return;
    }

    try {
      setSubmitLoading(true);

      // 선택한 네일 취향 저장 API 호출
      await saveNailPreferences({
        preferences: selectedNails,
      });

      // 성공 시 다음 온보딩 단계로 이동
      navigation.goToNextOnboardingStep();
    } catch (error: unknown) {
      console.error('네일 취향 저장 실패:', error);

      let errorMessage = '네일 취향 저장에 실패했습니다.';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
      ) {
        errorMessage =
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message || errorMessage;
      }

      // 에러 메시지 표시
      toast.showToast(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  /**
   * 개별 네일 이미지 렌더링 컴포넌트
   * FlatList의 renderItem으로 사용
   */
  const renderNailItem = ({
    item,
    index,
  }: {
    item: NailItem;
    index: number;
  }) => (
    <View style={styles.nailItem}>
      <NailItem
        key={`nail-${item.id}-${index}`}
        source={{ uri: item.imageUrl }}
        isSelected={selectedNails.includes(item.id)}
        onSelect={() => toggleNailSelection(item.id)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 헤더 영역 */}
        <View style={styles.header}>
          <Text style={styles.title}>
            마음에 드는 네일을{'\n'}3개 이상 골라주세요
          </Text>
        </View>

        {/* 네일 이미지 그리드 */}
        {nails.length > 0 && (
          <FlatList
            data={nails}
            renderItem={renderNailItem}
            keyExtractor={(item, index) => `nail-${item.id}-${index}`}
            numColumns={3}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.row}
            ItemSeparatorComponent={ItemSeparator}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            removeClippedSubviews={false}
          />
        )}

        {/* 버튼 영역 */}
        <Button
          variant="primaryMediumGradient"
          disabled={selectedNails.length < 3}
          loading={submitLoading}
          onPress={handleCompleteSelection}
        >
          <Text style={[styles.buttonText, typography.title2_SB]}>
            시작하기
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}

/**
 * 스타일 정의
 */
const styles = StyleSheet.create({
  buttonText: {
    color: colors.white,
  },
  container: {
    ...commonStyles.screen,
    alignSelf: 'center',
    height: vs(812),
    width: scale(375),
  },
  gridContainer: {
    paddingHorizontal: spacing.large,
  },
  header: {
    marginBottom: vs(28),
    paddingHorizontal: spacing.large,
    paddingTop: spacing.xlarge,
  },
  nailItem: {
    height: scale(103),
    width: scale(103),
  },
  row: {
    gap: scale(11),
    justifyContent: 'flex-start',
  },
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
  },
  separator: {
    height: vs(11),
  },
  title: {
    ...typography.head1_B,
    color: colors.gray850,
  },
});
