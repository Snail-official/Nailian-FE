import { useCallback, useRef, useState } from 'react';
import { applyEvent } from '~/entities/user/api';
import { toast } from '~/shared/lib/toast';
import { isValidUserInfo } from '~/shared/lib/validation';

// 응모 상태 타입
type ApplyStep = 'initial' | 'form' | 'complete';

// 응모 훅 반환 타입
interface UseApplyReturn {
  step: ApplyStep;
  userInfo: string;
  isLoading: boolean;
  inputError: string;
  inputValueRef: React.MutableRefObject<string>;
  startApply: () => void;
  cancelApply: () => void;
  submitApply: () => Promise<void>;
  handleInputChange: (text: string) => void;
  resetApply: () => void;
}

// 응모 훅 Props
interface UseApplyProps {
  nailSetId: number;
}

// 응모 기능 로직을 관리하는 커스텀 훅
export function useApply({ nailSetId }: UseApplyProps): UseApplyReturn {
  const [step, setStep] = useState<ApplyStep>('initial');
  const inputValueRef = useRef('');
  const [userInfo, setUserInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState('');

  // 응모 시작
  const startApply = useCallback(() => {
    setStep('form');
  }, []);

  // 응모 취소
  const cancelApply = useCallback(() => {
    setStep('initial');
  }, []);

  // 응모 초기화
  const resetApply = useCallback(() => {
    setStep('initial');
    setUserInfo('');
    inputValueRef.current = '';
    setInputError('');
    setIsLoading(false);
  }, []);

  // 입력값 변경 핸들러
  const handleInputChange = useCallback(
    (text: string) => {
      // ref에 직접 값 저장 (입력 중 리렌더링 방지)
      inputValueRef.current = text;

      // 검증 실패 후 다시 입력했을 때 에러 메시지 제거
      if (inputError) {
        setInputError('');
      }
    },
    [inputError],
  );

  // 이벤트 응모 API 호출
  const submitApply = useCallback(async () => {
    // 현재 입력값 참조
    const currentValue = inputValueRef.current;

    if (!currentValue.trim()) {
      setInputError('*연락처를 입력해주세요');
      return;
    }

    if (!isValidUserInfo(currentValue)) {
      setInputError('*올바른 이메일 또는 전화번호 형식이 아닙니다');
      return;
    }

    setInputError('');
    setIsLoading(true);
    setUserInfo(currentValue); // 제출 시에만 상태 업데이트

    try {
      await applyEvent({
        userInfo: currentValue,
        nailSetId,
      });
      setStep('complete');
    } catch (err) {
      toast.showToast('응모에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [nailSetId]);

  return {
    step,
    userInfo,
    isLoading,
    inputError,
    inputValueRef,
    startApply,
    cancelApply,
    submitApply,
    handleInputChange,
    resetApply,
  };
}
