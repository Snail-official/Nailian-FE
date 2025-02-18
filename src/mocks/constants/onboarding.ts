/**
 * 온보딩 페이지 타입
 */
export type ONBOARDING_PAGE = 'OnboardingNickname' | 'OnboardingPreferences';

/**
 * 온보딩 단계별 비트마스킹 값 정의
 *
 * @description 온보딩 진행 상태를 비트 연산을 통해 관리하기 위한 상수
 */
export const ONBOARDING_FLAGS: Record<ONBOARDING_PAGE, number> = {
  OnboardingNickname: 0b0001, // 닉네임 입력 완료 (비트 0)
  OnboardingPreferences: 0b0010, // 네일 취향 선택 완료 (비트 1)
};

/**
 * 온보딩 진행 순서 및 해당 버전부터 필요한 단계 정의
 */
export const ONBOARDING_ORDER: {
  step: ONBOARDING_PAGE;
  requiredFromVersion: number;
}[] = [
  { step: 'OnboardingNickname', requiredFromVersion: 1 },
  { step: 'OnboardingPreferences', requiredFromVersion: 1 },
];

/**
 * 최신 온보딩 버전
 */
export const LATEST_VERSION = 1;
