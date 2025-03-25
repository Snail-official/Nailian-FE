import { NailSet } from '~/pages/ar_experience';
import { Shape } from '~/shared/api/types';

// 쉐입 정보가 추가된 네일 아이템 타입
interface NailItemWithShape {
  id: number;
  imageUrl: string;
  shape?: Shape;
}

// 쉐입 정보가 추가된 네일셋 타입
interface NailSetWithShape {
  thumb?: NailItemWithShape;
  index?: NailItemWithShape;
  middle?: NailItemWithShape;
  ring?: NailItemWithShape;
  pinky?: NailItemWithShape;
}

/**
 * 각 손가락의 기본 쉐입 설정
 *
 * API에서 쉐입 정보를 제공하지 않을 때 사용할 기본값입니다.
 * 현재는 모든 손가락에 'ROUND' 쉐입을 적용합니다.
 */
export const DEFAULT_NAIL_SHAPES = {
  thumb: 'ALMOND' as Shape,
  index: 'ALMOND' as Shape,
  middle: 'ALMOND' as Shape,
  ring: 'ALMOND' as Shape,
  pinky: 'ALMOND' as Shape,
} as const;

/**
 * 네일 세트에 기본 쉐입 정보 추가
 *
 * API로부터 받은 네일 세트에 쉐입 정보가 없을 경우 기본 쉐입을 적용합니다.
 *
 * @param {Partial<NailSet>} nailSet - 원본 네일 세트
 * @returns {Partial<NailSetWithShape>} 쉐입 정보가 추가된 네일 세트
 */
export function addDefaultShapesToNailSet(
  nailSet: Partial<NailSet>,
): Partial<NailSetWithShape> {
  if (!nailSet) return nailSet as Partial<NailSetWithShape>;

  const updatedSet: Partial<NailSetWithShape> = { ...nailSet };
  // 각 손가락별 쉐입 정보 추가
  Object.keys(DEFAULT_NAIL_SHAPES).forEach(finger => {
    const key = finger as keyof typeof DEFAULT_NAIL_SHAPES;
    if (updatedSet[key] && typeof updatedSet[key] === 'object') {
      // 기존 네일 정보가 있으면 쉐입만 추가
      updatedSet[key] = {
        ...updatedSet[key]!,
        shape:
          (updatedSet[key] as NailItemWithShape).shape ||
          DEFAULT_NAIL_SHAPES[key],
      };
    }
  });

  return updatedSet;
}
