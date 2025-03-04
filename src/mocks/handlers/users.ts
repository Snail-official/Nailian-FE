import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@env';
import users from '../data/users';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import {
  UpdateNicknameRequest,
  UpdateNicknameResponse,
  UserMeResponse,
} from '../../shared/api/types';
import { ONBOARDING_FLAGS } from '../constants/onboarding';
import { validateToken } from '../utils/auth';

/* ─────────────────── 사용자 API 핸들러 (User API Handlers) ─────────────────── */

const userHandlers = [
  /**
   * 내 정보 조회 API
   *
   * @endpoint GET /users/me
   * @response {UserMeResponse} 사용자 정보 반환
   * @returns 성공 시 사용자 정보, 실패 시 오류 응답
   */
  http.get(`${API_BASE_URL}/users/me`, async ({ request }) => {
    // 토큰 검증
    const authResult = await validateToken(request);

    // 인증 실패 시 401 응답 반환
    if (authResult instanceof HttpResponse) {
      return authResult;
    }

    // 인증된 사용자 정보 사용
    const user = authResult;

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

  /**
   * 닉네임 수정 API (온보딩 여부에 따라 다르게 처리)
   * @endpoint PATCH /users/me/nickname
   */
  http.patch(`${API_BASE_URL}/users/me/nickname`, async ({ request }) => {
    // 토큰 검증
    const authResult = await validateToken(request);

    // 인증 실패 시 401 응답 반환
    if (authResult instanceof HttpResponse) {
      return authResult;
    }

    // 인증된 사용자 정보 사용
    const user = authResult;

    const { nickname } = (await request.json()) as UpdateNicknameRequest;

    if (!nickname || nickname.trim() === '') {
      return createErrorResponse('닉네임을 입력해주세요.', 400);
    }

    // 특수문자 검증 (한글, 영문, 숫자만 허용)
    const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/;
    if (!nicknameRegex.test(nickname)) {
      return createErrorResponse(
        '닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.',
        400,
      );
    }

    // 닉네임 길이 검증 (한글 기준 2~8자)
    if (nickname.length < 2 || nickname.length > 8) {
      return createErrorResponse(
        '닉네임은 2자 이상 8자 이하로 입력해주세요.',
        400,
      );
    }

    // 기존 닉네임이 없으면 온보딩 과정, 있으면 일반 변경
    const isOnboarding = !user.nickname || user.nickname === '';

    // 닉네임 저장
    user.nickname = nickname;

    if (isOnboarding) {
      // 온보딩 과정이라면, 온보딩 진행 상태 업데이트 (비트 연산 |= 사용)
      if (!(user.onboardingProgress & ONBOARDING_FLAGS.OnboardingNickname)) {
        user.onboardingProgress |= ONBOARDING_FLAGS.OnboardingNickname;
      }
    }

    const response: UpdateNicknameResponse = {
      code: 200,
      message: isOnboarding
        ? '닉네임이 성공적으로 저장되었습니다. (온보딩 완료)'
        : '닉네임이 변경되었습니다.',
      data: null,
    };

    return createSuccessResponse(response.data, response.message);
  }),
];

export default userHandlers;
