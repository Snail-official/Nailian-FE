import React, { ReactNode, useCallback, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  StyleProp,
  ViewStyle,
  ImageStyle,
  ActivityIndicator,
} from 'react-native';
import { colors } from '~/shared/styles/design';
import ViewShot, { captureRef } from 'react-native-view-shot';

// 화면 크기 가져오기
const { height, width } = Dimensions.get('window');

interface LightboxProps {
  children: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle | ImageStyle>;
  backgroundOpacity?: number;
}

interface ViewshotLightboxProps extends Omit<LightboxProps, 'children'> {
  viewShotContent: ReactNode;
  customLightboxContent?: ReactNode;
  onCapture?: (uri: string) => void;
  captureQuality?: number;
}

/**
 * 라이트박스 컴포넌트
 *
 * 이미지나 기타 콘텐츠를 전체 화면으로 확대해서 보여주는 공용 컴포넌트입니다.
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
export function Lightbox({
  visible,
  onClose,
  children,
  containerStyle,
  contentStyle,
  backgroundOpacity = 0.85,
}: {
  visible: boolean;
  onClose: () => void;
} & LightboxProps) {
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

/**
 * ViewShot과 통합된 라이트박스 컴포넌트
 *
 * 지정된 콘텐츠를 ViewShot으로 캡처하고 라이트박스에 표시합니다.
 *
 * @param {ReactNode} viewShotContent - 캡처할 콘텐츠
 * @param {ReactNode} customLightboxContent - 라이트박스에 표시할 커스텀 콘텐츠 (옵션)
 * @param {(uri: string) => void} onCapture - 캡처 완료 후 콜백 (옵션)
 * @param {StyleProp<ViewStyle>} containerStyle - 컨테이너 스타일 (선택 사항)
 * @param {StyleProp<ViewStyle | ImageStyle>} contentStyle - 콘텐츠 스타일 (선택 사항)
 * @param {number} backgroundOpacity - 배경 불투명도 (선택 사항, 기본값: 0.85)
 * @param {number} captureQuality - 캡처 이미지 품질 (선택 사항, 기본값: 1)
 *
 * @returns {JSX.Element} ViewShot 래핑 컴포넌트와 라이트박스
 */
export default function ViewshotLightbox({
  viewShotContent,
  customLightboxContent,
  onCapture,
  containerStyle,
  contentStyle,
  backgroundOpacity = 0.85,
  captureQuality = 1,
}: ViewshotLightboxProps) {
  // 라이트박스 관련 상태
  const [isLightboxVisible, setIsLightboxVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const viewShotRef = useRef<ViewShot | null>(null);

  /**
   * 콘텐츠를 캡처하고 라이트박스로 표시하는 함수
   */
  const captureAndShowLightbox = useCallback(() => {
    if (viewShotRef.current) {
      captureRef(viewShotRef, { quality: captureQuality }).then(uri => {
        setCapturedImage(uri);
        setIsLightboxVisible(true);
        onCapture?.(uri);
      });
    }
  }, [captureQuality, onCapture]);

  /**
   * 라이트박스 닫기
   */
  const closeLightbox = useCallback(() => {
    setIsLightboxVisible(false);
  }, []);

  return (
    <>
      <TouchableOpacity activeOpacity={0.9} onPress={captureAndShowLightbox}>
        <ViewShot ref={viewShotRef} options={{ quality: captureQuality }}>
          {viewShotContent}
        </ViewShot>
      </TouchableOpacity>

      <Lightbox
        visible={isLightboxVisible}
        onClose={closeLightbox}
        containerStyle={containerStyle}
        contentStyle={contentStyle}
        backgroundOpacity={backgroundOpacity}
      >
        {customLightboxContent ||
          (capturedImage && <LightboxImage uri={capturedImage} />)}
      </Lightbox>
    </>
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
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={styles.imageContainer}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.white} />
        </View>
      )}
      <Image
        source={{ uri }}
        style={[styles.image, style]}
        resizeMode="contain"
        onLoad={() => setIsLoading(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.black,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10000,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  image: {
    height: height * 1.5,
    resizeMode: 'contain',
    width: width * 1.5,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
