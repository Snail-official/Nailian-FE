import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '~/shared/styles/design';
import { scale, vs } from '~/shared/lib/responsive';
import Button from '~/shared/ui/Button';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '~/shared/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOnboardingNavigation } from '~/features/onboarding/model/useOnboardingNavigation';

import WarningIcon from '~/shared/assets/icons/ic_warn.svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
  const navigation = useNavigation<NavigationProp>();
  const { goToNextOnboardingStep } = useOnboardingNavigation();

  const handleGoMain = () => {
    navigation.replace('MainHome');
  };

  const handleRetry = async () => {
    try {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [],
        }),
      );
      await goToNextOnboardingStep();
    } catch (error) {
      console.error('온보딩 재시도 실패:', error);
      handleGoMain();
    }
  };

  return (
    <View style={styles.container}>
      <WarningIcon width={scale(42)} height={scale(42)} />
      <Text style={styles.emptyText}>알 수 없는 오류가 발생했어요</Text>
      <Button variant="chip_black" onPress={handleRetry}>
        <Text style={styles.buttonText}>메인으로</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
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
  emptyText: {
    ...typography.body2_SB,
    color: colors.gray500,
    marginBottom: vs(12),
    textAlign: 'center',
  },
});
