import { API_BASE_URL } from '@env';
import { buildQueryString } from '../lib/query';

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
 * @throws {Error} 응답이 실패하면 오류 발생
 */
const fetcher = async <T>({
  endpoint,
  method = 'GET',
  headers = {},
  query,
  body,
  timeout = 10000,
}: {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  query?: Record<string, string | number>;
  body?: Record<string, unknown>;
  timeout?: number;
}): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // API URL 생성 (기본 BASE_URL 사용)
    let url = endpoint.startsWith('http')
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;

    // 쿼리 문자열 추가
    if (query) {
      const queryString = buildQueryString(query);
      url += `?${queryString}`;
    }

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'API 요청 실패');
  } finally {
    clearTimeout(timeoutId);
  }
};

export default fetcher;
