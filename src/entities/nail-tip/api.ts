import fetcher from '../../shared/api/fetcher';
import { GetNailsRequest, NailListResponse } from '../../shared/api/types';

/**
 * 네일 목록을 조회하는 함수
 *
 * @param {GetNailsRequest} params - 필터 및 페이지네이션 요청 파라미터
 * @returns {Promise<NailListResponse>} 네일 목록 반환
 */
export const fetchNails = async (
  params: GetNailsRequest,
): Promise<NailListResponse> => {
  const query = {
    ...(params.color && { color: params.color }), // 색상 필터
    ...(params.shape && { shape: params.shape }), // 모양 필터
    ...(params.category && { category: params.category }), // 카테고리 필터
    page: params.page, // 페이지 번호
    size: params.size, // 페이지 크기
  };

  return fetcher({
    endpoint: '/nails/', // 네일 목록 조회 API 엔드포인트
    query,
  });
};
