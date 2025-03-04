import { RequestInterceptor, ResponseInterceptor } from '../types';
import { reissueAccessToken } from '../../../entities/user/api';
import { useAuthStore } from '../../store/authStore';
import { navigate } from './navigation';

// 토큰 재발급 진행 중인지 추적하는 변수
let isRefreshing = false;
// 토큰 재발급 대기 중인 요청들의 콜백 배열
let refreshSubscribers: Array<(token: string) => void> = [];

// 토큰 재발급 후 대기 중인 요청들을 처리하는 함수
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// 토큰 재발급 실패 시 대기 중인 요청들을 처리하는 함수
const onRefreshFailed = () => {
  refreshSubscribers = [];
};

// 토큰 관련 요청 인터셉터
export const authRequestInterceptor: RequestInterceptor = async options => {
  // 토큰 재발급 요청인 경우 인증 헤더 추가 없이 바로 진행
  if (options.endpoint.includes('/auth/reissue')) return options;

  const { accessToken, refreshToken, setTokens, clearTokens } =
    useAuthStore.getState();

  if (!accessToken && !options.endpoint.includes('/auth')) {
    // 리프레시 토큰으로 새 액세스 토큰 발급 시도
    if (refreshToken) {
      try {
        const { data } = await reissueAccessToken({ refreshToken });
        if (data?.accessToken) {
          await setTokens(data.accessToken, refreshToken);
          return {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${data.accessToken}`,
            },
          };
        }
      } catch (error) {
        // 리프레시 토큰도 만료된 경우 로그인 페이지로 이동
        await clearTokens();
        navigate('SocialLogin');
        throw new Error('인증이 필요합니다.');
      }
    }
  }

  // 액세스 토큰이 있는 경우 헤더에 추가
  return {
    ...options,
    headers: {
      ...options.headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  };
};

// 응답 인터셉터 - 401 에러 처리
export const authResponseInterceptor: ResponseInterceptor = async response => {
  // 이미 /auth/reissue 요청에 대한 응답이면 재시도하지 않음 (무한 루프 방지)
  if (response.status === 401 && !response.url.includes('/auth/reissue')) {
    const { refreshToken, setTokens, clearTokens } = useAuthStore.getState();

    if (!refreshToken) {
      await clearTokens();
      navigate('SocialLogin');
      return response;
    }

    // 요청 정보가 없으면 재시도할 수 없음
    if (!response.requestInfo) {
      return response;
    }

    // 토큰 재발급 중이 아니라면 재발급 시작
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const { data } = await reissueAccessToken({ refreshToken });

        if (data?.accessToken) {
          await setTokens(data.accessToken, refreshToken);

          // 대기 중인 요청들에게 새 토큰 전달
          onRefreshed(data.accessToken);

          // 현재 요청 재시도
          const headers = new Headers();
          headers.set('Content-Type', 'application/json');
          headers.set('Authorization', `Bearer ${data.accessToken}`);

          const method = response.requestInfo.method || 'GET';

          const requestInit: RequestInit = {
            method,
            headers,
          };

          if (response.requestInfo.body) {
            requestInit.body = response.requestInfo.body;
          }

          return fetch(response.requestInfo.url, requestInit);
        } else {
          throw new Error('토큰 재발급 실패: 새 토큰이 없습니다');
        }
      } catch (error) {
        onRefreshFailed();
        await clearTokens();
        navigate('SocialLogin');
        return response;
      } finally {
        isRefreshing = false;
      }
    } else {
      // 이미 토큰 재발급 중이면 대기열에 추가

      // 새 토큰을 받으면 요청을 재시도하는 Promise 반환
      return new Promise<Response>(resolve => {
        refreshSubscribers.push((token: string) => {
          const headers = new Headers();
          headers.set('Content-Type', 'application/json');
          headers.set('Authorization', `Bearer ${token}`);

          const method = response.requestInfo?.method || 'GET';

          const requestInit: RequestInit = {
            method,
            headers,
          };

          if (response.requestInfo?.body) {
            requestInit.body = response.requestInfo.body;
          }

          resolve(fetch(response.requestInfo!.url, requestInit));
        });
      });
    }
  }

  return response;
};
