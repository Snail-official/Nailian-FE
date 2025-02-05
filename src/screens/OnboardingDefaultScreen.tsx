import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ListRenderItem,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, typography, spacing, commonStyles } from '../styles/common';
import nailAssets from '../assets/images';

/**
 * 초기 네일 이미지 데이터 생성
 * 15개의 이미지를 6개의 에셋으로 순환하며 표시
 * @example [{ id: '0', source: nailAssets.nail1 }, ...]
 */
const initialNails = Array.from({ length: 15 }, (_, index) => ({
  id: String(index),
  source: nailAssets[`nail${(index % 6) + 1}` as keyof typeof nailAssets],
}));

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
    ...typography.title2,
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
  nailImage: {
    backgroundColor: colors.gray200,
    borderRadius: 4,
    height: '100%',
    width: '100%',
  },
  nailItem: {
    height: 103,
    width: 103,
  },
  row: {
    gap: 11,
    justifyContent: 'flex-start',
  },
  title: {
    ...typography.head1,
    color: colors.gray850,
  },
});

// ItemSeparator 컴포넌트를 일반 함수로 변경
function ItemSeparator(): JSX.Element {
  return <View style={{ height: 11 }} />;
}

// source 타입 정의
type NailItem = {
  id: string;
  source: ReturnType<typeof require>;
};

/**
 * 온보딩 네일 선택 화면
 * 사용자가 마음에 드는 네일 디자인을 3개 이상 선택하는 화면
 */
function OnboardingDefaultScreen(): JSX.Element {
  // 상태 관리
  const [nails, setNails] = useState(initialNails); // 표시할 네일 이미지 목록
  const [isEnabled, setIsEnabled] = useState(false); // 완료 버튼 활성화 상태
  const [isLoading, setIsLoading] = useState(false); // 추가 이미지 로딩 상태

  const renderNailItem: ListRenderItem<NailItem> = React.useCallback(
    ({ item }) => (
      <View style={styles.nailItem}>
        <Image source={item.source} style={styles.nailImage} />
      </View>
    ),
    [],
  );

  const loadMoreNails = React.useCallback(() => {
    if (isLoading) return;

    setIsLoading(true);
    const currentLength = nails.length;
    const newNails = Array.from({ length: 15 }, (_, index) => ({
      id: String(currentLength + index),
      source:
        nailAssets[
          `nail${((currentLength + index) % 6) + 1}` as keyof typeof nailAssets
        ],
    }));
    setNails(prev => [...prev, ...newNails]);
    setIsLoading(false);
  }, [isLoading, nails.length]);

  return (
    <View style={styles.container}>
      {/* 헤더 영역 */}
      <View style={styles.header}>
        <Text style={styles.title}>
          마음에 드는 네일을{'\n'}3개 이상 골라주세요
        </Text>
      </View>

      {/* 네일 이미지 그리드 */}
      <FlatList
        data={nails}
        renderItem={renderNailItem}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
        ItemSeparatorComponent={ItemSeparator}
        onEndReached={loadMoreNails}
        onEndReachedThreshold={0.1}
      />

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
            disabled={!isEnabled}
          >
            <Text style={styles.completeButtonText}>선택 완료</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default OnboardingDefaultScreen;
