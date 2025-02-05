/**
 * 네일 이미지 데이터 타입
 */
export interface NailData {
  /** 네일 아이템의 고유 식별자 */
  id: string;
  /** 네일 이미지 소스 */
  source: ReturnType<typeof require>;
}
