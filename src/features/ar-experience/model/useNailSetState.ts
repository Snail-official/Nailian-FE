import { useState, useCallback } from 'react';
import { NailSet, FINGER_TYPES } from './types';

export function useNailSetState() {
  // 현재 선택된 네일셋 상태
  const [currentNailSet, setCurrentNailSet] = useState<NailSet>({});

  // 네일셋이 완전한지 확인하는 함수
  const isNailSetComplete = useCallback(
    () => FINGER_TYPES.every(finger => currentNailSet[finger as keyof NailSet]),
    [currentNailSet],
  );

  return {
    currentNailSet,
    setCurrentNailSet,
    isNailSetComplete,
  };
}
