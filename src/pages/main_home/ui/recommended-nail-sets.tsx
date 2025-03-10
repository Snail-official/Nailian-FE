import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import ArrowRightIcon from '~/shared/assets/icons/ic_arrow_right.svg';
import NailSet from '~/features/nail-set/ui/NailSet';

// 네일 세트 인터페이스 정의
interface NailSet {
  id: number;
  thumb: { imageUrl: string };
  index: { imageUrl: string };
  middle: { imageUrl: string };
  ring: { imageUrl: string };
  pinky: { imageUrl: string };
}

// 스타일 그룹 인터페이스 정의
interface StyleGroup {
  style: {
    id: number;
    name: string;
  };
  nailSets: NailSet[];
}

interface RecommendedNailSetsProps {
  leftMargin: number;
  nailSets: StyleGroup[];
  onStylePress: (styleId: number, styleName: string) => void;
  onNailSetPress: (
    nailSet: NailSet,
    style: { id: number; name: string },
  ) => void;
}

// 구분선 컴포넌트
function NailSetSeparator() {
  return <View style={styles.nailSetSeparator} />;
}

function RecommendedNailSets({
  leftMargin,
  nailSets,
  onStylePress,
  onNailSetPress,
}: RecommendedNailSetsProps) {
  // 네일 세트 렌더링 함수
  const renderNailSet = (
    {
      item,
    }: {
      item: NailSet;
    },
    styleInfo: { id: number; name: string },
  ) => (
    <TouchableOpacity
      style={styles.nailSetItem}
      onPress={() => onNailSetPress(item, styleInfo)}
    >
      <NailSet nailImages={item} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {nailSets.map(styleGroup => (
        <View key={`style-${styleGroup.style.id}`} style={styles.styleSection}>
          {/* 스타일 헤더 */}
          <TouchableOpacity
            style={[styles.styleHeader, { paddingHorizontal: leftMargin }]}
            onPress={() =>
              onStylePress(styleGroup.style.id, styleGroup.style.name)
            }
          >
            <Text style={styles.styleTitle}>
              {styleGroup.style.name} 보러가기
            </Text>
            <ArrowRightIcon width={scale(24)} height={scale(24)} />
          </TouchableOpacity>

          {/* 네일 세트 목록 */}
          <FlatList
            horizontal
            data={styleGroup.nailSets}
            renderItem={itemInfo => renderNailSet(itemInfo, styleGroup.style)}
            keyExtractor={item => `nail-set-${item.id}`}
            showsHorizontalScrollIndicator={false}
            removeClippedSubviews={false}
            contentContainerStyle={[
              styles.nailSetList,
              { paddingLeft: leftMargin },
            ]}
            ItemSeparatorComponent={NailSetSeparator}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: vs(28),
    marginTop: vs(26),
  },
  nailSetItem: {
    marginRight: 0,
  },
  nailSetList: {
    alignItems: 'center',
    paddingRight: scale(8),
  },
  nailSetSeparator: {
    width: scale(8),
  },
  styleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(16),
    width: '100%',
  },
  styleSection: {
    marginBottom: vs(28),
  },
  styleTitle: {
    ...typography.title2_SB,
    color: colors.gray800,
  },
});

export default RecommendedNailSets;
