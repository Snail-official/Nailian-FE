import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { colors } from '~/shared/styles/design';
import { TabBarHeader } from '~/shared/ui/TabBar';
import { fetchNailSetFeed } from '~/entities/nail-set/api';
import NailSet from '../NailSet';

/**
 * 네일 세트 UI 레이아웃 상수
 */
/** 네일 세트 컴포넌트의 고정 너비 (px) */
const NAIL_SET_WIDTH = 160;
/** 네일 세트 사이의 수평 간격 (px) */
const HORIZONTAL_SPACING = 12;
/** 두 네일 세트의 총 너비 (두 컴포넌트 + 간격) */
const TOTAL_NAIL_SETS_WIDTH = NAIL_SET_WIDTH * 2 + HORIZONTAL_SPACING;

/**
 * 네일 세트 데이터 인터페이스
 * 각 손가락에 대한 네일 이미지 정보를 포함합니다.
 */
export interface INailSet {
  /** 네일 세트 고유 ID */
  id: number;
  /** 엄지 손가락 네일 이미지 */
  thumb: { imageUrl: string };
  /** 검지 손가락 네일 이미지 */
  index: { imageUrl: string };
  /** 중지 손가락 네일 이미지 */
  middle: { imageUrl: string };
  /** 약지 손가락 네일 이미지 */
  ring: { imageUrl: string };
  /** 소지 손가락 네일 이미지 */
  pinky: { imageUrl: string };
}

/**
 * 네일 세트 리스트 컴포넌트 Props
 */
interface NailSetListProps {
  /**
   * 위젯 표시 여부
   * true이면 모달이 표시됩니다.
   */
  visible: boolean;

  /**
   * 스타일 정보
   * 네일 세트를 필터링하는 데 사용됩니다.
   */
  style: {
    id: number;
    name: string;
  };

  /**
   * 네일 세트 클릭 핸들러
   * 네일 세트 클릭 시 호출됩니다.
   * @param nailSet 클릭된 네일 세트 객체
   */
  onNailSetPress?: (nailSet: INailSet) => void;

  /**
   * 닫기 버튼 클릭 핸들러
   * 사용자가 모달을 닫을 때 호출됩니다.
   */
  onClose: () => void;
}

/**
 * 네일 세트 리스트 컴포넌트
 *
 * 네일 세트를 2열 그리드로 보여주는 모달 컴포넌트입니다.
 * 무한 스크롤을 지원하며, 스타일별로 네일 세트를 필터링합니다.
 *
 * @example
 * <NailSetList
 *   visible={isVisible}
 *   style={{ id: 1, name: 'TREND' }}
 *   onNailSetPress={(nailSet) => console.log('네일 세트 클릭:', nailSet.id)}
 *   onClose={() => setIsVisible(false)}
 * />
 */
function NailSetList({
  visible,
  style,
  onNailSetPress,
  onClose,
}: NailSetListProps) {
  /** 네일 세트 데이터 배열 */
  const [nailSets, setNailSets] = useState<INailSet[]>([]);
  /** 현재 페이지 번호 (페이지네이션) */
  const [currentPage, setCurrentPage] = useState(1);
  /** 로딩 상태 */
  const [isLoading, setIsLoading] = useState(false);
  /** 더 불러올 데이터가 있는지 여부 */
  const [hasMoreData, setHasMoreData] = useState(true);
  /** 한 페이지당 가져올 아이템 수 */
  const pageSize = 10;

  /**
   * 스타일별 네일 세트 데이터 가져오기
   *
   * @param page 가져올 페이지 번호
   * @param reset 이전 데이터를 초기화할지 여부
   */
  const fetchNailSets = useCallback(
    async (page: number, reset: boolean = false) => {
      // 이미 로딩 중이거나 더 불러올 데이터가 없으면 중단
      if (isLoading || (!hasMoreData && !reset)) return;

      setIsLoading(true);
      try {
        // API 호출
        const response = await fetchNailSetFeed({
          style,
          page,
          size: pageSize,
        });

        if (response.data) {
          // 페이지네이션 응답에서 데이터 배열 추출
          const newNailSets = response.data.data || [];

          // 데이터 설정 (초기화 또는 추가)
          if (reset) {
            setNailSets(newNailSets);
          } else {
            setNailSets(prev => [...prev, ...newNailSets]);
          }

          // 더 불러올 데이터가 있는지 확인
          setHasMoreData(newNailSets.length === pageSize);
        }
      } catch (err) {
        console.error('네일 세트 피드 불러오기 실패:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, hasMoreData, style, pageSize],
  );

  /**
   * 컴포넌트 마운트 또는 스타일 변경 시 데이터 초기화 및 로드
   */
  useEffect(() => {
    if (visible && style) {
      setCurrentPage(1);
      setHasMoreData(true);
      fetchNailSets(1, true);
    }
  }, [visible, style, fetchNailSets]);

  /**
   * 스크롤 끝에 도달했을 때 추가 데이터 로드
   * 무한 스크롤 구현에 사용됩니다.
   */
  const handleLoadMore = () => {
    if (!isLoading && hasMoreData) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchNailSets(nextPage);
    }
  };

  /**
   * 로딩 표시기 렌더링
   * 데이터를 불러오는 중일 때 화면 하단에 표시됩니다.
   */
  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={colors.purple500} />
      </View>
    );
  };

  /**
   * 네일 세트 렌더링 함수
   * FlatList의 renderItem 속성에 사용됩니다.
   *
   * @param item 렌더링할 네일 세트 객체
   */
  const renderNailSet = ({ item }: { item: INailSet }) => (
    <TouchableOpacity
      style={styles.nailSetItem}
      onPress={() => onNailSetPress?.(item)}
      activeOpacity={0.8}
    >
      <NailSet nailImages={item} />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* 헤더 */}
        <TabBarHeader title={style?.name || ''} onBack={onClose} />

        {/* 중앙 정렬을 위한 감싸는 컨테이너 */}
        <View style={styles.centerContainer}>
          {/* 네일 세트 그리드 */}
          <FlatList
            data={nailSets}
            renderItem={renderNailSet}
            keyExtractor={item => `nail-set-${item.id}`}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
            contentContainerStyle={styles.listContent}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
          />
        </View>
      </View>
    </Modal>
  );
}

/**
 * 컴포넌트 스타일 정의
 */
const styles = StyleSheet.create({
  /** 중앙 정렬 컨테이너 */
  centerContainer: {
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  /** 전체 컨테이너 스타일 */
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  /** 리스트 콘텐츠 스타일 */
  listContent: {
    paddingVertical: 12,
  },
  /** 로딩 인디케이터 컨테이너 스타일 */
  loaderContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  /** 개별 네일 세트 아이템 스타일 */
  nailSetItem: {
    marginBottom: 11, // 수직 간격 11px
    width: NAIL_SET_WIDTH,
  },
  /** 네일 세트 행 스타일 - 간격 설정 */
  row: {
    gap: HORIZONTAL_SPACING, // 수평 간격 12px
    width: TOTAL_NAIL_SETS_WIDTH,
  },
});

export default NailSetList;
