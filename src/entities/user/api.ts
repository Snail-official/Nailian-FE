import fetcher from '../../shared/api/fetcher';
import {
  GetOnboardingStatusRequest,
  GetOnboardingStatusResponse,
  KakaoAuthRequest,
  KakaoAuthResponse,
  LogoutRequest,
  LogoutResponse,
  TokenReissueRequest,
  TokenReissueResponse,
  UpdateNicknameRequest,
  UpdateNicknameResponse,
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

/**
 * 닉네임 수정 API 호출
 *
 * @param {UpdateNicknameRequest} data - 새로운 닉네임 정보
 * @returns {Promise<UpdateNicknameResponse>} 닉네임 변경 성공 여부 반환
 */
export const updateNickname = async ({
  nickname,
}: UpdateNicknameRequest): Promise<UpdateNicknameResponse> =>
  fetcher({
    endpoint: '/users/me/nickname',
    method: 'PATCH',
    body: { nickname },
  });

/**
 * 온보딩 상태 조회 API 호출
 *
 * @param {GetOnboardingStatusRequest} params - 지원하는 최대 온보딩 버전
 * @returns {Promise<GetOnboardingStatusResponse>} 현재 온보딩 진행 상태 반환
 */
export const fetchOnboardingStatus = async ({
  maxSupportedVersion,
}: GetOnboardingStatusRequest): Promise<GetOnboardingStatusResponse> =>
  fetcher({
    endpoint: `/onboarding-status?maxSupportedVersion=${maxSupportedVersion}`,
  });
