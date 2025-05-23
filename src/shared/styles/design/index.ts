import { ViewStyle } from 'react-native';
import { scale, vs, ms } from '~/shared/lib/responsive';

/**
 * 공통 스타일 정의
 *
 * 앱 전반에서 사용되는 색상, 타이포그래피, 간격, 공통 스타일을 정의합니다.
 */

/** 색상 팔레트 */
export const colors = {
  // Gray Scale
  gray850: '#131313',
  gray800: '#1F1F1F',
  gray750: '#303030',
  gray700: '#424242',
  gray650: '#575757',
  gray600: '#737373',
  gray500: '#A6A6A6',
  gray400: '#C5C5C5',
  gray300: '#D6D6D6',
  gray200: '#E5E5E5',
  gray100: '#F5F5F5',
  gray50: '#FAFAFA',
  white: '#FFFFFF',
  // Primary Color
  purple500: '#CD19FF',
  purple200: '#F5D0FF',
  // Sub Color
  gray900: '#111111',
  // Semantic Color
  warn_red: '#FF3D40',
  // Toast Color
  toast_black: '#000000', // Opacity: 80%
  // Legacy colors (keeping for backward compatibility)
  black: '#000000',
  borderGray: '#E5E5E5',
  kakaoYellow: '#FEE500',
} as const;

/** 타이포그래피 스타일 */
export const typography = {
  head1_B: {
    fontFamily: 'Pretendard-Bold',
    fontSize: ms(22),
    lineHeight: ms(33), // 150%
  },
  head2_B: {
    fontFamily: 'Pretendard-Bold',
    fontSize: ms(20),
    lineHeight: ms(30), // 150%
  },
  head3_SB: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: ms(20),
    lineHeight: ms(30), // 150%
    letterSpacing: -0.4,
  },
  title1_SB: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: ms(18),
    lineHeight: ms(27), // 150%
  },
  title2_SB: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: ms(16),
    lineHeight: ms(24), // 150%
  },
  body1_B: {
    fontFamily: 'Pretendard-Bold',
    fontSize: ms(14),
    lineHeight: ms(21), // 150%
    letterSpacing: -0.14,
  },
  body2_SB: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: ms(14),
    lineHeight: ms(21), // 150%
    letterSpacing: -0.14,
  },
  body3_B: {
    fontFamily: 'Pretendard-Bold',
    fontSize: ms(12),
    lineHeight: ms(18), // 150%
    letterSpacing: -0.12,
  },
  body4_M: {
    fontFamily: 'Pretendard-Medium',
    fontSize: ms(12),
    lineHeight: ms(18), // 150%
    letterSpacing: -0.12,
  },
  body5_M: {
    fontFamily: 'Pretendard-Medium',
    fontSize: ms(14),
    lineHeight: ms(21), // 150%
    letterSpacing: -0.14, // -1%
  },
  caption_M: {
    fontFamily: 'Pretendard-Medium',
    fontSize: ms(10),
    lineHeight: ms(15), // 150%
    letterSpacing: -0.1, // -1%
  },
} as const;

/** 여백 및 간격 */
export const spacing = {
  small: scale(8), // 작은 여백
  medium: scale(16), // 중간 여백
  large: scale(24), // 큰 여백
  xlarge: scale(32), // 매우 큰 여백
} as const;

// 공통 스타일
export const commonStyles: {
  screen: ViewStyle;
  socialButton: ViewStyle;
} = {
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  socialButton: {
    // Layout
    width: scale(316),
    height: vs(52),
    padding: scale(14),
    flexShrink: 0,

    // Flexbox
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.small,

    // Visual
    borderRadius: scale(8),
  },
};

export const componentStyles = {
  nailItem: {
    container: {
      width: scale(103),
      height: scale(103),
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: scale(4),
      backgroundColor: colors.gray50,
    },
    selectedOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderWidth: scale(2),
      borderColor: colors.gray850,
      borderRadius: scale(4),
    },
    checkIconContainer: {
      position: 'absolute',
      top: scale(8),
      right: scale(8),
    },
  },
} as const;
