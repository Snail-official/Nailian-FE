import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '~/shared/types/navigation';
import { colors } from '~/shared/styles/design';
import { toast } from '~/shared/lib/toast';

// UI 컴포넌트 가져오기
import Header from './ui/Header';
import ProgressBar from './ui/ProgressBar';
import BottomButton from './ui/BottomButton';

// 각 단계 컴포넌트 가져오기
import SkinToneSelectionStep from './steps/SkinToneSelectionStep';
import ComplimentaryColorStep from './steps/ComplimentaryColorStep';
import FingerLengthStep from './steps/FingerLengthStep';
import FingerThicknessStep from './steps/FingerThicknessStep';
import NailBodyLengthStep from './steps/NailBodyLengthStep';

// Context 가져오기
import { PersonalNailProvider, usePersonalNail } from './PersonalNailContext';

interface PersonalNailFunnelProps {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'PersonalNailFunnelPage'
  >;
}

/**
 * 퍼스널 네일 측정 퍼널 페이지
 *
 * 사용자의 퍼스널 네일 특성을 측정하기 위한 단계별 화면을 제공합니다.
 * 총 5단계로 구성되어 있으며, 각 단계에서 사용자의 선택에 따라 다음 단계로 진행합니다.
 */
function PersonalNailFunnelPage({ navigation }: PersonalNailFunnelProps) {
  const route =
    useRoute<RouteProp<RootStackParamList, 'PersonalNailFunnelPage'>>();

  const initialStep = route.params?.step || 1;

  // 완료 핸들러
  const handleComplete = () => {
    // 측정 결과 화면으로 이동 (임시로 마이페이지로 이동)
    navigation.navigate('MyPage');
    toast.showToast('퍼스널 네일 측정이 완료되었습니다', {
      position: 'bottom',
    });
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <PersonalNailProvider
      initialStep={initialStep}
      onComplete={handleComplete}
      onBack={handleBack}
    >
      <PersonalNailContent />
    </PersonalNailProvider>
  );
}

/**
 * 퍼스널 네일 컨텐츠 컴포넌트
 * Context를 사용하여 실제 UI를 렌더링합니다.
 */
function PersonalNailContent() {
  const { currentStep, isSubmitting, goToNextStep, goToPrevStep } =
    usePersonalNail();

  // 현재 단계에 따른 콘텐츠 렌더링
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <SkinToneSelectionStep />;
      case 2:
        return <ComplimentaryColorStep />;
      case 3:
        return <FingerLengthStep />;
      case 4:
        return <FingerThicknessStep />;
      case 5:
        return <NailBodyLengthStep />;
      default:
        return <SkinToneSelectionStep />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 헤더 */}
        <Header onBack={goToPrevStep} />

        {/* 프로그레스 바 */}
        <ProgressBar currentStep={currentStep} totalSteps={5} />

        {/* 콘텐츠 영역 */}
        <View style={styles.contentContainer}>{renderStepContent()}</View>

        {/* 하단 버튼 */}
        <BottomButton
          onPress={goToNextStep}
          isLastStep={currentStep === 5}
          isSubmitting={isSubmitting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
  },
});

export default PersonalNailFunnelPage;
