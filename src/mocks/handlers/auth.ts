import { http } from 'msw';
import { API_BASE_URL } from '@env';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import users from '../data/users';
import {
  KakaoAuthRequest,
  KakaoAuthResponse,
  TokenReissueRequest,
  TokenReissueResponse,
} from '../../shared/api/types';
import { generateToken } from '../utils/auth';

/**
 * 사용자 찾기 함수
 *
 * @param userId 사용자 ID
 * @returns IUser | undefined
 */
const findUserById = (userId: number) => users.find(user => user.id === userId);

const authHandlers = [
  /**
   * 카카오 로그인 API
   *
   * @endpoint POST /auth/kakao
   * @request {KakaoAuthRequest} 카카오 액세스 토큰
   * @response {KakaoAuthResponse} 서비스 액세스 토큰 & 리프레시 토큰
   * @returns 성공 시 토큰 반환, 실패 시 오류 응답
   */
  http.post(`${API_BASE_URL}/auth/kakao`, async ({ request }) => {
    try {
      const { kakaoAccessToken } = (await request.json()) as KakaoAuthRequest;

      if (!kakaoAccessToken) {
        return createErrorResponse('카카오 액세스 토큰이 필요합니다.', 400);
      }

      const userId = 1;
      const user = findUserById(userId);
      if (!user) {
        return createErrorResponse('사용자를 찾을 수 없습니다.', 404);
      }

      const { token: serviceAccessToken, expiresAt } = generateToken(
        'mocked-access-token',
      );
      const { token: serviceRefreshToken } = generateToken(
        'mocked-refresh-token',
      );

      // 액세스 토큰 저장
      user.accessToken = serviceAccessToken;
      // 토큰 만료 시간 저장
      user.tokenExpiresAt = expiresAt;
      // 리프레시 토큰 저장
      user.refreshToken = serviceRefreshToken;

      const response: KakaoAuthResponse = {
        code: 200,
        message: '카카오 로그인 성공',
        data: {
          accessToken: serviceAccessToken,
          refreshToken: serviceRefreshToken,
        },
      };

      return createSuccessResponse(response.data, '로그인 성공');
    } catch (error) {
      return createErrorResponse('서버 오류가 발생했습니다.', 500);
    }
  }),

  /**
   * 액세스 토큰 재발급 API
   *
   * @endpoint POST /auth/reissue
   * @request {TokenReissueRequest} 리프레시 토큰
   * @response {TokenReissueResponse} 새로운 액세스 토큰
   * @returns 성공 시 새로운 액세스 토큰 반환, 실패 시 오류 응답
   */
  http.post(`${API_BASE_URL}/auth/reissue`, async ({ request }) => {
    try {
      const { refreshToken } = (await request.json()) as TokenReissueRequest;

      if (!refreshToken) {
        return createErrorResponse('리프레시 토큰이 필요합니다.', 400);
      }

      const user = users.find(u => u.refreshToken === refreshToken);
      if (!user) {
        return createErrorResponse('유효하지 않은 리프레시 토큰입니다.', 401);
      }

      const { token: serviceAccessToken, expiresAt } = generateToken(
        'mocked-access-token',
      );
      user.accessToken = serviceAccessToken;
      user.tokenExpiresAt = expiresAt;

      const response: TokenReissueResponse = {
        code: 200,
        message: '리이슈 성공',
        data: {
          accessToken: serviceAccessToken,
        },
      };

      return createSuccessResponse(response.data, '토큰 재발급 성공');
    } catch (error) {
      return createErrorResponse('서버 오류가 발생했습니다.', 500);
    }
  }),

  /**
   * 로그아웃 API
   *
   * @endpoint POST /auth/logout
   * @request 헤더에 Authorization 포함
   * @returns 성공 시 로그아웃 완료 메시지, 실패 시 오류 응답
   */
  http.post(`${API_BASE_URL}/auth/logout`, async ({ request }) => {
    try {
      const authorizationHeader = request.headers.get('Authorization');

      if (!authorizationHeader) {
        return createErrorResponse('인증 토큰이 필요합니다.', 401);
      }

      return createSuccessResponse(null, '로그아웃 성공');
    } catch (error) {
      return createErrorResponse('서버 오류가 발생했습니다.', 500);
    }
  }),
];

export default authHandlers;
