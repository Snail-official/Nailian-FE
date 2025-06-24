import { Shape } from '~/shared/api/types';

// 손가락 타입 정의
export type FingerType = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';

// 손가락 타입 상수
export const FINGER_TYPES = [
  'thumb',
  'index',
  'middle',
  'ring',
  'pinky',
] as const;

// 네일 세트 인터페이스
export interface NailSet {
  thumb?: { id: number; imageUrl: string; shape?: Shape };
  index?: { id: number; imageUrl: string; shape?: Shape };
  middle?: { id: number; imageUrl: string; shape?: Shape };
  ring?: { id: number; imageUrl: string; shape?: Shape };
  pinky?: { id: number; imageUrl: string; shape?: Shape };
}
