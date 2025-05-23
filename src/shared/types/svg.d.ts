/**
 * SVG 파일을 React 컴포넌트로 임포트하기 위한 타입 선언
 *
 * react-native-svg-transformer와 함께 사용됩니다.
 * 이 선언으로 .svg 파일을 React 컴포넌트처럼 import 할 수 있습니다.
 *
 * @example
 * import LogoIcon from '../assets/icons/logo.svg';
 * <LogoIcon width={24} height={24} />
 */
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';

  const content: React.FC<SvgProps>;
  export default content;
}
