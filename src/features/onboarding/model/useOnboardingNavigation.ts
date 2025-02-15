import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '~/shared/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchOnboardingStatus } from '~/entities/user/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useOnboardingNavigation = () => {
  const navigation = useNavigation<NavigationProp>();

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
