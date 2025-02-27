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
import { NailSetDetailResponse } from '~/shared/api/types';

/**
 * 네일 세트 컴포넌트 Props
 */
export interface NailSetProps {
  /**
   * 손가락별 네일 이미지
   * API 응답 데이터 또는 이미지 소스 배열 사용 가능
   */
  nailImages:
    | Omit<NailSetDetailResponse['data'], 'id'>
    | {
        thumb?: ImageSourcePropType;
        index?: ImageSourcePropType;
        middle?: ImageSourcePropType;
        ring?: ImageSourcePropType;
        pinky?: ImageSourcePropType;
      }
    | ImageSourcePropType[];

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
 * 각 손가락별 네일 이미지를 표시하며 크기와 간격이 자동으로 조정됩니다.
 * API 응답을 직접 전달하거나 커스텀 이미지를 사용할 수 있습니다.
 *
 * @example
 * // 기본 사용법
 * <NailSet nailImages={nailSetData} />
 *
 * // 클릭 이벤트와 커스텀 스타일
 * <NailSet
 *   nailImages={nailSetData}
 *   onPress={() => navigation.navigate('NailSetDetail', { id: 1 })}
 *   style={{ width: '90%', height: 200, backgroundColor: colors.white }}
 * />
 */
function NailSet({ nailImages, onPress, style }: NailSetProps) {
  // 네일팁 기본 크기와 위치 설정
  const nails = [
    { id: 1, name: 'thumb', width: 100, height: 160, paddingBottom: 0 },
    { id: 2, name: 'index', width: 80, height: 140, paddingBottom: 5 },
    { id: 3, name: 'middle', width: 80, height: 150, paddingBottom: 0 },
    { id: 4, name: 'ring', width: 75, height: 140, paddingBottom: 3 },
    { id: 5, name: 'pinky', width: 65, height: 110, paddingBottom: 14 },
  ];

  // 이미지 소스 가져오기 (API 응답, 객체, 배열 모두 지원)
  const getImageSource = (index: number, name: string): ImageSourcePropType => {
    const defaultImage = DEFAULT_IMAGES.nail;

    // 배열인 경우
    if (Array.isArray(nailImages)) {
      return nailImages[index] || defaultImage;
    }

    // API 응답 형식인 경우 (imageUrl 필드 확인)
    if (
      nailImages[name as keyof typeof nailImages] &&
      'imageUrl' in nailImages[name as keyof typeof nailImages]
    ) {
      const imageData = nailImages[name as keyof typeof nailImages] as {
        imageUrl: string;
      };
      return { uri: imageData.imageUrl };
    }

    // 일반 객체인 경우
    return nailImages[name as keyof typeof nailImages] || defaultImage;
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {nails.map((nail, index) => (
        <View
          key={nail.id}
          style={[styles.nailContainer, { paddingBottom: nail.paddingBottom }]}
        >
          <Image
            source={getImageSource(index, nail.name)}
            style={{
              width: nail.width,
              height: nail.height,
            }}
            resizeMode="contain"
          />
        </View>
      ))}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    backgroundColor: colors.gray50,
    borderRadius: 8,
    flexDirection: 'row',
    height: 180,
    justifyContent: 'center',
    paddingHorizontal: 10,
    width: '80%',
  },
  nailContainer: {
    alignItems: 'center',
    marginHorizontal: -15,
  },
});

export default NailSet;
