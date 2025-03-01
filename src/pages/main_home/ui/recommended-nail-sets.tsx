import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { colors, typography } from '~/shared/styles/design';
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
  onStylePress: (style: { id: number; name: string }) => void;
  onNailSetPress: (nailSet: NailSet) => void;
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
  const renderNailSet = ({ item }: { item: NailSet }) => (
    <TouchableOpacity
      style={styles.nailSetItem}
      onPress={() => onNailSetPress(item)}
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
            onPress={() => onStylePress(styleGroup.style)}
          >
            <Text style={styles.styleTitle}>
              {styleGroup.style.name} 보러가기
            </Text>
            <ArrowRightIcon width={24} height={24} />
          </TouchableOpacity>

          {/* 네일 세트 목록 */}
          <FlatList
            horizontal
            data={styleGroup.nailSets}
            renderItem={renderNailSet}
            keyExtractor={item => `nail-set-${item.id}`}
            showsHorizontalScrollIndicator={false}
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
    marginBottom: 28,
    marginTop: 26,
  },
  nailSetItem: {
    marginRight: 0,
  },
  nailSetList: {
    alignItems: 'center',
    paddingRight: 8,
  },
  nailSetSeparator: {
    width: 8,
  },
  styleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    width: '100%',
  },
  styleSection: {
    marginBottom: 28,
  },
  styleTitle: {
    ...typography.title2_SB,
    color: colors.gray800,
  },
});

export default RecommendedNailSets;
