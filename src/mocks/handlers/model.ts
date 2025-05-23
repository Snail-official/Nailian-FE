import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@env';
import { ModelInfoResponse } from '~/shared/api/types';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import { validateToken } from '../utils/auth';
import models from '../data/models';

const modelHandlers = [
  /**
   * 최신 모델 정보 조회 API
   *
   * @endpoint GET /models/latest
   * @response {ModelInfoResponse} 최신 모델 정보 반환
   * @returns 성공 시 최신 모델 정보, 실패 시 오류 응답
   */
  http.get(`${API_BASE_URL}/model/version`, async () => {
    try {
      // 응답 객체 생성
      const response: ModelInfoResponse = {
        code: 200,
        message: '최신 모델 정보 조회 성공',
        data: models,
      };

      return createSuccessResponse(response.data, response.message);
    } catch (error) {
      return createErrorResponse(
        '모델 정보를 불러오는 중 오류가 발생했습니다.',
        500,
      );
    }
  }),
];

export default modelHandlers;
