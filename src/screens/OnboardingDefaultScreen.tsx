import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, typography, spacing, commonStyles } from '../styles/common';
import nailAssets from '../assets/images';
import NailItem, { NailData } from '../components/NailItem';
import Toast from '../components/Toast';

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
 * 온보딩 네일 선택 화면
 * 사용자가 마음에 드는 네일 디자인을 3개 이상 선택하는 화면
 */
function ItemSeparator(): JSX.Element {
  return <View style={{ height: 11 }} />;
}

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

function OnboardingDefaultScreen(): JSX.Element {
  // 상태 관리
  const [nails, setNails] = useState<NailData[]>(initialNails); // 표시할 네일 이미지 목록
  const [selectedNails, setSelectedNails] = useState<string[]>([]);
  const [isEnabled, setIsEnabled] = useState(false); // 완료 버튼 활성화 상태
  const [isLoading, setIsLoading] = useState(false); // 추가 이미지 로딩 상태
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef<number>();

  /**
   * 추가 네일 이미지 로드 함수
   * 스크롤이 하단에 도달하면 15개의 새로운 이미지를 추가
   */
  const loadMoreNails = () => {
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
  };

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
      }
      if (prev.length >= 10) {
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
      }
      // 선택 추가
      const newSelected = [...prev, id];
      setIsEnabled(newSelected.length >= 3);
      return newSelected;
    });
  };

  /**
   * 개별 네일 이미지 렌더링 컴포넌트
   * FlatList의 renderItem으로 사용
   */
  const renderNailItem = ({ item }: { item: NailData }) => (
    <View style={styles.nailItem}>
      <NailItem
        source={item.source}
        isSelected={selectedNails.includes(item.id)}
        onSelect={() => handleNailSelect(item.id)}
      />
    </View>
  );

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

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
            onPress={() => {
              if (isEnabled) {
                // 버튼 활성화 상태일 때만 처리
                // TODO: 여기에 완료 처리 로직 추가
              }
            }}
          >
            <Text style={styles.completeButtonText}>선택 완료</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Toast 컴포넌트 */}
      <Toast message="최대 10개까지 선택할 수 있어요" visible={showToast} />
    </View>
  );
}

export default OnboardingDefaultScreen;
