import { BannerResponse } from '~/shared/api/types';
import fetcher from '../../shared/api/fetcher';

/**
 * 홈 화면의 배너 데이터를 가져오는 함수
 *
 * @returns {Promise<BannerResponse>} 홈 배너 데이터 반환
 */
export const fetchHomeBanners = (): Promise<BannerResponse> =>
  fetcher({
    endpoint: '/banners/home', // 홈 배너 조회 API 엔드포인트
  });
