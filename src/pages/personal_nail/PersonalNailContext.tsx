import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { RootStackParamList } from '~/shared/types/navigation';
import { savePersonalNail } from '~/entities/user/api';
import { toast } from '~/shared/lib/toast';

// 단계별 타이틀 정의
export const STEP_TITLES = [
  '',
  '내 손의 피부톤과\n비슷한 컬러를 선택해주세요',
  '내 손의 피부톤과\n더 잘 어울리는 컬러를 선택해주세요',
  '내 손의 손가락 길이는\n어떤 편인가요?',
  '내 손의 손가락 두께는\n어떤 편인가요?',
  '내 손톱의 바디길이는\n어떤 편인가요?',
];

// 컨텍스트 타입 정의
interface PersonalNailContextType {
  currentStep: number;
  stepAnswers: number[];
  isSubmitting: boolean;
  setCurrentStep: (step: number) => void;
  handleSelectAnswer: (stepIndex: number, answerValue: number) => void;
  submitPersonalNailResult: () => Promise<boolean>;
  goToNextStep: () => void;
  goToPrevStep: () => void;
}

// 컨텍스트 생성
const PersonalNailContext = createContext<PersonalNailContextType | undefined>(
  undefined,
);

// 컨텍스트 프로바이더 컴포넌트
function PersonalNailProvider({
  children,
  initialStep = 1,
  onComplete,
  onBack,
}: {
  children: React.ReactNode;
  initialStep?: number;
  onComplete?: () => void;
  onBack?: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [stepAnswers, setStepAnswers] = useState<number[]>([0, 0, 0, 0, 0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();

  // 답변 선택 핸들러
  const handleSelectAnswer = useCallback(
    (stepIndex: number, answerValue: number) => {
      const newAnswers = [...stepAnswers];
      newAnswers[stepIndex - 1] = answerValue;
      setStepAnswers(newAnswers);
    },
    [stepAnswers],
  );

  // 측정 결과 제출
  const submitPersonalNailResult = useCallback(async (): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await savePersonalNail({ steps: stepAnswers });
      await queryClient.invalidateQueries({ queryKey: ['personalNail'] });

      // 결과 페이지로 이동
      if (onComplete) {
        onComplete();
        navigation.replace('PersonalNailResult', {
          personalNailResult: response.data,
        });
      }
      return true;
    } catch (error) {
      console.error('퍼스널 네일 측정 제출 오류:', error);
      toast.showToast('측정 결과 제출에 실패했습니다.', {
        position: 'top',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [stepAnswers, onComplete, navigation, queryClient]);

  // 다음 단계로 이동
  const goToNextStep = useCallback(() => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // 마지막 단계에서는 결과 제출
      submitPersonalNailResult();
    }
  }, [currentStep, submitPersonalNailResult]);

  // 이전 단계로 이동
  const goToPrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // 첫 단계에서는 뒤로 가기 (있을 경우)
      if (onBack) {
        onBack();
      }
    }
  }, [currentStep, onBack]);

  const value = useMemo(
    () => ({
      currentStep,
      stepAnswers,
      isSubmitting,
      setCurrentStep,
      handleSelectAnswer,
      submitPersonalNailResult,
      goToNextStep,
      goToPrevStep,
    }),
    [
      currentStep,
      stepAnswers,
      isSubmitting,
      setCurrentStep,
      handleSelectAnswer,
      submitPersonalNailResult,
      goToNextStep,
      goToPrevStep,
    ],
  );

  return (
    <PersonalNailContext.Provider value={value}>
      {children}
    </PersonalNailContext.Provider>
  );
}

// 커스텀 훅
export const usePersonalNail = () => {
  const context = useContext(PersonalNailContext);
  if (context === undefined) {
    throw new Error(
      'usePersonalNail must be used within a PersonalNailProvider',
    );
  }
  return context;
};

export { PersonalNailProvider };
