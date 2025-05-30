import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@env';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import {
  UpdateNicknameRequest,
  UpdateNicknameResponse,
  UserMeResponse,
  DeleteUserResponse,
  SavePersonalNailRequest,
  SavePersonalNailResponse,
  GetPersonalNailResponse,
} from '../../shared/api/types';
import { ONBOARDING_FLAGS } from '../constants/onboarding';
import { validateToken } from '../utils/auth';
import { getPersonalNailResult } from '../data/personalNail';

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

  /**
   * 퍼스널 네일 측정 결과 제출 API
   *
   * @endpoint POST /users/me/personal-nail
   * @body {SavePersonalNailRequest} 퍼스널 네일 측정 결과 데이터
   * @returns {Promise<SavePersonalNailResponse>} 퍼스널 네일 측정 결과 분석 반환
   */
  http.post(`${API_BASE_URL}/users/me/personal-nail`, async ({ request }) => {
    try {
      // 토큰 검증
      const authResult = await validateToken(request);

      // 인증 실패 시 401 응답 반환
      if (authResult instanceof HttpResponse) {
        return authResult;
      }

      // 인증된 사용자 정보 사용
      const user = authResult;

      const { steps } = (await request.json()) as SavePersonalNailRequest;

      // steps 배열 검증
      if (!Array.isArray(steps) || steps.length !== 5) {
        return createErrorResponse(
          '올바르지 않은 측정 결과입니다. 5단계 모두 완료해주세요.',
          400,
        );
      }

      // 각 step이 유효한 범위 내에 있는지 검증
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (typeof step !== 'number' || step < 0) {
          return createErrorResponse(
            `${i + 1}단계 측정 결과가 올바르지 않습니다.`,
            400,
          );
        }
      }

      // 진단 결과 생성
      const result = getPersonalNailResult(steps);

      // 사용자에게 진단 결과 저장 (실제로는 DB에 저장)
      user.personalNailResult = result;

      const response: SavePersonalNailResponse = {
        code: 200,
        message: '진단이 완료되었습니다.',
        data: result,
      };

      return createSuccessResponse(response.data, response.message);
    } catch (error) {
      return createErrorResponse('서버 오류가 발생했습니다.', 500);
    }
  }),

  /**
   * 퍼스널 네일 측정 결과 조회 API
   *
   * @endpoint GET /users/me/personal-nail
   * @returns {Promise<GetPersonalNailResponse>} 사용자의 퍼스널 네일 측정 결과 반환
   */
  http.get(`${API_BASE_URL}/users/me/personal-nail`, async ({ request }) => {
    try {
      // 토큰 검증
      const authResult = await validateToken(request);

      // 인증 실패 시 401 응답 반환
      if (authResult instanceof HttpResponse) {
        return authResult;
      }

      // 인증된 사용자 정보 사용
      const user = authResult;

      let response: GetPersonalNailResponse;

      // 진단 결과가 없는 경우
      if (!user.personalNailResult) {
        response = {
          code: 204,
          message: '진단 정보가 없습니다.',
          data: null,
        };
      }

      response = {
        code: 200,
        message: '퍼스널 네일 결과 조회 성공',
        data: user.personalNailResult,
      };

      return createSuccessResponse(response.data, response.message);
    } catch (error) {
      return createErrorResponse('서버 오류가 발생했습니다.', 500);
    }
  }),

  /**
   * 회원 탈퇴 API
   *
   * @endpoint DELETE /users/me
   * @returns 성공 시 탈퇴 완료 메시지, 실패 시 오류 응답
   */
  http.delete(`${API_BASE_URL}/users/me`, async ({ request }) => {
    try {
      // 토큰 검증
      const authResult = await validateToken(request);

      // 인증 실패 시 401 응답 반환
      if (authResult instanceof HttpResponse) {
        return authResult;
      }

      // 인증된 사용자 정보 사용
      const user = authResult;

      // 사용자를 찾을 수 없는 경우 (추가 안전장치)
      if (!user) {
        return createErrorResponse('사용자를 찾을 수 없습니다.', 404);
      }

      user.accessToken = undefined;
      user.refreshToken = undefined;

      const response: DeleteUserResponse = {
        code: 200,
        message: '회원 탈퇴 성공',
        data: null,
      };

      return createSuccessResponse(response.data, response.message);
    } catch (error) {
      return createErrorResponse('서버 오류가 발생했습니다.', 500);
    }
  }),
];

export default userHandlers;
