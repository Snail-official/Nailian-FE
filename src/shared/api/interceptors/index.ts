import { RequestInterceptor, ResponseInterceptor } from '../types';
import {
  authRequestInterceptor,
  authResponseInterceptor,
} from './auth.interceptor';

export { setNavigationRef, navigate } from './navigation';

// 인터셉터 저장소
export const requestInterceptors: RequestInterceptor[] = [];
export const responseInterceptors: ResponseInterceptor[] = [];

// 인터셉터 등록 함수
export const addRequestInterceptor = (interceptor: RequestInterceptor) => {
  requestInterceptors.push(interceptor);
};

export const addResponseInterceptor = (interceptor: ResponseInterceptor) => {
  responseInterceptors.push(interceptor);
};

// 기본 인터셉터 등록
addRequestInterceptor(authRequestInterceptor);
addResponseInterceptor(authResponseInterceptor);

// 인터셉터 내보내기
export { authRequestInterceptor, authResponseInterceptor };
