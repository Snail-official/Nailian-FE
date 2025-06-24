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
import { scale } from '~/shared/lib/responsive';
import { INailSet } from '~/shared/types/nail-set';

// 네일 세트 컴포넌트 Props
export interface NailSetProps {
  // 손가락별 네일 이미지
  nailImages: INailSet;

  // 클릭 이벤트 핸들러
  onPress?: () => void;

  // 컨테이너 스타일
  style?: StyleProp<ViewStyle>;

  // 네일 세트 크기
  // 'small': 기본 크기 (160x108)
  // 'large': 상세 화면용 큰 크기 (331x204)
  size?: 'small' | 'large';
}

// 네일 세트 컴포넌트
function NailSet({ nailImages, onPress, style, size = 'small' }: NailSetProps) {
  // 크기에 따른 스케일 팩터 계산
  const scaleFactor = size === 'large' ? 2.06875 : 1; // 331/160 = 2.06875

  // 고정된 네일 크기 설정 - 손가락 비율과 마진 설정
  const defaultNails = [
    {
      id: 1,
      name: 'thumb',
      width: scale(80),
      height: scale(78),
      x: scale(-23),
      y: scale(6.3),
    },
    {
      id: 2,
      name: 'index',
      width: scale(65),
      height: scale(64),
      x: scale(12),
      y: scale(18),
    },
    {
      id: 3,
      name: 'middle',
      width: scale(65),
      height: scale(64),
      x: scale(37),
      y: scale(18),
    },
    {
      id: 4,
      name: 'ring',
      width: scale(65),
      height: scale(64),
      x: scale(62),
      y: scale(18),
    },
    {
      id: 5,
      name: 'pinky',
      width: scale(65),
      height: scale(64),
      x: scale(87),
      y: scale(18),
    },
  ];

  // 크기에 따라 조정된 네일 설정 계산
  const nails = defaultNails.map(nail => ({
    ...nail,
    width: Math.round(nail.width * scaleFactor),
    height: Math.round(nail.height * scaleFactor),
    x: Math.round(nail.x * scaleFactor),
    y: Math.round(nail.y * scaleFactor),
  }));

  // 이미지 소스 가져오기
  const getImageSource = (fingerName: string): ImageSourcePropType => {
    if (!nailImages || !nailImages[fingerName as keyof typeof nailImages]) {
      throw new Error(`네일 이미지가 없습니다: ${fingerName}`);
    }

    const fingerData = nailImages[fingerName as keyof INailSet] as {
      imageUrl: string;
    };

    if (!fingerData || !fingerData.imageUrl) {
      throw new Error(`네일 이미지 URL이 없습니다: ${fingerName}`);
    }

    return { uri: fingerData.imageUrl };
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.container,
        size === 'large' ? styles.largeContainer : styles.smallContainer,
        style,
      ]}
      onPress={onPress}
      activeOpacity={1}
    >
      <View style={styles.nailsContainer}>
        {nails.map(nail => (
          <View
            key={nail.id}
            style={[
              styles.nailContainer,
              {
                height: scale(nail.height),
                left: scale(nail.x),
                top: scale(nail.y),
                width: scale(nail.width),
              },
            ]}
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
    justifyContent: 'center',
    padding: scale(2),
  },
  largeContainer: {
    height: scale(204),
    width: scale(331),
  },
  nailContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  nailsContainer: {
    height: '100%',
    position: 'relative',
    width: '100%',
  },
  smallContainer: {
    height: scale(108),
    width: scale(160),
  },
});

export default NailSet;
