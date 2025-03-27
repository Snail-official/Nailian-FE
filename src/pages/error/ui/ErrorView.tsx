import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import Button from '~/shared/ui/Button';
import { useNavigation, CommonActions } from '@react-navigation/native';

import WarningIcon from '~/shared/assets/icons/ic_warn.svg';

/**
 * 에러 뷰 컴포넌트
 *
 * 애플리케이션 오류 발생 시 표시되는 화면으로,
 * 오류 메시지와 홈으로 이동할 수 있는 버튼을 제공합니다.
 *
 * @returns {JSX.Element} 에러 뷰 컴포넌트
 */
export default function ErrorView() {
  console.log('ErrorView');
  const navigation = useNavigation();

  const handleGoMain = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainHome' }],
      }),
    );
  };

  return (
    <View style={styles.container}>
      <WarningIcon width={scale(42)} height={scale(42)} />
      <Text style={styles.emptyText}>알 수 없는 오류가 발생했어요</Text>
      <Button variant="chip_black" onPress={handleGoMain}>
        <Text style={styles.buttonText}>메인으로</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    gap: vs(12),
    width: '100%',
  },
  buttonText: {
    ...typography.body4_M,
    color: colors.white,
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  descriptionText: {
    ...typography.body3_B,
    color: colors.gray400,
    lineHeight: vs(20),
    marginBottom: vs(32),
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body2_SB,
    color: colors.gray500,
    marginBottom: vs(12),
    textAlign: 'center',
  },
  homeButtonText: {
    color: colors.black,
  },
  retryButton: {
    marginBottom: vs(8),
  },
  titleText: {
    ...typography.title1_SB,
    color: colors.black,
    marginBottom: vs(8),
    textAlign: 'center',
  },
});
