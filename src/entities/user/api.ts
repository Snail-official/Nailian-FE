import fetcher from '../../shared/api/fetcher';
import { UserMeResponse } from '../../shared/api/types';

/**
 * 현재 로그인한 사용자의 프로필 정보를 조회하는 함수
 *
 * @returns {Promise<UserMeResponse>} 사용자 프로필 정보 반환
 */
export const fetchUserProfile = async (): Promise<UserMeResponse> =>
  fetcher({
    endpoint: '/users/me', // 사용자 프로필 조회 API 엔드포인트
  });
