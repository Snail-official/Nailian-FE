import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import ArrowRightIcon from '~/shared/assets/icons/ic_arrow_right.svg';
import NailSetComponent from '~/features/nail-set/ui/NailSet';
import { NailSet, StyleGroup, StyleInfo } from '../types';

interface RecommendedNailSetsProps {
  leftMargin: number;
  styleGroups: StyleGroup[];
  onStylePress: (styleId: number, styleName: string) => void;
  onNailSetPress: (nailSet: NailSet, style: StyleInfo) => void;
}

// 네일 아이템 컴포넌트 Props 인터페이스
interface NailItemProps {
  nailSet: NailSet;
  styleInfo: StyleInfo;
  onPress: (nailSet: NailSet, styleInfo: StyleInfo) => void;
}

// 구분선 컴포넌트
const NailSetSeparator = memo(() => <View style={styles.nailSetSeparator} />);

// 단일 네일 아이템 컴포넌트 (RecommendedNailSets 외부로 분리)
const NailItem = memo(({ nailSet, styleInfo, onPress }: NailItemProps) => (
  <TouchableOpacity
    style={styles.nailSetItem}
    onPress={() => onPress(nailSet, styleInfo)}
    activeOpacity={0.7}
  >
    <NailSetComponent nailImages={nailSet} />
  </TouchableOpacity>
));

// renderItem 생성 함수 (컴포넌트 외부로 분리)
const createRenderItem = (
  styleInfo: StyleInfo,
  onNailSetPress: (nailSet: NailSet, style: StyleInfo) => void,
) =>
  function ({ item }: ListRenderItemInfo<NailSet>) {
    return (
      <NailItem nailSet={item} styleInfo={styleInfo} onPress={onNailSetPress} />
    );
  };

function RecommendedNailSets({
  leftMargin,
  styleGroups,
  onStylePress,
  onNailSetPress,
}: RecommendedNailSetsProps) {
  return (
    <View style={styles.container}>
      {styleGroups.map((styleGroup: StyleGroup) => (
        <View key={`style-${styleGroup.style.id}`} style={styles.styleSection}>
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

          <FlatList
            horizontal
            data={styleGroup.nailSets}
            renderItem={createRenderItem(styleGroup.style, onNailSetPress)}
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

export default memo(RecommendedNailSets);
