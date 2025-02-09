import { http } from 'msw';
import { API_BASE_URL } from '@env';
import users from '../data/users';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import { UserMeResponse } from '../../shared/api/types';

/* ─────────────────── 사용자 API 핸들러 (User API Handlers) ─────────────────── */

const userHandlers = [
  /**
   * 내 정보 조회 API
   *
   * @endpoint GET /users/me
   * @response {UserMeResponse} 사용자 정보 반환
   * @returns 성공 시 사용자 정보, 실패 시 오류 응답
   */
  http.get(`${API_BASE_URL}/users/me`, async () => {
    const userId = 1; // 임시 사용자 ID (인증 기능 미구현)

    // 사용자 데이터 조회
    const user = users.find(u => u.id === userId);
    if (!user) {
      return createErrorResponse('사용자를 찾을 수 없습니다.', 404);
    }

    // 사용자 정보 응답 생성
    const response: UserMeResponse = {
      code: 200,
      message: '사용자 정보 조회 성공',
      data: {
        id: user.id,
        nickname: user.nickname || '사용자',
        profileImage: user.profileImage,
      },
    };

    return createSuccessResponse(response.data, response.message);
  }),
];

export default userHandlers;
