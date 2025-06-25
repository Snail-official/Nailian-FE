import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import FocusBracket from '~/shared/assets/icons/focus_bracket.svg';

interface FocusFrameProps {
  frameLayout: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

// 초점 프레임 컴포넌트
export default function FocusFrame({ frameLayout }: FocusFrameProps) {
  const topLeftStyle = { top: frameLayout.top, left: frameLayout.left };
  const topRightStyle = { top: frameLayout.top, right: frameLayout.right };
  const bottomLeftStyle = {
    bottom: frameLayout.bottom,
    left: frameLayout.left,
  };
  const bottomRightStyle = {
    bottom: frameLayout.bottom,
    right: frameLayout.right,
  };
  const guideTextBottomStyle = { bottom: 80 };

  return (
    <View style={styles.focusFrameContainer}>
      {/* 좌상단 */}
      <View style={[styles.bracketContainer, topLeftStyle]}>
        <FocusBracket width={24} height={24} />
      </View>

      {/* 우상단 */}
      <View style={[styles.bracketContainer, topRightStyle]}>
        <FocusBracket width={24} height={24} style={styles.bracketRotate90} />
      </View>

      {/* 좌하단 */}
      <View style={[styles.bracketContainer, bottomLeftStyle]}>
        <FocusBracket
          width={24}
          height={24}
          style={styles.bracketRotateNeg90}
        />
      </View>

      {/* 우하단 */}
      <View style={[styles.bracketContainer, bottomRightStyle]}>
        <FocusBracket width={24} height={24} style={styles.bracketRotate180} />
      </View>

      {/* 안내 텍스트 */}
      <View style={[styles.guideTextContainer, guideTextBottomStyle]}>
        <Text style={styles.guideText}>
          손이 프레임 안에 모두 보이도록 해주세요
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bracketContainer: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    position: 'absolute',
    width: 48,
  },
  bracketRotate180: {
    transform: [{ rotate: '180deg' }],
  },
  bracketRotate90: {
    transform: [{ rotate: '90deg' }],
  },
  bracketRotateNeg90: {
    transform: [{ rotate: '-90deg' }],
  },
  focusFrameContainer: {
    bottom: 0,
    left: 0,
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  guideText: {
    ...typography.body1_B,
    borderRadius: 25,
    color: colors.white,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 10,
    textAlign: 'center',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  guideTextContainer: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
});
