import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import { RootStackParamList } from '~/shared/types/navigation';
import ArrowRightIcon from '~/shared/assets/icons/ic_arrow_right.svg';
import NailSetComponent from '~/features/nail-set/ui/NailSet';
import { NailSet, StyleGroup, StyleInfo } from '../types';

interface RecommendedNailSetsProps {
  styleGroups: StyleGroup[];
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainHome'>;
}

interface NailItemProps {
  nailSet: NailSet;
  styleInfo: StyleInfo;
  onPress: (nailSet: NailSet, styleInfo: StyleInfo) => void;
}

const NailSetSeparator = memo(() => <View style={styles.nailSetSeparator} />);

const NailItem = memo(({ nailSet, styleInfo, onPress }: NailItemProps) => (
  <TouchableOpacity
    style={styles.nailSetItem}
    onPress={() => onPress(nailSet, styleInfo)}
    activeOpacity={1}
  >
    <NailSetComponent nailImages={nailSet} />
  </TouchableOpacity>
));

function RecommendedNailSets({
  styleGroups,
  navigation,
}: RecommendedNailSetsProps) {
  // 스타일 클릭 핸들러
  const handleStylePress = useCallback(
    (styleId: number, styleName: string) => {
      navigation.navigate('NailSetFeedPage', {
        styleId,
        styleName: `${styleName}네일`,
      });
    },
    [navigation],
  );

  // 네일 세트 클릭 핸들러
  const handleNailSetPress = useCallback(
    (nailSet: NailSet, styleInfo: StyleInfo) => {
      const validStyleId =
        typeof styleInfo.id === 'number' && styleInfo.id > 0 ? styleInfo.id : 1;

      navigation.navigate('NailSetDetailPage', {
        nailSetId: nailSet.id,
        styleId: validStyleId,
        styleName: `${styleInfo.name}네일` || '추천 네일',
        isBookmarked: false,
      });
    },
    [navigation],
  );

  // renderItem 생성 함수
  const createRenderItem = useCallback(
    (styleInfo: StyleInfo) =>
      function ({ item }: ListRenderItemInfo<NailSet>) {
        return (
          <NailItem
            nailSet={item}
            styleInfo={styleInfo}
            onPress={handleNailSetPress}
          />
        );
      },
    [handleNailSetPress],
  );

  return (
    <View style={styles.container}>
      {styleGroups.map((styleGroup: StyleGroup) => (
        <View key={`style-${styleGroup.style.id}`} style={styles.styleSection}>
          <TouchableOpacity
            style={styles.styleHeader}
            onPress={() =>
              handleStylePress(styleGroup.style.id, styleGroup.style.name)
            }
            activeOpacity={1}
          >
            <Text style={styles.styleTitle}>
              {styleGroup.style.name}네일 보러가기
            </Text>
            <ArrowRightIcon
              width={scale(24)}
              height={scale(24)}
              color={colors.gray400}
            />
          </TouchableOpacity>

          <FlatList
            horizontal
            data={styleGroup.nailSets}
            renderItem={createRenderItem(styleGroup.style)}
            keyExtractor={item => `nail-set-${item.id}`}
            showsHorizontalScrollIndicator={false}
            removeClippedSubviews={false}
            contentContainerStyle={styles.nailSetList}
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
    marginLeft: scale(26),
    marginRight: scale(16),
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
