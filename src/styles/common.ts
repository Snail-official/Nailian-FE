import { TextStyle, ViewStyle } from 'react-native';

// 색상 팔레트
export const colors = {
  white: '#FFFFFF',
  black: '#000000',
  borderGray: '#E5E5E5',
  gray850: '#131313',
  gray200: '#E5E5E5',
  purple200: '#F5D0FF',
  purple500: '#CD19FF',
  kakaoYellow: '#FEE500',
};

// 타이포그래피
export const typography: {
  title: TextStyle;
  body: TextStyle;
  button: TextStyle;
  head1: TextStyle;
  head2: TextStyle;
  title2: TextStyle;
  body2: TextStyle;
} = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
  },
  head1: {
    fontFamily: 'Pretendard',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 33,
  },
  head2: {
    fontSize: 20,
    fontFamily: 'Pretendard',
    fontWeight: '700',
    lineHeight: 30,
    color: colors.gray850,
  },
  title2: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  body2: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    letterSpacing: -0.14,
    color: colors.gray850,
  },
};

// 레이아웃
export const spacing = {
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
};

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
    width: 316,
    height: 52,
    padding: 14,
    flexShrink: 0,

    // Flexbox
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.small,

    // Visual
    borderRadius: 8,
  },
};

export const componentStyles = {
  nailItem: {
    container: {
      width: 103,
      height: 103,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: 4,
      backgroundColor: colors.gray200,
    },
    selectedOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderWidth: 2,
      borderColor: colors.gray850,
      borderRadius: 4,
    },
    checkIconContainer: {
      position: 'absolute',
      top: 8,
      right: 8,
    },
  },
} as const;
