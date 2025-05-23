import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@env';
import banners from '../data/banners';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import { BannerResponse } from '../../shared/api/types';
import { validateToken } from '../utils/auth';

/* ─────────────────── 배너 API 핸들러 (Banner API Handlers) ─────────────────── */

const bannerHandlers = [
  /**
   * 홈 배너 조회 API
   *
   * @endpoint GET /banners/home
   * @response {BannerResponse} 배너 목록 반환
   * @returns 성공 시 배너 데이터, 실패 시 오류 응답
   */
  http.get(`${API_BASE_URL}/banners/home`, async ({ request }) => {
    // 토큰 검증
    const authResult = await validateToken(request);

    // 인증 실패 시 401 응답 반환
    if (authResult instanceof HttpResponse) {
      return authResult;
    }

    // 배너 데이터가 없을 경우 404 응답 반환
    if (!banners || banners.length === 0) {
      return createErrorResponse('배너 데이터를 찾을 수 없습니다.', 404);
    }

    // 정상 응답 반환
    const response: BannerResponse = {
      code: 200,
      message: '홈 배너 조회 성공',
      data: banners,
    };

    return createSuccessResponse(response.data, response.message);
  }),
];

export default bannerHandlers;
