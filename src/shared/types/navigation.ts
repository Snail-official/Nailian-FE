/**
 * 루트 네비게이션 스택의 파라미터 타입 정의
 *
 * 화면 간 데이터 전달이 필요한 경우 여기서 타입을 정의합니다.
 * undefined는 전달할 파라미터가 없음을 의미합니다.
 *
 * @example
 * // 파라미터 전달 예시
 * navigation.navigate('SomeScreen', {
 *   param1: 'value1',
 *   param2: 'value2'
 * });
 *
 * // 파라미터 사용 예시
 * const route = useRoute<RouteProp<RootStackParamList, 'SomeScreen'>>();
 * const { param1, param2 } = route.params;
 *
 * @note 향후 확장 예정:
 * OnboardingDefault: {
 *   preSelectedNailIds?: string[];  // 이전에 선택했던 네일 ID들 (마이페이지/홈 연동)
 *   maxSelection?: number;          // 최대 선택 가능 개수
 * }
 *
 * @see https://reactnavigation.org/docs/params/
 * @see https://reactnavigation.org/docs/typescript/#type-checking-the-navigator
 */
export type RootStackParamList = {
  /** 온보딩 로그인 화면 */
  SocialLogin: undefined;

  /** 온보딩 진입점 (온보딩 여부를 체크하고 다음 화면으로 이동) */
  OnboardingEntry: undefined;

  /** 온보딩 개별 페이지 */
  OnboardingNickname: undefined;
  OnboardingPreferences: undefined;
};
