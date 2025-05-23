import {
  scale as scaleFunc,
  verticalScale as verticalScaleFunc,
  moderateScale,
} from 'react-native-size-matters';

// 디자인 시안 기준 크기 (피그마)
const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;

// 라이브러리 기본 가이드라인 값
const LIBRARY_WIDTH = 350;
const LIBRARY_HEIGHT = 680;

// 비율 조정 계수
const WIDTH_RATIO = LIBRARY_WIDTH / DESIGN_WIDTH;
const HEIGHT_RATIO = LIBRARY_HEIGHT / DESIGN_HEIGHT;

/**
 * 가로 방향 크기 스케일링
 * 피그마 디자인 시안(375px)에 맞게 조정된 scale 함수
 */
export function scale(size: number): number {
  return scaleFunc(size * WIDTH_RATIO);
}

/**
 * 세로 방향 크기 스케일링
 * 피그마 디자인 시안(812px)에 맞게 조정된 verticalScale 함수
 */
export function vs(size: number): number {
  return verticalScaleFunc(size * HEIGHT_RATIO);
}

/**
 * 폰트 크기와 같이 너무 크게 변하지 않아야 하는 요소에 사용
 * @param size 원래 크기
 * @param factor 스케일링 계수 (1이 기본값, 낮을수록 스케일링 정도가 작아짐)
 */
export function ms(size: number, factor: number = 1): number {
  return moderateScale(size * WIDTH_RATIO, factor);
}
