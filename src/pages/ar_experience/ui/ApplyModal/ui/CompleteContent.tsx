import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '~/shared/styles/design';
import Button from '~/shared/ui/Button';
import { scale, vs } from '~/shared/lib/responsive';

interface CompleteContentProps {
  onConfirm: () => void;
}

// 응모 모달의 완료 화면 컴포넌트
export function CompleteContent({ onConfirm }: CompleteContentProps) {
  return (
    <View style={styles.contentContainer}>
      {/* 타이틀 */}
      <Text style={styles.titleText}>참여 완료!</Text>

      {/* 설명 텍스트 */}
      <Text style={styles.descriptionText}>
        이달의 조합 이벤트 결과는 @nailian_official_kr{'\n'}
        인스타그램 계정에서 확인하실 수 있습니다.
      </Text>

      {/* 버튼 영역 */}
      <View style={styles.confirmButtonContainer}>
        <Button variant="secondarySmallRight" onPress={onConfirm}>
          <Text style={styles.applyButtonText}>확인</Text>
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
  confirmButtonContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: vs(23),
    paddingBottom: vs(15),
    width: '100%',
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
