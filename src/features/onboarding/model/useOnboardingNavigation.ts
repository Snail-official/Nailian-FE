import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '~/shared/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchOnboardingStatus } from '~/entities/user/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * 온보딩 네비게이션 훅
 *
 * 온보딩 과정에서 사용자의 다음 단계를 결정하고 자동으로 이동하는 기능을 제공합니다.
 * 백엔드 API를 통해 사용자의 온보딩 진행 상태를 확인하고 적절한 다음 화면으로 라우팅합니다.
 *
 * 주요 기능:
 * - 사용자의 온보딩 진행 상태 확인
 * - 다음 온보딩 단계 자동 결정
 * - 적절한 화면으로 네비게이션
 *
 * @returns {{ goToNextOnboardingStep: () => Promise<void> }} 다음 온보딩 단계로 이동하는 함수
 */
export const useOnboardingNavigation = () => {
  const navigation = useNavigation<NavigationProp>();

  /**
   * 다음 온보딩 단계로 이동
   *
   * 백엔드 API를 통해 사용자의 현재 온보딩 상태를 확인하고,
   * 서버가 지정한 다음 온보딩 단계로 자동으로 이동합니다.
   * 온보딩이 완료된 사용자는 메인 홈 화면으로 이동합니다.
   *
   * @async
   * @returns {Promise<void>}
   */
  const goToNextOnboardingStep = async () => {
    try {
      // 온보딩 상태 조회 (최신 지원 버전 반영)
      const response = await fetchOnboardingStatus({ maxSupportedVersion: 2 });
      const nextOnboardingStep = response.data?.nextOnboardingStep;
      if (nextOnboardingStep) {
        navigation.replace(nextOnboardingStep);
      } else {
        navigation.replace('MainHome');
      }
    } catch (error) {
      console.error('온보딩 단계 조회 실패:', error);
    }
  };

  return { goToNextOnboardingStep };
};
