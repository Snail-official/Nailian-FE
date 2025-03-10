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
import { INailSet } from '~/shared/types/nail-set';

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

  /**
   * 네일 세트 크기
   * 'small': 기본 크기 (160x108)
   * 'large': 상세 화면용 큰 크기 (331x204)
   */
  size?: 'small' | 'large';
}

const DEFAULT_IMAGES = {
  nail: require('../../../../shared/assets/images/nail_default.png'),
};

/**
 * 네일 세트 컴포넌트
 *
 * 5개 손가락(엄지, 검지, 중지, 약지, 소지)에 대한 네일 이미지를 표시하는 컴포넌트입니다.
 * 썸네일 형태(small)와 상세 화면용 큰 형태(large)를 지원합니다.
 * 네일 이미지가 연결되어 하나의 세트로 표시되며, 클릭 이벤트를 처리할 수 있습니다.
 *
 * @param {NailSetProps} props - 네일 세트 컴포넌트 속성
 * @param {INailSet} props.nailImages - 손가락별 네일 이미지 정보
 * @param {() => void} [props.onPress] - 클릭 이벤트 핸들러
 * @param {StyleProp<ViewStyle>} [props.style] - 컨테이너에 적용할 추가 스타일
 * @param {'small' | 'large'} [props.size='small'] - 네일 세트 크기 ('small': 기본, 'large': 상세 화면용)
 * @returns {JSX.Element} 렌더링된 네일 세트 컴포넌트
 *
 * @example
 * // 기본 사용법 (썸네일 형태)
 * <NailSet nailImages={nailSet} onPress={() => handlePress(nailSet)} />
 *
 * @example
 * // 상세 화면용 큰 형태
 * <NailSet
 *  nailImages={nailSet}
 *  size="large"
 * />
 */
function NailSet({ nailImages, onPress, style, size = 'small' }: NailSetProps) {
  // 크기에 따른 스케일 팩터 계산
  const scaleFactor = size === 'large' ? 2.06875 : 1; // 331/160 = 2.06875

  // 고정된 네일 크기 설정 - 손가락 비율과 마진 설정
  const defaultNails = [
    { id: 1, name: 'thumb', width: 70, height: 68, margin: 0 },
    { id: 2, name: 'index', width: 50, height: 60, margin: -28 },
    { id: 3, name: 'middle', width: 55, height: 64, margin: -24 },
    { id: 4, name: 'ring', width: 50, height: 60, margin: -24 },
    { id: 5, name: 'pinky', width: 45, height: 54, margin: -22 },
  ];

  // 크기에 따라 조정된 네일 설정 계산
  const nails = defaultNails.map(nail => ({
    ...nail,
    width: Math.round(nail.width * scaleFactor),
    height: Math.round(nail.height * scaleFactor),
    margin: Math.round(nail.margin * scaleFactor),
  }));

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
      style={[
        styles.container,
        size === 'large' ? styles.largeContainer : styles.smallContainer,
        style,
      ]}
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
    justifyContent: 'center',
    padding: 2,
  },
  largeContainer: {
    height: 204,
    width: 331,
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
  smallContainer: {
    height: 108,
    width: 160,
  },
});

export default NailSet;
