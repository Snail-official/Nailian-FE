import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
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

  const [selectedNails, setSelectedNails] = useState<number[]>([]);

  // 무한 스크롤을 위한 쿼리
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, error } =
    useInfiniteQuery({
      queryKey: ['nailPreferences'],
      queryFn: async ({ pageParam = 1 }) =>
        fetchNailPreferences({
          page: pageParam,
          size: 20,
        }),
      getNextPageParam: lastPage => {
        const totalPages = lastPage.data?.pageInfo?.totalPages || 0;
        const currentPage = lastPage.data?.pageInfo?.currentPage || 0;
        return currentPage < totalPages ? currentPage + 1 : undefined;
      },
      initialPageParam: 1,
    });

  // 에러가 있으면 throw
  if (error) {
    throw new Error('네일 데이터를 불러오는데 실패했습니다');
  }

  // 선택한 네일 저장을 위한 뮤테이션
  const { mutate: savePreferences, isPending: submitLoading } = useMutation({
    mutationFn: saveNailPreferences,
    onSuccess: () => {
      // 성공 시 다음 온보딩 단계로 이동
      navigation.goToNextOnboardingStep();
    },
    onError: (error: unknown) => {
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

      toast.showToast(errorMessage);
    },
  });

  // 네일 선택 토글 함수
  const toggleNailSelection = useCallback((nailId: number) => {
    setSelectedNails(prevSelected => {
      if (prevSelected.includes(nailId)) {
        return prevSelected.filter(id => id !== nailId);
      } else if (prevSelected.length < 10) {
        return [...prevSelected, nailId];
      }
      toast.showToast('네일은 최대 10개까지만 선택할 수 있습니다.');
      return prevSelected;
    });
  }, []);

  const handleCompleteSelection = async () => {
    if (selectedNails.length < 3) {
      toast.showToast('최소 3개의 네일을 선택해주세요');
      return;
    }

    savePreferences({
      preferences: selectedNails,
    });
  };

  // 모든 페이지의 데이터를 하나의 배열로 합치기
  const nails = data?.pages.flatMap(page => page.data?.content || []) || [];

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
            onEndReached={() => hasNextPage && fetchNextPage()}
            onEndReachedThreshold={0.1}
            removeClippedSubviews={false}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="small" color={colors.purple500} />
                </View>
              ) : null
            }
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
  loaderContainer: {
    alignItems: 'center',
    marginVertical: vs(16),
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
