import { API_BASE_URL } from '@env';
import { buildQueryString } from '../lib/query';
import { RequestOptions, ExtendedResponse, APIError } from './types';
import { requestInterceptors, responseInterceptors } from './interceptors';

/**
 * API 요청을 수행하는 공통 fetch 함수
 *
 * @template T API 응답 데이터 타입
 * @param {Object} options - 요청 옵션
 * @param {string} options.endpoint - API 엔드포인트
 * @param {'GET' | 'POST' | 'PUT' | 'DELETE'} [options.method='GET'] - HTTP 요청 메서드
 * @param {Record<string, string>} [options.headers={}] - 요청 헤더
 * @param {Record<string, string | number>} [options.query] - 요청 쿼리 파라미터
 * @param {Record<string, unknown>} [options.body] - 요청 본문 (JSON 직렬화됨)
 * @param {number} [options.timeout=10000] - 요청 타임아웃 (기본값: 10초)
 * @returns {Promise<T>} API 응답 데이터 반환
 * @throws {APIError} 응답이 실패하면 API 에러 발생
 */
const fetcher = async <T>({
  endpoint,
  method = 'GET',
  headers = {},
  query,
  body,
  timeout = 10000,
}: Partial<RequestOptions> & { endpoint: string }): Promise<T> => {
  let options: RequestOptions = {
    method,
    headers,
    timeout,
    endpoint,
    query,
    body,
  };

  // 요청 인터셉터 순차적으로 실행
  options = await requestInterceptors.reduce(
    async (optionsPromise, interceptor) => {
      const resolvedOptions = await optionsPromise;
      return interceptor(resolvedOptions);
    },
    Promise.resolve(options),
  );

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout);

  try {
    // API URL 생성 (BASE_URL 사용)
    let url = options.endpoint.startsWith('http')
      ? options.endpoint
      : `${API_BASE_URL}${options.endpoint}`;

    // 쿼리 문자열 추가
    if (options.query) {
      const queryString = buildQueryString(options.query);
      url += `?${queryString}`;
    }

    // 요청 옵션 생성
    const fetchOptions = {
      method: options.method,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    };

    const response = (await fetch(url, fetchOptions)) as ExtendedResponse;

    // 응답 객체에 요청 정보 추가
    response.requestInfo = {
      url,
      method: options.method,
      headers: fetchOptions.headers,
      body: fetchOptions.body,
      endpoint: options.endpoint,
    };

    // 응답 인터셉터 순차적으로 실행
    const processedResponse = await responseInterceptors.reduce(
      async (responsePromise, interceptor) => {
        const resolvedResponse = await responsePromise;
        return interceptor(resolvedResponse);
      },
      Promise.resolve(response),
    );

    const data = await processedResponse.json();
    console.log('data', data);

    // API 응답 구조에 맞게 에러 처리
    if (data.code < 200 || data.code >= 300) {
      throw new APIError(data.message || 'API 요청 실패', data.code, data.data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error && 'response' in error) {
      const apiError = error as {
        response?: {
          data?: { message?: string; code?: number; data?: unknown };
        };
      };
      throw new APIError(
        apiError.response?.data?.message || 'API 요청 실패',
        apiError.response?.data?.code || 500,
      );
    }
    // 기타 에러
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'API 요청 실패',
      500,
    );
  } finally {
    clearTimeout(timeoutId);
  }
};

export default fetcher;
