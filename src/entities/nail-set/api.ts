import fetcher from '../../shared/api/fetcher';
import {
  CreateNailSetRequest,
  CreateNailSetResponse,
  GetNailFeedRequest,
  GetNailSetDetailRequest,
  GetSimilarNailSetsRequest,
  NailFeedResponse,
  NailSetCollectionResponse,
  NailSetDetailResponse,
  PaginationRequest,
  SaveNailSetRequest,
  SaveNailSetResponse,
  SimilarNailSetsResponse,
  UserNailSetsResponse,
} from '../../shared/api/types';

/**
 * 추천 네일 세트 목록을 조회하는 함수
 *
 * @returns {Promise<NailSetCollectionResponse>} 추천 네일 세트 목록 반환
 */
export const fetchRecommendedNailSets =
  async (): Promise<NailSetCollectionResponse> =>
    fetcher({ endpoint: '/nail-sets/recommendations' });

/**
 * 사용자 네일 세트 목록을 조회하는 함수
 *
 * @param {PaginationRequest} params - 페이지네이션 요청 파라미터
 * @returns {Promise<UserNailSetsResponse>} 사용자 네일 세트 목록 반환
 */
export const fetchUserNailSets = async ({
  page = 1,
  size = 10,
}: PaginationRequest): Promise<UserNailSetsResponse> =>
  fetcher({
    endpoint: '/users/me/nail-sets',
    query: { page, size },
  });

/**
 * 사용자 네일 세트를 생성하는 함수
 *
 * @param {CreateNailSetRequest} data - 네일 세트 생성 요청 데이터
 * @returns {Promise<CreateNailSetResponse>} 생성된 네일 세트 정보 반환
 */
export const createUserNailSet = async ({
  thumb,
  index,
  middle,
  ring,
  pinky,
}: CreateNailSetRequest): Promise<CreateNailSetResponse> =>
  fetcher({
    endpoint: '/users/me/nail-sets',
    method: 'POST',
    body: { thumb, index, middle, ring, pinky },
  });

/**
 * 네일 세트 피드를 조회하는 함수
 *
 * @param {GetNailFeedRequest} params - 스타일 및 페이지네이션 요청 파라미터
 * @returns {Promise<NailFeedResponse>} 네일 세트 피드 데이터 반환
 */
export const fetchNailSetFeed = async ({
  style,
  page = 1,
  size = 9,
}: GetNailFeedRequest): Promise<NailFeedResponse> =>
  fetcher({
    endpoint: '/nail-sets/feed',
    query: { style: style.id, page, size },
  });

/**
 * 특정 네일 세트 상세 정보를 조회하는 함수
 *
 * @param {GetNailSetDetailRequest} params - 네일 세트 ID
 * @returns {Promise<NailSetDetailResponse>} 네일 세트 상세 정보 반환
 */
export const fetchNailSetDetail = async ({
  nailSetId,
}: GetNailSetDetailRequest): Promise<NailSetDetailResponse> =>
  fetcher({
    endpoint: `/nail-sets/${nailSetId}`,
  });

/**
 * 특정 네일 세트와 유사한 네일 세트를 조회하는 함수
 *
 * @param {GetSimilarNailSetsRequest} params - 네일 세트 ID 및 스타일, 페이지네이션 요청 파라미터
 * @returns {Promise<SimilarNailSetsResponse>} 유사한 네일 세트 목록 반환
 */
export const fetchSimilarNailSets = async ({
  nailSetId,
  style,
  page = 1,
  size = 9,
}: GetSimilarNailSetsRequest): Promise<SimilarNailSetsResponse> =>
  fetcher({
    endpoint: `/nail-sets/${nailSetId}/similar`,
    query: { style: style.id, page, size },
  });

/**
 * 네일 세트 ID로 사용자 보관함에 저장하는 함수
 *
 * @param {SaveNailSetRequest} data - 저장할 네일 세트 ID
 * @returns {Promise<SaveNailSetResponse>} 저장된 네일 세트 정보 반환
 */
export const saveUserNailSet = async ({
  nailSetId,
}: SaveNailSetRequest): Promise<SaveNailSetResponse> =>
  fetcher({
    endpoint: '/users/me/nail-sets/save',
    method: 'POST',
    body: { nailSetId },
  });
