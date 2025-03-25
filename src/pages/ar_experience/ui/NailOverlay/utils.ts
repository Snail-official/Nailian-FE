import { Shape } from '~/shared/api/types';
import {
  BASE_NAIL_POSITIONS,
  NailPosition,
  SHAPE_POSITION_OFFSET,
  SHAPE_SIZE_RATIO,
} from './constants';

/**
 * 네일 쉐입에 따른 위치 및 크기 계산
 *
 * 기본 위치에서 네일 쉐입에 따라 크기, 위치를 조정합니다.
 * 쉐입이 지정되지 않은 경우 기본값으로 'ROUND'를 사용합니다.
 *
 * @param {string} fingerType - 손가락 타입 (thumb, index, middle, ring, pinky)
 * @param {Object} nail - 네일 정보 (id와 imageUrl 포함)
 * @returns {NailPosition} 조정된 네일 위치 및 크기
 */
export function getNailPositionByShape(
  fingerType: string,
  nail: { id: number; imageUrl: string; shape?: string },
): NailPosition {
  const basePosition = BASE_NAIL_POSITIONS[fingerType];
  // 기본값으로 'ROUND' 사용하고 Shape 타입으로 캐스팅
  const shape = (nail.shape || 'ROUND') as Shape;

  // 쉐입별 크기 비율 가져오기
  const sizeRatio = SHAPE_SIZE_RATIO[shape];

  // 쉐입별 위치 오프셋 가져오기
  const positionOffset = SHAPE_POSITION_OFFSET[shape];

  // 기본 위치를 복사하여 쉐입에 따라 크기, 위치, 회전 각도 조정
  return {
    ...basePosition,
    // 위치 조정 (오프셋 적용)
    x: basePosition.x + positionOffset.x,
    y: basePosition.y + positionOffset.y,
    // 크기 조정 (비율 적용)
    width: basePosition.width * sizeRatio.width,
    height: basePosition.height * sizeRatio.height,
  };
}
