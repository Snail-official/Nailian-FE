/**
 * 페이지네이션 응답 생성 함수
 *
 * @template T 데이터 타입
 * @param {T[]} items 전체 데이터 목록
 * @param {number} page 현재 페이지 번호 (1부터 시작)
 * @param {number} size 페이지당 항목 개수
 * @returns {{
 *   pageInfo: {
 *     currentPage: number;
 *     totalPages: number;
 *     totalItems: number;
 *   };
 *   data: T[];
 * }} 페이지네이션이 적용된 데이터
 */
const createPaginatedResponse = <T>(items: T[], page: number, size: number) => {
  const totalItems = items.length; // 전체 항목 개수
  const totalPages = Math.ceil(totalItems / size); // 총 페이지 개수

  // 현재 페이지 번호 보정 (1 이상, 최대 totalPages 이하)
  const currentPage = Math.max(1, Math.min(page, totalPages));

  // 데이터 슬라이싱을 위한 시작/끝 인덱스 계산
  const startIdx = (currentPage - 1) * size;
  const endIdx = startIdx + size;
  const paginatedItems = items.slice(startIdx, endIdx);

  return {
    pageInfo: {
      currentPage,
      totalPages,
      totalItems,
    },
    data: paginatedItems,
  };
};

export default createPaginatedResponse;
