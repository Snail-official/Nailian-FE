import { Shape } from '~/shared/api/types';
import { INailSet } from '~/shared/types/nail-set';

/**
 * 각 손가락의 기본 쉐입 설정
 *
 * API에서 쉐입 정보를 제공하지 않을 때 사용할 기본값입니다.
 * 현재는 모든 손가락에 'ROUND' 쉐입을 적용합니다.
 */
export const DEFAULT_NAIL_SHAPES: Record<keyof Omit<INailSet, 'id'>, Shape> = {
  thumb: 'ALMOND',
  index: 'ALMOND',
  middle: 'ALMOND',
  ring: 'ALMOND',
  pinky: 'ALMOND',
};

/**
 * 네일 세트에 기본 쉐입 정보 추가
 *
 * API로부터 받은 네일 세트에 쉐입 정보가 없을 경우 기본 쉐입을 적용합니다.
 *
 * @param {Partial<INailSet>} nailSet - 원본 네일 세트
 * @returns {Partial<INailSet>} 쉐입 정보가 추가된 네일 세트
 */
export function addDefaultShapesToNailSet(
  nailSet: Partial<INailSet>,
): Partial<INailSet> {
  if (!nailSet) return nailSet;

  const updatedSet = { ...nailSet };
  // 각 손가락별 쉐입 정보 추가
  Object.keys(DEFAULT_NAIL_SHAPES).forEach(finger => {
    const key = finger as keyof Omit<INailSet, 'id'>;
    if (updatedSet[key] && typeof updatedSet[key] === 'object') {
      // 기존 네일 정보가 있으면 쉐입만 추가
      updatedSet[key] = {
        ...updatedSet[key],
        shape: updatedSet[key].shape || DEFAULT_NAIL_SHAPES[key],
      };
    }
  });

  return updatedSet;
}
