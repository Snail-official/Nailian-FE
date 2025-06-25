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
import Modal from '~/shared/ui/Modal';

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
  showExitModal: boolean;
  setCurrentStep: (step: number) => void;
  handleSelectAnswer: (stepIndex: number, answerValue: number) => void;
  submitPersonalNailResult: () => Promise<boolean>;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  closeExitModal: () => void;
  confirmExit: () => void;
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
}: {
  children: React.ReactNode;
  initialStep?: number;
  onComplete?: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [stepAnswers, setStepAnswers] = useState<number[]>([
    -1, -1, -1, -1, -1,
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
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
    // 현재 단계의 응답 확인
    if (stepAnswers[currentStep - 1] === -1) {
      if (currentStep <= 2) {
        toast.showToast('컬러를 선택해주세요', {
          position: 'top',
        });
        return;
      }
      toast.showToast('응답을 선택해주세요', {
        position: 'top',
      });
      return;
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // 마지막 단계에서는 결과 제출
      submitPersonalNailResult();
    }
  }, [currentStep, stepAnswers, submitPersonalNailResult]);

  // 이전 단계로 이동
  const goToPrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // 첫 단계에서는 나가기 확인 모달 표시
      setShowExitModal(true);
    }
  }, [currentStep]);

  // 나가기 모달 닫기
  const closeExitModal = useCallback(() => {
    setShowExitModal(false);
    navigation.replace('MyPage');
  }, [navigation]);

  // 나가기 확인
  const confirmExit = useCallback(() => {
    setShowExitModal(false);
  }, []);

  const value = useMemo(
    () => ({
      currentStep,
      stepAnswers,
      isSubmitting,
      showExitModal,
      setCurrentStep,
      handleSelectAnswer,
      submitPersonalNailResult,
      goToNextStep,
      goToPrevStep,
      closeExitModal,
      confirmExit,
    }),
    [
      currentStep,
      stepAnswers,
      isSubmitting,
      showExitModal,
      setCurrentStep,
      handleSelectAnswer,
      submitPersonalNailResult,
      goToNextStep,
      goToPrevStep,
      closeExitModal,
      confirmExit,
    ],
  );

  return (
    <PersonalNailContext.Provider value={value}>
      {children}
      {showExitModal && (
        <Modal
          title="정말 나가시겠어요?"
          description="응답했던 내용은 모두 사라져요"
          confirmText="돌아가기"
          cancelText="나가기"
          onConfirm={confirmExit}
          onCancel={closeExitModal}
        />
      )}
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
