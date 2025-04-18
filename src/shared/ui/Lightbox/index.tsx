import React, { ReactNode } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  StyleProp,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { colors } from '~/shared/styles/design';

// 화면 크기 가져오기
const { height, width } = Dimensions.get('window');

interface LightboxProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle | ImageStyle>;
  backgroundOpacity?: number;
}

/**
 * 라이트박스 컴포넌트
 *
 * 이미지나 기타 콘텐츠를 전체 화면으로 확대해서 보여주는 공용 컴포넌트입니다.
 * ViewShot으로 캡처한 이미지나 일반 이미지, 또는 다른 React 컴포넌트를 표시할 수 있습니다.
 *
 * @param {boolean} visible - 라이트박스 표시 여부
 * @param {() => void} onClose - 라이트박스 닫기 이벤트 핸들러
 * @param {ReactNode} children - 라이트박스에 표시할 콘텐츠
 * @param {StyleProp<ViewStyle>} containerStyle - 컨테이너 스타일 (선택 사항)
 * @param {StyleProp<ViewStyle | ImageStyle>} contentStyle - 콘텐츠 스타일 (선택 사항)
 * @param {number} backgroundOpacity - 배경 불투명도 (선택 사항, 기본값: 0.85)
 *
 * @returns {JSX.Element | null} 라이트박스 컴포넌트 또는 visible이 false인 경우 null
 */
export default function Lightbox({
  visible,
  onClose,
  children,
  containerStyle,
  contentStyle,
  backgroundOpacity = 0.85,
}: LightboxProps) {
  if (!visible) return null;

  return (
    <TouchableOpacity
      style={[styles.container, { opacity: backgroundOpacity }, containerStyle]}
      activeOpacity={1}
      onPress={onClose}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </TouchableOpacity>
  );
}

// 라이트박스용 이미지 컴포넌트 - 자주 사용하는 패턴
export function LightboxImage({
  uri,
  style,
}: {
  uri: string;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={{ uri }}
      style={[styles.image, style]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black,
    height,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10000,
  },
  content: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  image: {
    height: height * 1.5,
    width: width * 1.5,
  },
});
