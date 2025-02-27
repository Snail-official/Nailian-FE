import fetcher from '../../shared/api/fetcher';
import {
  GetNailPreferencesRequest,
  NailPreferencesResponse,
  SaveNailPreferenceRequest,
  SaveNailPreferenceResponse,
} from '../../shared/api/types';

/**
 * 네일 취향 목록을 조회하는 함수
 *
 * @param {number} page - 조회할 페이지 번호 (기본값: 1)
 * @param {number} size - 한 페이지에 가져올 항목 개수 (기본값: 9)
 * @returns {Promise<NailPreferencesResponse>} 네일 취향 목록 데이터 반환
 */
export const fetchNailPreferences = ({
  page = 1,
  size = 9,
}: GetNailPreferencesRequest): Promise<NailPreferencesResponse> =>
  fetcher({
    endpoint: '/nails/preferences', // 네일 취향 조회 API 엔드포인트
    query: {
      page, // 페이지 번호
      size, // 페이지 크기
    },
  });

/**
 * 사용자의 네일 취향을 저장하는 함수
 *
 * @param {SaveNailPreferenceRequest} data - 선택한 네일 취향 데이터
 * @returns {Promise<SaveNailPreferenceResponse>} 저장 결과 반환
 */
export const saveNailPreferences = ({
  preferences,
}: SaveNailPreferenceRequest): Promise<SaveNailPreferenceResponse> =>
  fetcher({
    endpoint: '/nails/preferences', // 네일 취향 저장 API 엔드포인트
    method: 'POST',
    body: { preferences },
  });
