/**
 * 메인 홈 화면 관련 타입 정의
 */

/**
 * 네일 세트 인터페이스
 * 각 손가락별 네일 이미지 정보를 담고 있음
 */
export interface NailSet {
  id: number;
  thumb: { imageUrl: string };
  index: { imageUrl: string };
  middle: { imageUrl: string };
  ring: { imageUrl: string };
  pinky: { imageUrl: string };
}

/**
 * 스타일 정보 인터페이스
 */
export interface StyleInfo {
  id: number;
  name: string;
}

/**
 * 스타일 그룹 인터페이스
 * 스타일 정보와 해당 스타일의 네일 세트 목록을 담고 있음
 */
export interface StyleGroup {
  style: StyleInfo;
  nailSets: NailSet[];
}

/**
 * 배너 인터페이스
 * 배너 정보를 담고 있음
 */
export interface Banner {
  id: number;
  imageUrl: string;
  link: string;
}
