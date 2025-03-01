import { http } from 'msw';
import { API_BASE_URL } from '@env';
import nails from '../data/nails';
import styles from '../data/nailPreferences';
import nailSets from '../data/nailSets';
import users from '../data/users';
import createPaginatedResponse from '../utils/pagination';
import {
  NailListResponse,
  SaveNailPreferenceRequest,
  SaveNailPreferenceResponse,
  NailSetCollectionResponse,
  GetUserNailSetsRequest,
  UserNailSetsResponse,
  CreateNailSetRequest,
  CreateNailSetResponse,
  NailSetDetailResponse,
  SimilarNailSetsResponse,
  NailPreferencesResponse,
  GetNailsRequest,
  GetNailPreferencesRequest,
  NailFeedResponse,
} from '../../shared/api/types';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import { ONBOARDING_FLAGS } from '../constants/onboarding';

/* ─────────────────── 네일 API 핸들러 (Nail API Handlers) ─────────────────── */

const nailHandlers = [
  /**
   * 네일 목록 조회 API (필터 및 페이지네이션 적용)
   *
   * @endpoint GET /nails
   * @response {NailListResponse} 네일 목록 반환
   * @returns 성공 시 네일 목록, 실패 시 오류 응답
   */
  http.get(`${API_BASE_URL}/nails`, async ({ request }) => {
    try {
      const url = new URL(request.url);
      const query: GetNailsRequest = {
        color: url.searchParams.get('color') || undefined,
        shape: url.searchParams.get('shape') || undefined,
        category: url.searchParams.get('category') || undefined,
        page: Number(url.searchParams.get('page')) || 1,
        size: Number(url.searchParams.get('size')) || 10,
      };

      let filteredNails = [...nails];

      if (query.color) {
        filteredNails = filteredNails.filter(
          nail => nail.color.toLowerCase() === query.color!.toLowerCase(),
        );
      }
      if (query.shape) {
        filteredNails = filteredNails.filter(
          nail => nail.shape.toLowerCase() === query.shape!.toLowerCase(),
        );
      }
      if (query.category) {
        filteredNails = filteredNails.filter(
          nail => nail.category.toLowerCase() === query.category!.toLowerCase(),
        );
      }

      const simplifiedNails = filteredNails.map(({ id, imageUrl }) => ({
        id,
        imageUrl,
      }));

      const paginatedResponse = createPaginatedResponse(
        simplifiedNails,
        query.page,
        query.size,
      );

      const response: NailListResponse = {
        code: 200,
        message: '네일 목록 조회 성공',
        data: paginatedResponse,
      };

      return createSuccessResponse(response.data, response.message);
    } catch (error) {
      return createErrorResponse(
        '네일 데이터를 불러오는 중 오류가 발생했습니다.',
        500,
      );
    }
  }),

  /**
   * 네일 취향 목록 조회 API
   *
   * @endpoint GET /nails/preferences
   * @response {NailPreferencesResponse} 네일 취향 목록 반환
   * @returns 성공 시 네일 취향 목록, 실패 시 오류 응답
   */
  http.get(`${API_BASE_URL}/nails/preferences`, async ({ request }) => {
    const url = new URL(request.url);

    const query: GetNailPreferencesRequest = {
      page: Number(url.searchParams.get('page')) || 1,
      size: Number(url.searchParams.get('size')) || 9,
    };

    const filteredStyles = styles.map(({ id, imageUrl }) => ({ id, imageUrl }));
    const paginatedResponse = createPaginatedResponse(
      filteredStyles,
      query.page,
      query.size,
    );

    const response: NailPreferencesResponse = {
      code: 200,
      message: '네일 취향 리스트 조회 성공',
      data: paginatedResponse,
    };

    return createSuccessResponse(response.data, response.message);
  }),

  /**
   * 네일 취향 저장 API
   *
   * @endpoint POST /nails/preferences
   * @response {SaveNailPreferenceResponse} 저장 결과 반환
   * @returns 성공 시 저장 결과, 실패 시 오류 응답
   */
  http.post(`${API_BASE_URL}/nails/preferences`, async ({ request }) => {
    const body = (await request.json()) as SaveNailPreferenceRequest;
    const user = users[0];

    if (!Array.isArray(body.preferences) || body.preferences.length < 3) {
      return createErrorResponse(
        '최소 3개 이상의 네일을 선택해야 합니다.',
        422,
      );
    }
    if (body.preferences.length > 10) {
      return createErrorResponse('최대 10개까지 선택할 수 있습니다.', 400);
    }

    // 기존 네일 취향이 없는 경우 온보딩 과정
    const isOnboarding = user.preferredStyles.length === 0;

    // 네일 취향 저장
    user.preferredStyles = body.preferences.map(id => styles[id]);

    if (isOnboarding) {
      // 온보딩 과정이라면, 온보딩 진행 상태 업데이트 (비트 연산 |= 사용)
      if (!(user.onboardingProgress & ONBOARDING_FLAGS.OnboardingPreferences)) {
        user.onboardingProgress |= ONBOARDING_FLAGS.OnboardingPreferences;
      }
    }

    const response: SaveNailPreferenceResponse = {
      code: 200,
      message: '선호 취향 저장 완료',
    };

    return createSuccessResponse(null, response.message);
  }),

  /**
   * 추천 네일 세트 조회 API
   *
   * @endpoint GET /nail-sets/recommendations
   * @response {NailSetCollectionResponse} 추천 네일 세트 목록 반환
   * @returns 성공 시 추천 네일 세트 목록, 실패 시 오류 응답
   */
  http.get(`${API_BASE_URL}/nail-sets/recommendations`, async () => {
    const recommendNailStyle = ['SIMPLE', 'TREND', 'WEDDING'];

    if (!nailSets || nailSets.length === 0) {
      return createErrorResponse('추천 네일 데이터를 찾을 수 없습니다.', 404);
    }

    const filteredNailSets = nailSets.filter(
      nailSet =>
        nailSet.style.some(style => recommendNailStyle.includes(style)) &&
        !nailSet.user,
    );

    const groupedNailSets: Record<
      string,
      {
        style: {
          id: number;
          name: string;
        };
        nailSets: {
          id: number;
          thumb: {
            imageUrl: string;
          };
          index: {
            imageUrl: string;
          };
          middle: {
            imageUrl: string;
          };
          ring: {
            imageUrl: string;
          };
          pinky: {
            imageUrl: string;
          };
        }[];
      }
    > = {} as Record<
      string,
      {
        style: {
          id: number;
          name: string;
        };
        nailSets: {
          id: number;
          thumb: {
            imageUrl: string;
          };
          index: {
            imageUrl: string;
          };
          middle: {
            imageUrl: string;
          };
          ring: {
            imageUrl: string;
          };
          pinky: {
            imageUrl: string;
          };
        }[];
      }
    >;

    filteredNailSets.forEach(nailSet => {
      nailSet.style.forEach(style => {
        if (recommendNailStyle.includes(style)) {
          const styleId = recommendNailStyle.indexOf(style);

          groupedNailSets[style] = groupedNailSets[style] ?? {
            style: {
              id: styleId,
              name: style,
            },
            nailSets: [],
          };

          groupedNailSets[style].nailSets.push({
            id: nailSet.id,
            thumb: {
              imageUrl: nailSet.thumb.imageUrl,
            },
            index: {
              imageUrl: nailSet.index.imageUrl,
            },
            middle: {
              imageUrl: nailSet.middle.imageUrl,
            },
            ring: {
              imageUrl: nailSet.ring.imageUrl,
            },
            pinky: {
              imageUrl: nailSet.pinky.imageUrl,
            },
          });
        }
      });
    });

    const response: NailSetCollectionResponse = {
      code: 200,
      message: '추천 네일 세트 조회 성공',
      data: Object.values(groupedNailSets),
    };

    return createSuccessResponse(response.data, response.message);
  }),

  /**
   * 사용자 네일 세트 목록 조회 API
   *
   * @endpoint GET /users/me/nail-sets
   * @response {UserNailSetsResponse} 사용자 네일 세트 목록 반환
   * @returns 성공 시 사용자 네일 세트 목록, 실패 시 오류 응답
   */
  http.get(`${API_BASE_URL}/users/me/nail-sets`, async ({ request }) => {
    const url = new URL(request.url);
    const query: GetUserNailSetsRequest = {
      page: Number(url.searchParams.get('page')) || 1,
      size: Number(url.searchParams.get('size')) || 10,
    };

    const userId = users[0].id;

    const userNailSets = nailSets.filter(set => set.user?.id === userId);

    const simplifiedNailSets = userNailSets.map(set => ({
      id: set.id,
      thumb: { imageUrl: set.thumb.imageUrl },
      index: { imageUrl: set.index.imageUrl },
      middle: { imageUrl: set.middle.imageUrl },
      ring: { imageUrl: set.ring.imageUrl },
      pinky: { imageUrl: set.pinky.imageUrl },
    }));

    const paginatedResponse = createPaginatedResponse(
      simplifiedNailSets,
      query.page,
      query.size,
    );

    const response: UserNailSetsResponse = {
      code: 200,
      message: '사용자의 네일 세트 조회 성공',
      data: paginatedResponse,
    };

    return createSuccessResponse(response.data, response.message);
  }),

  /**
   * 사용자 네일 세트 생성 API
   *
   * @endpoint POST /users/me/nail-sets
   * @response {CreateNailSetResponse} 생성된 네일 세트 정보 반환
   * @returns 성공 시 생성된 네일 세트 정보, 실패 시 오류 응답
   */
  http.post(`${API_BASE_URL}/users/me/nail-sets`, async ({ request }) => {
    const body = (await request.json()) as CreateNailSetRequest;

    if (
      !body.thumb ||
      !body.index ||
      !body.middle ||
      !body.ring ||
      !body.pinky
    ) {
      return createErrorResponse(
        '모든 손가락에 대한 네일 정보를 제공해야 합니다.',
        400,
      );
    }

    const thumb = nails.find(n => n.id === body.thumb.id);
    const index = nails.find(n => n.id === body.index.id);
    const middle = nails.find(n => n.id === body.middle.id);
    const ring = nails.find(n => n.id === body.ring.id);
    const pinky = nails.find(n => n.id === body.pinky.id);

    if (!thumb || !index || !middle || !ring || !pinky) {
      return createErrorResponse(
        '유효하지 않은 네일 ID가 포함되어 있습니다.',
        400,
      );
    }

    const newNailSet = {
      id: nailSets.length + 1,
      user: users[0],
      thumb,
      index,
      middle,
      ring,
      pinky,
      style: [],
    };

    nailSets.push(newNailSet);

    const response: CreateNailSetResponse = {
      code: 201,
      message: '네일 세트가 성공적으로 생성되었습니다.',
      data: {
        id: newNailSet.id,
        thumb: { imageUrl: newNailSet.thumb.imageUrl },
        index: { imageUrl: newNailSet.index.imageUrl },
        middle: { imageUrl: newNailSet.middle.imageUrl },
        ring: { imageUrl: newNailSet.ring.imageUrl },
        pinky: { imageUrl: newNailSet.pinky.imageUrl },
      },
    };

    return createSuccessResponse(response.data, response.message, 201);
  }),

  /**
   * 특정 스타일의 네일 세트 피드 조회 API
   *
   * @endpoint GET /nail-sets/feed
   * @response {NailFeedResponse} 네일 세트 피드 반환
   * @returns 성공 시 네일 세트 피드, 실패 시 오류 응답
   */
  http.get(`${API_BASE_URL}/nail-sets/feed`, async ({ request }) => {
    const url = new URL(request.url);
    const styleId = Number(url.searchParams.get('style'));
    const page = Number(url.searchParams.get('page')) || 1;
    const size = Number(url.searchParams.get('size')) || 9;

    if (Number.isNaN(styleId)) {
      return createErrorResponse('올바른 스타일 ID를 지정해야 합니다.', 400);
    }

    // 스타일 ID를 기반으로 스타일 이름 찾기 (예시로 매핑 사용)
    const styleMap = {
      0: 'SIMPLE',
      1: 'TREND',
      2: 'WEDDING',
    };

    const styleName = styleMap[styleId as keyof typeof styleMap];

    if (!styleName) {
      return createErrorResponse('존재하지 않는 스타일입니다.', 404);
    }

    const filteredNailSets = nailSets.filter(
      nailSet => nailSet.style.includes(styleName) && !nailSet.user,
    );

    if (filteredNailSets.length === 0) {
      return createErrorResponse(
        '해당 스타일의 네일 세트를 찾을 수 없습니다.',
        404,
      );
    }

    const formattedNailSets = filteredNailSets.map(nailSet => ({
      id: nailSet.id,
      thumb: { imageUrl: nailSet.thumb.imageUrl },
      index: { imageUrl: nailSet.index.imageUrl },
      middle: { imageUrl: nailSet.middle.imageUrl },
      ring: { imageUrl: nailSet.ring.imageUrl },
      pinky: { imageUrl: nailSet.pinky.imageUrl },
    }));

    const paginatedResponse = createPaginatedResponse(
      formattedNailSets,
      page,
      size,
    );

    const response: NailFeedResponse = {
      code: 200,
      message: '네일 세트 피드 조회 성공',
      data: paginatedResponse,
    };

    return createSuccessResponse(response.data, response.message);
  }),

  /**
   * 특정 네일 세트 상세 조회 API
   *
   * @endpoint GET /nail-sets/:nailSetId
   * @response {NailSetDetailResponse} 네일 세트 상세 정보 반환
   * @returns 성공 시 네일 세트 상세 정보, 실패 시 오류 응답
   */
  http.get(`${API_BASE_URL}/nail-sets/:nailSetId`, async ({ params }) => {
    const { nailSetId } = params;
    const nailSet = nailSets.find(set => set.id.toString() === nailSetId);

    if (!nailSet) {
      return createErrorResponse('해당 네일 세트를 찾을 수 없습니다.', 404);
    }

    const response: NailSetDetailResponse = {
      code: 200,
      message: '네일 세트 조회 성공',
      data: {
        id: nailSet.id,
        thumb: { imageUrl: nailSet.thumb.imageUrl },
        index: { imageUrl: nailSet.index.imageUrl },
        middle: { imageUrl: nailSet.middle.imageUrl },
        ring: { imageUrl: nailSet.ring.imageUrl },
        pinky: { imageUrl: nailSet.pinky.imageUrl },
      },
    };

    return createSuccessResponse(response.data, response.message);
  }),

  /**
   * 유사한 네일 세트 조회 API
   *
   * @endpoint GET /nail-sets/:nailSetId/similar
   * @response {SimilarNailSetsResponse} 유사한 네일 세트 목록 반환
   * @returns 성공 시 유사한 네일 세트 목록, 실패 시 오류 응답
   */
  http.get(
    `${API_BASE_URL}/nail-sets/:nailSetId/similar`,
    async ({ params, request }) => {
      const { nailSetId } = params;
      const url = new URL(request.url);
      const styleId = Number(url.searchParams.get('style'));
      const page = Number(url.searchParams.get('page')) || 1;
      const size = Number(url.searchParams.get('size')) || 9;

      if (Number.isNaN(styleId)) {
        return createErrorResponse('올바른 스타일 ID를 지정해야 합니다.', 400);
      }

      // 스타일 ID를 기반으로 스타일 이름 찾기
      const styleMap = {
        0: 'SIMPLE',
        1: 'TREND',
        2: 'WEDDING',
      };

      const styleName = styleMap[styleId as keyof typeof styleMap];

      if (!styleName) {
        return createErrorResponse('존재하지 않는 스타일입니다.', 404);
      }

      const similarNailSets = nailSets.filter(
        set =>
          set.style.includes(styleName) &&
          set.id.toString() !== nailSetId &&
          !set.user,
      );

      if (similarNailSets.length === 0) {
        return createErrorResponse('유사한 네일 세트를 찾을 수 없습니다.', 404);
      }

      const transformedSets = similarNailSets.map(set => ({
        id: set.id,
        thumb: { imageUrl: set.thumb.imageUrl },
        index: { imageUrl: set.index.imageUrl },
        middle: { imageUrl: set.middle.imageUrl },
        ring: { imageUrl: set.ring.imageUrl },
        pinky: { imageUrl: set.pinky.imageUrl },
      }));

      const paginatedResponse = createPaginatedResponse(
        transformedSets,
        page,
        size,
      );

      const response: SimilarNailSetsResponse = {
        code: 200,
        message: '유사한 네일 세트 조회 성공',
        data: paginatedResponse,
      };

      return createSuccessResponse(response.data, response.message);
    },
  ),
];

export default nailHandlers;
