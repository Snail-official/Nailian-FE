import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '~/shared/styles/design';
import Button from '~/shared/ui/Button';
import { scale, vs } from '~/shared/lib/responsive';

interface InitialContentProps {
  onClose: () => void;
  onApply: () => void;
}

// 응모 모달의 초기 화면 컴포넌트
export function InitialContent({ onClose, onApply }: InitialContentProps) {
  return (
    <View style={styles.contentContainer}>
      {/* 타이틀 */}
      <Text style={styles.titleText}>
        [이달의 아트 만들기]{'\n'}이벤트에 응모하시겠어요?
      </Text>

      {/* 설명 텍스트 */}
      <Text style={styles.descriptionText}>
        해당 이벤트는 유저당 1회만 참여 가능합니다.
      </Text>

      {/* 버튼 영역 */}
      <View style={styles.buttonContainer}>
        <Button variant="secondarySmallLeft" onPress={onClose}>
          <Text style={styles.cancelButtonText}>괜찮아요</Text>
        </Button>
        <View style={styles.buttonGap} />
        <Button variant="secondarySmallRight" onPress={onApply}>
          <Text style={styles.applyButtonText}>응모하기</Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  applyButtonText: {
    ...typography.body2_SB,
    color: colors.white,
    letterSpacing: -0.14,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: scale(8),
    justifyContent: 'center',
    marginTop: vs(35),
    paddingBottom: vs(15),
    paddingHorizontal: scale(18),
  },
  buttonGap: {
    width: scale(8),
  },
  cancelButtonText: {
    ...typography.body2_SB,
    color: colors.gray900,
    letterSpacing: -0.14,
    textAlign: 'center',
  },
  contentContainer: {
    alignItems: 'flex-start',
    flex: 1,
    paddingHorizontal: spacing.large,
    paddingTop: vs(32),
  },
  descriptionText: {
    ...typography.body4_M,
    alignSelf: 'flex-start',
    color: colors.gray500,
    marginTop: vs(6),
    textAlign: 'left',
    width: '100%',
  },
  titleText: {
    ...typography.title2_SB,
    alignSelf: 'flex-start',
    color: colors.gray850,
    textAlign: 'left',
    width: '100%',
  },
});
