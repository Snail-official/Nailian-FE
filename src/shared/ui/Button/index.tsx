import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TextStyle,
  View,
  Image,
  ImageSourcePropType,
  ViewStyle,
} from 'react-native';
import PlusIcon from '~/shared/assets/icons/ic_plus.svg';
import CheckIcon from '~/shared/assets/icons/ic_check.svg';
import DeleteIcon from '~/shared/assets/icons/ic_delete.svg';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
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
 * // 네일 추가 버튼
 * <Button
 *   variant="add_nail"
 *   onPress={handlePress}
 *   isSelected={isSelected}
 *   imageSource={selectedImage}
 *   onImageDelete={handleImageDelete}
 * />
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
  | 'googleMedium'
  | 'primary_ar'
  | 'add_nail';

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
  add_nail: {
    height: 87,
    width: 58,
    enabledColor: colors.white,
    disabledColor: colors.white,
    textStyle: typography.body2_SB,
    borderRadius: 4,
    borderColor: colors.gray200,
    borderWidth: 1,
  },
};

interface ButtonProps {
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
  /** 네일 추가 버튼의 선택 상태 (add_nail variant에서만 사용) */
  isSelected?: boolean;
  /** 네일 추가 버튼의 이미지 (add_nail variant에서만 사용) */
  imageSource?: ImageSourcePropType;
  /** 이미지 삭제 핸들러 (add_nail variant에서만 사용) */
  onImageDelete?: () => void;
}

interface NailButtonStyle {
  borderStyle: 'dashed' | 'solid';
  borderColor: string;
  backgroundColor: string;
}

function Button({
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primaryMedium',
  isSelected = false,
  imageSource,
  onImageDelete,
}: ButtonProps) {
  const variantStyle = BUTTON_STYLES[variant];
  const isGradientVariant = variant.includes('Gradient');
  const isSecondarySmall = variant === 'secondarySmall';
  const isNailAddButton = variant === 'add_nail';

  // 네일 추가 버튼 렌더링 로직
  if (isNailAddButton) {
    // 네일 추가 버튼의 상태에 따른 스타일 및 아이콘 결정
    const hasImage = !!imageSource;

    // 기본 네일 버튼 스타일
    const nailButtonStyle: NailButtonStyle = {
      borderStyle: 'dashed',
      borderColor: colors.gray200,
      backgroundColor: colors.white,
    };

    let iconComponent: ReactNode = <PlusIcon width={12} height={12} />;

    // 2. 선택 상태 (이미지 없음, 선택됨)
    if (isSelected && !hasImage) {
      nailButtonStyle.borderStyle = 'solid';
      nailButtonStyle.borderColor = colors.gray650;
      nailButtonStyle.backgroundColor = colors.white;
      iconComponent = <CheckIcon width={18} height={18} />;
    }

    // 3. 이미지 추가 상태 (이미지 있음, 선택되지 않음)
    if (hasImage && !isSelected) {
      nailButtonStyle.borderStyle = 'solid';
      nailButtonStyle.borderColor = colors.gray200;
      nailButtonStyle.backgroundColor = colors.gray50;
      iconComponent = null;
    }

    // 4. 이미지 선택 상태 (이미지 있음, 선택됨)
    if (hasImage && isSelected) {
      nailButtonStyle.borderStyle = 'solid';
      nailButtonStyle.borderColor = colors.gray650;
      nailButtonStyle.backgroundColor = colors.gray50;
      iconComponent = null;
    }

    // 네일 버튼 스타일 적용
    const buttonStyles: ViewStyle = {
      ...styles.nailAddButton,
      borderStyle: nailButtonStyle.borderStyle,
      borderColor: nailButtonStyle.borderColor,
      backgroundColor: nailButtonStyle.backgroundColor,
    };

    return (
      <TouchableOpacity
        style={buttonStyles}
        onPress={onPress}
        disabled={disabled}
      >
        {hasImage ? (
          <View style={styles.imageContainer}>
            <Image
              source={imageSource}
              style={[styles.nailImage, isSelected && styles.selectedNailImage]}
              resizeMode="cover"
            />
            {isSelected && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={onImageDelete}
                hitSlop={{ top: 3, right: 8, bottom: 3, left: 8 }}
              >
                <DeleteIcon width={20} height={20} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          iconComponent
        )}
      </TouchableOpacity>
    );
  }

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
  deleteButton: {
    position: 'absolute',
    right: 2,
    top: 2,
  },
  imageContainer: {
    height: '100%',
    width: '100%',
  },
  nailAddButton: {
    alignItems: 'center',
    aspectRatio: 2 / 3,
    borderRadius: 4,
    borderWidth: 1,
    height: 87,
    justifyContent: 'center',
    width: 58,
  },
  nailImage: {
    borderRadius: 4,
    height: '100%',
    width: '100%',
  },
  selectedNailImage: {
    opacity: 0.5,
  },
  text: {
    color: colors.white,
  },
});

export default Button;
