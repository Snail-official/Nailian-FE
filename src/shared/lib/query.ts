/**
 * 객체를 URL 쿼리 문자열로 변환하는 함수
 *
 * @param {Record<string, any>} params - 쿼리 파라미터 객체
 * @returns {string} URL 인코딩된 쿼리 문자열
 */
export const buildQueryString = (
  params: Record<string, string | number | boolean | undefined>,
): string =>
  Object.entries(params)
    .filter(([, value]) => value !== undefined) // undefined 값 제외
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join('&');
