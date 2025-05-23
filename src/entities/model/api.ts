import { ModelInfoResponse } from '~/shared/api/types';
import fetcher from '../../shared/api/fetcher';

/**
 * 최신 모델 정보를 조회하는 함수
 *
 * @returns {Promise<ModelInfoResponse>} 최신 모델 정보 반환
 */
export const fetchLatestModels = (): Promise<ModelInfoResponse> =>
  fetcher({
    endpoint: '/model/version', // 최신 모델 정보 조회 API 엔드포인트
  });
