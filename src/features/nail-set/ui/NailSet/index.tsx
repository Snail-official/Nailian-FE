import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ImageSourcePropType,
  StyleProp,
} from 'react-native';
import { colors } from '~/shared/styles/design';

/**
 * 손가락별 네일 이미지 인터페이스
 */
export interface INailSet {
  id?: number;
  thumb: { imageUrl: string };
  index: { imageUrl: string };
  middle: { imageUrl: string };
  ring: { imageUrl: string };
  pinky: { imageUrl: string };
}

/**
 * 네일 세트 컴포넌트 Props
 */
export interface NailSetProps {
  /**
   * 손가락별 네일 이미지
   */
  nailImages: INailSet;

  /** 클릭 이벤트 핸들러 */
  onPress?: () => void;

  /**
   * 컨테이너 스타일
   */
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_IMAGES = {
  nail: require('../../../../shared/assets/images/nail_default.png'),
};

/**
 * 다섯 손가락의 네일 세트를 보여주는 컴포넌트
 *
 * 각 손가락별 네일 이미지를 표시하며, 모든 네일 팁이 잘 보이도록 배치됩니다.
 *
 * @example
 * // 기본 사용법
 * <NailSet nailImages={nailSetData} />
 *
 * // 클릭 이벤트와 커스텀 스타일
 * <NailSet
 *   nailImages={nailSetData}
 *   onPress={() => navigation.navigate('NailSetDetail', { id: 1 })}
 *   style={{ width: '90%', backgroundColor: colors.white }}
 * />
 */
function NailSet({ nailImages, onPress, style }: NailSetProps) {
  // 고정된 네일 크기 설정 - 손가락 비율과 마진 설정
  const nails = [
    { id: 1, name: 'thumb', width: 70, height: 68, margin: 0 },
    { id: 2, name: 'index', width: 50, height: 60, margin: -28 },
    { id: 3, name: 'middle', width: 55, height: 64, margin: -24 },
    { id: 4, name: 'ring', width: 50, height: 60, margin: -24 },
    { id: 5, name: 'pinky', width: 45, height: 54, margin: -22 },
  ];

  // 이미지 소스 가져오기
  const getImageSource = (fingerName: string): ImageSourcePropType => {
    if (!nailImages || !nailImages[fingerName as keyof typeof nailImages]) {
      return DEFAULT_IMAGES.nail;
    }

    const fingerData = nailImages[fingerName as keyof INailSet] as {
      imageUrl: string;
    };

    if (!fingerData || !fingerData.imageUrl) {
      return DEFAULT_IMAGES.nail;
    }

    return { uri: fingerData.imageUrl };
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.nailsRow}>
        {nails.map(nail => (
          <View
            key={nail.id}
            style={[styles.nailContainer, { marginLeft: nail.margin }]}
          >
            <Image
              source={getImageSource(nail.name)}
              style={{
                width: nail.width,
                height: nail.height,
              }}
              resizeMode="contain"
            />
          </View>
        ))}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: 4,
    height: 108,
    justifyContent: 'center',
    padding: 2,
    width: 160,
  },
  nailContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  nailsRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
});

export default NailSet;
