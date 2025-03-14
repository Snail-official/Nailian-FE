import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TextStyle,
  ImageSourcePropType,
} from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import Gradient from '../Gradient';
import NailAddButton from './variants/NailAddButton';
import FilterContentButton from './variants/FilterContentButton';

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
 * // 네일 추가 버튼
 * <Button
 *   variant="add_nail"
 *   onPress={handlePress}
 *   isSelected={isSelected}
 *   imageSource={selectedImage}
 *   onImageDelete={handleImageDelete}
 * />
 * // 필터 콘텐츠 버튼
 * <Button
 *   variant="filter_content"
 *   onPress={handlePress}
 *   isSelected={isSelected}
 *   imageSource={filterImage}
 *   label="프렌치"
 * />
 */
export type ButtonVariant =
  | 'primaryMedium'
  | 'secondaryMedium'
  | 'primaryLarge'
  | 'secondaryLarge'
  | 'secondarySmall'
  | 'primaryMediumGradient'
  | 'secondaryMediumGradient'
  | 'kakaoMedium'
  | 'appleMedium'
  | 'googleMedium'
  | 'primary_ar'
  | 'add_nail'
  | 'filter_content';

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

const BUTTON_STYLES: Record<
  Exclude<ButtonVariant, 'add_nail' | 'filter_content'>,
  ButtonStyleProps
> = {
  primaryMedium: {
    height: vs(48),
    width: scale(331),
    enabledColor: colors.purple500,
    disabledColor: colors.purple200,
    textStyle: typography.title2_SB,
    borderRadius: scale(8),
  },
  secondaryMedium: {
    height: vs(48),
    width: scale(331),
    enabledColor: colors.gray900,
    disabledColor: colors.gray300,
    textStyle: typography.title2_SB,
    borderRadius: scale(8),
  },
  primaryLarge: {
    height: vs(52),
    width: scale(375),
    enabledColor: colors.purple500,
    disabledColor: colors.purple200,
    textStyle: typography.title2_SB,
  },
  secondaryLarge: {
    height: vs(52),
    width: scale(375),
    enabledColor: colors.gray900,
    disabledColor: colors.gray100,
    textStyle: typography.title2_SB,
  },
  secondarySmall: {
    height: vs(44),
    width: scale(144),
    enabledColor: colors.gray900,
    disabledColor: colors.gray100,
    textStyle: typography.body2_SB,
    borderRadius: scale(8),
  },
  primaryMediumGradient: {
    height: vs(48),
    width: scale(331),
    enabledColor: colors.purple500,
    disabledColor: colors.purple200,
    textStyle: typography.title2_SB,
    borderRadius: scale(8),
  },
  secondaryMediumGradient: {
    height: vs(48),
    width: scale(331),
    enabledColor: colors.gray900,
    disabledColor: colors.gray300,
    textStyle: typography.title2_SB,
    borderRadius: scale(8),
  },
  kakaoMedium: {
    height: vs(48),
    width: scale(331),
    enabledColor: colors.kakaoYellow,
    disabledColor: colors.kakaoYellow,
    textStyle: typography.title2_SB,
    borderRadius: scale(8),
  },
  appleMedium: {
    height: vs(48),
    width: scale(331),
    enabledColor: colors.black,
    disabledColor: colors.black,
    textStyle: typography.title2_SB,
    borderRadius: scale(8),
  },
  googleMedium: {
    height: vs(48),
    width: scale(331),
    enabledColor: colors.white,
    disabledColor: colors.white,
    textStyle: typography.title2_SB,
    borderRadius: scale(8),
    borderColor: colors.borderGray,
    borderWidth: scale(1),
  },
  primary_ar: {
    height: vs(42),
    width: scale(179),
    enabledColor: colors.purple500,
    disabledColor: colors.purple200,
    textStyle: typography.body2_SB,
    borderRadius: scale(24),
  },
};

export interface BaseButtonProps {
  /** 버튼 내부 텍스트 */
  children?: ReactNode;
  /** 버튼 클릭 핸들러 */
  onPress: () => void;
  /** 버튼 활성화 여부 */
  disabled?: boolean;
  /** 로딩 상태 표시 여부 */
  loading?: boolean;
  /** 버튼 스타일 variant */
  variant?: ButtonVariant;
  /** 선택 상태 (특수 버튼에서 사용) */
  isSelected?: boolean;
}

export interface NailAddButtonProps extends BaseButtonProps {
  /** 네일 추가 버튼의 이미지 */
  imageSource?: ImageSourcePropType;
  /** 이미지 삭제 핸들러 */
  onImageDelete?: () => void;
}

export interface FilterContentButtonProps extends BaseButtonProps {
  /** 필터 버튼의 이미지 */
  imageSource?: ImageSourcePropType;
  /** 필터 버튼의 라벨 */
  label?: string;
}

function Button({
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primaryMedium',
  isSelected = false,
  ...props
}: BaseButtonProps & NailAddButtonProps & FilterContentButtonProps) {
  // 네일 추가 버튼 렌더링
  if (variant === 'add_nail') {
    return (
      <NailAddButton
        onPress={onPress}
        disabled={disabled}
        isSelected={isSelected}
        imageSource={props.imageSource}
        onImageDelete={props.onImageDelete}
      />
    );
  }

  // 필터 콘텐츠 버튼 렌더링
  if (variant === 'filter_content') {
    return (
      <FilterContentButton
        onPress={onPress}
        disabled={disabled}
        isSelected={isSelected}
        imageSource={props.imageSource}
        label={props.label}
      />
    );
  }

  // 기본 버튼 로직
  const variantStyle =
    BUTTON_STYLES[
      variant as Exclude<ButtonVariant, 'add_nail' | 'filter_content'>
    ];
  const isGradientVariant = variant.includes('Gradient');
  const isSecondarySmall = variant === 'secondarySmall';

  // 기존 버튼 렌더링 로직
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
          ...(isSecondarySmall ? { padding: scale(12) } : {}),
        },
      ]}
      disabled={disabled}
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
