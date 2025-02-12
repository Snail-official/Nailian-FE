import fetcher from '../../shared/api/fetcher';
import {
  NailPreferencesResponse,
  SaveNailPreferenceRequest,
  SaveNailPreferenceResponse,
} from '../../shared/api/types';

/**
 * 네일 취향 목록을 조회하는 함수
 *
 * @returns {Promise<NailPreferencesResponse>} 네일 취향 목록 데이터 반환
 */
export const fetchNailPreferences = (): Promise<NailPreferencesResponse> =>
  fetcher({
    endpoint: '/nails/preferences', // 네일 취향 조회 API 엔드포인트
  });

/**
 * 사용자의 네일 취향을 저장하는 함수
 *
 * @param {SaveNailPreferenceRequest} data - 선택한 네일 취향 데이터
 * @returns {Promise<SaveNailPreferenceResponse>} 저장 결과 반환
 */
export const saveNailPreferences = ({
  selectedPreferences,
}: SaveNailPreferenceRequest): Promise<SaveNailPreferenceResponse> =>
  fetcher({
    endpoint: '/nails/preferences', // 네일 취향 저장 API 엔드포인트
    method: 'POST',
    body: { selectedPreferences },
  });
