import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { FrameLayout } from './types';

// 프레임 레이아웃 계산 훅
export function useFrameLayout(): FrameLayout {
  const { width, height } = Dimensions.get('window');

  const [frameLayout, setFrameLayout] = useState<FrameLayout>({
    top: height * 0.2,
    bottom: height * 0.2,
    left: width * 0.15,
    right: width * 0.15,
  });

  useEffect(() => {
    const frameTop = Math.max(100, height * 0.1);
    const frameBottom = Math.max(100, height * 0.15);
    const frameSide = Math.max(60, width * 0.1);

    setFrameLayout({
      top: frameTop,
      bottom: frameBottom,
      left: frameSide,
      right: frameSide,
    });
  }, [width, height]);

  return frameLayout;
}
