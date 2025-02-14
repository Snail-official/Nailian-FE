import fetcher from '../../shared/api/fetcher';
import {
  KakaoAuthRequest,
  KakaoAuthResponse,
  LogoutRequest,
  LogoutResponse,
  TokenReissueRequest,
  TokenReissueResponse,
  UserMeResponse,
} from '../../shared/api/types';

/**
 * 카카오 로그인 API 호출
 *
 * @param {KakaoAuthRequest} data - 카카오 액세스 토큰
 * @returns {Promise<KakaoAuthResponse>} 서비스 액세스 토큰 & 리프레시 토큰 반환
 */
export const loginWithKakao = ({
  kakaoAccessToken,
}: KakaoAuthRequest): Promise<KakaoAuthResponse> =>
  fetcher({
    endpoint: '/auth/kakao',
    method: 'POST',
    body: { kakaoAccessToken },
  });

/**
 * 액세스 토큰 재발급 API 호출
 *
 * @param {TokenReissueRequest} data - 리프레시 토큰
 * @returns {Promise<TokenReissueResponse>} 새 액세스 토큰 반환
 */
export const reissueAccessToken = ({
  refreshToken,
}: TokenReissueRequest): Promise<TokenReissueResponse> =>
  fetcher({
    endpoint: '/auth/reissue',
    method: 'POST',
    body: { refreshToken },
  });

/**
 * 로그아웃 API 호출
 *
 * @param {LogoutRequest} data - 현재 액세스 토큰
 * @returns {Promise<LogoutResponse>} 로그아웃 성공 여부 반환
 */
export const logoutFromService = ({
  accessToken,
}: LogoutRequest): Promise<LogoutResponse> =>
  fetcher({
    endpoint: '/auth/logout',
    method: 'POST',
    body: { accessToken },
  });

/**
 * 현재 로그인한 사용자의 프로필 정보를 조회하는 함수
 *
 * @returns {Promise<UserMeResponse>} 사용자 프로필 정보 반환
 */
export const fetchUserProfile = async (): Promise<UserMeResponse> =>
  fetcher({
    endpoint: '/users/me', // 사용자 프로필 조회 API 엔드포인트
  });
