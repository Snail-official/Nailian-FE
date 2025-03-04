import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';

// 네비게이션 참조 생성
let navigationRef: NavigationContainerRef<RootStackParamList> | null = null;

// 네비게이션 참조 설정 함수
export const setNavigationRef = (
  ref: NavigationContainerRef<RootStackParamList> | null,
) => {
  navigationRef = ref;
};

// 네비게이션 함수
export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName],
) {
  if (navigationRef && navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    console.warn('Navigation is not ready. Navigation action queued.');
  }
}
