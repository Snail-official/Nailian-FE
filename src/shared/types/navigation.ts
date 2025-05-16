import { NailSet } from '~/pages/ar_experience';
import { INailSet } from './nail-set';
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

  /** 홈 화면 */
  MainHome: undefined;

  /** 마이 페이지 */
  MyPage: undefined;

  /** 네일 세트 리스트 페이지 */
  NailSetListPage: {
    styleId: number;
    styleName: string;
  };

  /** 네일 세트 상세 페이지 */
  NailSetDetailPage: {
    nailSetId: number;
    styleId: number;
    styleName: string;
    isBookmarked?: boolean;
  };

  /** AR 체험 페이지 - 일반 편집 모드 */
  ARExperiencePage: undefined;

  /** AR 체험 페이지 - 뷰 전용 모드 */
  ARViewPage: {
    nailSet: INailSet; // 네일 세트 데이터 전체 전달
  };

  /** AR 카메라 화면 */
  ARCameraPage: {
    nailSet: NailSet; // 네일 세트 데이터 전달
  };

  PersonalNailFunnelPage: {
    step?: number; // 퍼널 단계
  };
};
