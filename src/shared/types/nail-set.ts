// Shape 타입 임포트
import { Shape } from '../api/types';

/**
 * 네일 이미지 인터페이스
 *
 * 각 손가락에 적용될 네일 이미지 정보를 정의합니다.
 *
 * @property {string} imageUrl - 네일 이미지 URL
 * @property {Shape} shape - 네일 형태 (기본값: 'ROUND')
 */
export interface INail {
  imageUrl: string;
  shape?: Shape;
}

/**
 * 손가락별 네일 이미지 인터페이스
 *
 * 각 손가락에 적용될 네일 이미지 정보를 정의하는 인터페이스입니다.
 * 각 손가락(엄지, 검지, 중지, 약지, 소지)별로 이미지 URL을 포함합니다.
 *
 * @property {number} id - 네일 세트의 고유 식별자
 * @property {INail} thumb - 엄지 손가락 네일 이미지
 * @property {INail} index - 검지 손가락 네일 이미지
 * @property {INail} middle - 중지 손가락 네일 이미지
 * @property {INail} ring - 약지 손가락 네일 이미지
 * @property {INail} pinky - 소지 손가락 네일 이미지
 */
export interface INailSet {
  id: number;
  thumb: INail;
  index: INail;
  middle: INail;
  ring: INail;
  pinky: INail;
}
