import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, TextStyle } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import Gradient from '../Gradient';

/**
 * 공통 버튼 컴포넌트
 * 앱 전반에서 사용되는 버튼 컴포넌트입니다.
 * 크기와 색상에 따라 다양한 variant를 지원합니다.
 * @example
 * // 기본 보라색 버튼 (331x48)
 * <Button onPress={handlePress}>
 *   다음
 * </Button>
 * // 그라디언트가 적용된 보라색 버튼 (331x48)
 * <Button variant="primaryMediumGradient" onPress={handlePress}>
 *   시작하기
 * </Button>
 */
type ButtonVariant =
  | 'primaryMedium'
  | 'secondaryMedium'
  | 'primaryLarge'
  | 'secondaryLarge'
  | 'secondarySmall'
  | 'primaryMediumGradient'
  | 'secondaryMediumGradient'
  | 'kakaoMedium'
  | 'appleMedium'
  | 'googleMedium';

interface ButtonStyleProps {
  height: number;
  width: number;
  enabledColor: string;
  disabledColor: string;
  textStyle: TextStyle;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
}

const BUTTON_STYLES: Record<ButtonVariant, ButtonStyleProps> = {
  primaryMedium: {
    height: 48,
    width: 331,
    enabledColor: colors.purple500,
    disabledColor: colors.purple200,
    textStyle: typography.title2_SB,
    borderRadius: 8,
  },
  secondaryMedium: {
    height: 48,
    width: 331,
    enabledColor: colors.gray900,
    disabledColor: colors.gray300,
    textStyle: typography.title2_SB,
    borderRadius: 8,
  },
  primaryLarge: {
    height: 52,
    width: 375,
    enabledColor: colors.purple500,
    disabledColor: colors.purple200,
    textStyle: typography.title2_SB,
  },
  secondaryLarge: {
    height: 52,
    width: 375,
    enabledColor: colors.gray900,
    disabledColor: colors.gray100,
    textStyle: typography.title2_SB,
  },
  secondarySmall: {
    height: 33,
    width: 128,
    enabledColor: colors.gray900,
    disabledColor: colors.gray100,
    textStyle: typography.body2_SB,
    borderRadius: 4,
  },
  primaryMediumGradient: {
    height: 48,
    width: 331,
    enabledColor: colors.purple500,
    disabledColor: colors.purple200,
    textStyle: typography.title2_SB,
    borderRadius: 8,
  },
  secondaryMediumGradient: {
    height: 48,
    width: 331,
    enabledColor: colors.gray900,
    disabledColor: colors.gray300,
    textStyle: typography.title2_SB,
    borderRadius: 8,
  },
  kakaoMedium: {
    height: 48,
    width: 331,
    enabledColor: colors.kakaoYellow,
    disabledColor: colors.kakaoYellow,
    textStyle: typography.title2_SB,
    borderRadius: 8,
  },
  appleMedium: {
    height: 48,
    width: 331,
    enabledColor: colors.black,
    disabledColor: colors.black,
    textStyle: typography.title2_SB,
    borderRadius: 8,
  },
  googleMedium: {
    height: 48,
    width: 331,
    enabledColor: colors.white,
    disabledColor: colors.white,
    textStyle: typography.title2_SB,
    borderRadius: 8,
    borderColor: colors.borderGray,
    borderWidth: 1,
  },
};

interface ButtonProps {
  /** 버튼 내부 텍스트 */
  children: ReactNode;
  /** 버튼 클릭 핸들러 */
  onPress: () => void;
  /** 버튼 활성화 여부 */
  disabled: boolean;
  /** 로딩 상태 표시 여부 */
  loading: boolean;
  /** 버튼 스타일 variant */
  variant: ButtonVariant;
}

function Button({
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primaryMedium',
}: ButtonProps) {
  const variantStyle = BUTTON_STYLES[variant];
  const isGradientVariant = variant.includes('Gradient');

  const buttonContent = (
    <TouchableOpacity
      style={[
        styles.base,
        {
          height: variantStyle.height,
          width: variantStyle.width,
          backgroundColor:
            disabled || loading
              ? variantStyle.disabledColor
              : variantStyle.enabledColor,
          borderRadius: variantStyle.borderRadius ?? 0,
          borderColor: variantStyle.borderColor,
          borderWidth: variantStyle.borderWidth,
        },
      ]}
      disabled={disabled || loading}
      onPress={onPress}
    >
      {loading ? (
        <Text style={[styles.text, variantStyle.textStyle]}>저장 중...</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );

  return isGradientVariant ? (
    <Gradient>{buttonContent}</Gradient>
  ) : (
    buttonContent
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
  },
});

export default Button;
