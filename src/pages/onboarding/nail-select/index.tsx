import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  colors,
  typography,
  spacing,
  commonStyles,
} from '~/shared/styles/design';
import LinearGradient from 'react-native-linear-gradient';
import NailItem from '~/features/nail-selection/ui/NailItem';
import Toast from '~/shared/ui/Toast';
import { NailPreferencesResponse } from '~/shared/api/types';
import {
  fetchNailPreferences,
  saveNailPreferences,
} from '~/entities/nail-preference/api';
import { useOnboardingNavigation } from '~/features/onboarding/model/useOnboardingNavigation';

/**
 * 온보딩 네일 선택 화면
 *
 * 사용자가 마음에 드는 네일 디자인을 3개 이상 선택하는 화면입니다.
 * - 최소 3개 이상 선택해야 다음 단계로 진행할 수 있습니다.
 * - 최대 10개까지 선택할 수 있습니다.
 * - 스크롤 시 추가 이미지가 로드됩니다.
 */
function ItemSeparator() {
  return <View style={styles.separator} />;
}

export default function NailSelectScreen() {
  const { goToNextOnboardingStep } = useOnboardingNavigation();

  // 상태 관리
  const [nails, setNails] = useState<{ id: string; imageUrl: string }[]>([]);
  const [selectedNails, setSelectedNails] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [isEnabled, setIsEnabled] = useState(false); // 완료 버튼 활성화 상태
  const [isLoading, setIsLoading] = useState(false); // 추가 이미지 로딩 상태
  const [hasMore, setHasMore] = useState(true);
  const [showToast, setShowToast] = useState(false); // 토스트 표시 상태
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>();

  /**
   * 추가 네일 이미지 로드 함수
   * 스크롤이 하단에 도달하면 15개의 새로운 이미지를 추가
   */
  const loadNailPreferences = useCallback(
    async (page = 1) => {
      if (isLoading || !hasMore) return; // 더 이상 불러올 데이터가 없으면 중단

      try {
        setIsLoading(true);
        const response: NailPreferencesResponse = await fetchNailPreferences({
          page,
          size: 24,
        });
        if (response.data) {
          const newData =
            response.data?.data.map(nail => ({
              ...nail,
              id: String(nail.id), // id를 String으로 변환
            })) ?? [];

          setNails(prev => [...prev, ...newData]);
          setCurrentPage(page);
          setHasMore(
            response.data.pageInfo.currentPage <
              response.data.pageInfo.totalPages,
          );
        }
      } catch (error) {
        console.error('네일 취향 목록 불러오기 실패:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, hasMore],
  );

  /**
   * 선택 처리 함수
   * @param id 선택한 네일의 ID
   */
  const handleNailSelect = (id: string) => {
    setSelectedNails(prev => {
      if (prev.includes(id)) {
        // 선택 해제
        const newSelected = prev.filter(nailId => nailId !== id);
        setIsEnabled(newSelected.length >= 3);
        return newSelected;
      } else if (prev.length >= 10) {
        // 10개 초과 선택 시 토스트 표시
        if (toastTimerRef.current) {
          clearTimeout(toastTimerRef.current);
        }

        setShowToast(true);
        toastTimerRef.current = setTimeout(() => {
          setShowToast(false);
          toastTimerRef.current = undefined;
        }, 2000); // 2초 후 토스트 숨김

        return prev;
      } else {
        // 선택 추가
        const newSelected = [...prev, id];
        setIsEnabled(newSelected.length >= 3);
        return newSelected;
      }
    });
  };

  /**
   * 개별 네일 이미지 렌더링 컴포넌트
   * FlatList의 renderItem으로 사용
   */
  const renderNailItem = ({
    item,
  }: {
    item: { id: string; imageUrl: string };
  }) => (
    <View style={styles.nailItem}>
      <NailItem
        source={{ uri: item.imageUrl }}
        isSelected={selectedNails.includes(item.id)}
        onSelect={() => handleNailSelect(item.id)}
      />
    </View>
  );

  const handleCompleteSelection = async () => {
    if (!isEnabled) return; // 최소 3개 선택하지 않으면 처리 X

    try {
      setIsLoading(true); // 로딩 상태 활성화

      // 선택한 네일 취향 저장 API 호출
      await saveNailPreferences({
        selectedPreferences: selectedNails.map(i => Number(i)),
      });

      // 성공 시 다음 온보딩 단계로 이동
      goToNextOnboardingStep();
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
    } finally {
      setIsLoading(false); // 로딩 상태 해제
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        if (isMounted) {
          await loadNailPreferences(1);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, [loadNailPreferences]);

  return (
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
          keyExtractor={item => String(item.id)}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row}
          ItemSeparatorComponent={ItemSeparator}
          onEndReached={() => loadNailPreferences(currentPage + 1)}
          onEndReachedThreshold={0.1}
          removeClippedSubviews={false}
        />
      )}

      {/* 하단 그라데이션 영역 */}
      <View style={styles.gradientWrapper}>
        <LinearGradient
          style={styles.gradient}
          colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.9)']}
          locations={[0, 1]}
        />
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[
              styles.completeButton,
              isEnabled
                ? styles.completeButtonEnabled
                : styles.completeButtonDisabled,
            ]}
            disabled={!isEnabled || isLoading}
            onPress={handleCompleteSelection} // 변경된 함수 적용
          >
            <Text style={styles.completeButtonText}>
              {isLoading ? '저장 중...' : '선택 완료'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Toast 컴포넌트 */}
      <Toast message="최대 10개까지 선택할 수 있어요" visible={showToast} />
    </View>
  );
}

/**
 * 스타일 정의
 */
const styles = StyleSheet.create({
  buttonWrapper: {
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.medium, // 16px
  },
  completeButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    width: 331,
  },
  completeButtonDisabled: {
    backgroundColor: colors.purple200,
  },
  completeButtonEnabled: {
    backgroundColor: colors.purple500,
  },
  completeButtonText: {
    ...typography.title2_SB,
    color: colors.white,
  },
  container: {
    ...commonStyles.screen,
    alignSelf: 'center',
    height: 812,
    width: 375,
  },
  gradient: {
    height: 40,
    width: '100%',
  },
  gradientWrapper: {
    bottom: 0,
    position: 'absolute',
    width: '100%',
  },
  gridContainer: {
    paddingHorizontal: spacing.large,
  },
  header: {
    marginBottom: 28,
    paddingHorizontal: spacing.large,
    paddingTop: spacing.xlarge, // 텍스트와 이미지 사이 간격
  },
  nailItem: {
    height: 103,
    width: 103,
  },
  row: {
    gap: 11,
    justifyContent: 'flex-start',
  },
  separator: {
    height: 11,
  },
  title: {
    ...typography.head1_B,
    color: colors.gray850,
  },
});
