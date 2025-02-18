import { http } from 'msw';
import { API_BASE_URL } from '@env';
import { GetOnboardingStatusResponse } from '~/shared/api/types';
import users from '../data/users';
import { createSuccessResponse } from '../utils/response';
import {
  LATEST_VERSION,
  ONBOARDING_FLAGS,
  ONBOARDING_ORDER,
  ONBOARDING_PAGE,
} from '../constants/onboarding';

/**
 * 지원하는 온보딩 페이지 개수 결정
 */
const getSupportedOnboardingSteps = (
  maxSupportedVersion: number,
): ONBOARDING_PAGE[] =>
  ONBOARDING_ORDER.filter(
    ({ requiredFromVersion }) => requiredFromVersion <= maxSupportedVersion,
  ).map(({ step }) => step);

/**
 * 진행해야 할 온보딩 단계 계산 (버전 고려)
 */
const getNextOnboardingStep = (
  onboardingProgress: number,
  maxSupportedVersion: number,
): ONBOARDING_PAGE | null => {
  const filteredOnboardingOrder =
    getSupportedOnboardingSteps(maxSupportedVersion);
  return (
    filteredOnboardingOrder.find(
      step => (onboardingProgress & ONBOARDING_FLAGS[step]) === 0,
    ) || null
  );
};

const onboardingHandlers = [
  /**
   * 온보딩 상태 조회 API (지원하는 온보딩 버전에 따라 필터링된 페이지 반환)
   * @endpoint GET /onboarding-status?maxSupportedVersion=2
   */
  http.get(`${API_BASE_URL}/onboarding-status`, async ({ request }) => {
    const user = users[0];
    const url = new URL(request.url);
    const maxSupportedVersion =
      Number(url.searchParams.get('maxSupportedVersion')) || LATEST_VERSION;

    // 진행해야 할 온보딩 단계 계산 (버전별 지원 페이지 필터링)
    const nextOnboardingStep = getNextOnboardingStep(
      user.onboardingProgress,
      maxSupportedVersion,
    );
    const response: GetOnboardingStatusResponse = {
      code: 200,
      message: '온보딩 상태 조회 성공',
      data: { nextOnboardingStep },
    };

    return createSuccessResponse(response.data, response.message);
  }),
];

export default onboardingHandlers;
