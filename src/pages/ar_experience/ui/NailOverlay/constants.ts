import { scale } from '~/shared/lib/responsive';
import { Shape } from '~/shared/api/types';

/**
 * 각 손톱 위치 정보
 * @property {number} x - X 좌표 (왼쪽 기준)
 * @property {number} y - Y 좌표 (위쪽 기준)
 * @property {number} width - 네일 이미지 너비
 * @property {number} height - 네일 이미지 높이
 * @property {number} rotation - 회전 각도 (도 단위)
 */
export interface NailPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

/**
 * 네일 쉐입별 사이즈 조정 비율
 *
 * 각 네일 쉐입에 따라 적용되는 사이즈 조정 비율입니다.
 * 기본값은 ROUND 쉐입으로, 비율이 1입니다.
 */
export const SHAPE_SIZE_RATIO: Record<
  Shape,
  { width: number; height: number }
> = {
  // 라운드(기본형) - 기준 비율
  ROUND: { width: 1, height: 1 },
  SQUARE: { width: 1.05, height: 1 },
  ALMOND: { width: 1.05, height: 1 },
  BALLERINA: { width: 1.2, height: 1 },
  STILETTO: { width: 1.2, height: 1 },
};

/**
 * 네일 쉐입별 위치 오프셋
 *
 * 각 네일 쉐입에 따라 기본 위치에서 조정되는 오프셋 값입니다.
 * ROUND 쉐입은 기준이므로 오프셋이 없습니다(0, 0).
 * x: 양수는 오른쪽, 음수는 왼쪽으로 이동
 * y: 양수는 아래쪽, 음수는 위쪽으로 이동
 */
export const SHAPE_POSITION_OFFSET: Record<Shape, { x: number; y: number }> = {
  ROUND: { x: 0, y: 0 },
  SQUARE: { x: -1, y: -2 },
  ALMOND: { x: -1, y: -2 },
  BALLERINA: { x: -5, y: -3 },
  STILETTO: { x: -5, y: -4 },
};

/**
 * 손톱별 기본 위치 정보 (ROUND 쉐입 기준)
 *
 * 좌표와 변형 값들은 기본 손 이미지를 기준으로 측정된 값입니다.
 * 해당 값들은 실제 이미지와 화면 크기에 따라 조정이 필요할 수 있습니다.
 */
export const BASE_NAIL_POSITIONS: Record<string, NailPosition> = {
  // 엄지손가락 - 가장 오른쪽에 위치
  thumb: {
    x: scale(264),
    y: scale(135),
    width: scale(58),
    height: scale(50),
    rotation: 25, // 약간 기울임
  },
  // 검지손가락
  index: {
    x: scale(202),
    y: scale(27),
    width: scale(49),
    height: scale(35),
    rotation: 1,
  },
  // 중지손가락
  middle: {
    x: scale(159),
    y: scale(6),
    width: scale(53),
    height: scale(39),
    rotation: 0,
  },
  // 약지손가락
  ring: {
    x: scale(116),
    y: scale(31),
    width: scale(51),
    height: scale(37),
    rotation: -3,
  },
  // 소지손가락 - 가장 왼쪽에 위치
  pinky: {
    x: scale(79),
    y: scale(88),
    width: scale(40),
    height: scale(28),
    rotation: -5, // 반대 방향으로 약간 기울임
  },
};
