/* ─────────────────── 공통 타입 (Common Types) ─────────────────── */

/** 공통 API 응답 타입 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
}

/** 페이지네이션 요청 */
export interface PaginationRequest {
  page: number;
  size: number;
}

/** 페이지네이션 응답 */
export interface PaginatedResponse<T> {
  pageInfo: {
    currentPage: number;
    totalElements: number;
    totalPages: number;
  };
  content: T[];
}

/* ─────────────────── 사용자 (Users) ─────────────────── */

/** 내 정보 조회 응답 */
export type UserMeResponse = ApiResponse<{
  id: number;
  nickname?: string;
  profileImage?: string;
}>;

/** 닉네임 수정 요청 */
export interface UpdateNicknameRequest {
  nickname: string;
}

/** 닉네임 수정 응답 */
export type UpdateNicknameResponse = ApiResponse<null>;

/** 이벤트 응모 응답 */
export type ApplyEventResponse = ApiResponse<null>;

/* ─────────────────── 인증 (Auth) ─────────────────── */

/** 카카오 로그인 요청 */
export interface KakaoAuthRequest {
  kakaoAccessToken: string;
}

/** 카카오 로그인 응답 */
export type KakaoAuthResponse = ApiResponse<{
  accessToken: string;
  refreshToken: string;
}>;

/** Apple 로그인 요청 */
export interface AppleAuthRequest {
  identityToken: string;
  authorizationCode: string;
  user: {
    name: string;
    email: string;
  };
}

/** Apple 로그인 응답 */
export type AppleAuthResponse = ApiResponse<{
  accessToken: string;
  refreshToken: string;
}>;

/** 액세스 토큰 재발급 요청 */
export interface TokenReissueRequest {
  refreshToken: string;
}

/** 액세스 토큰 재발급 응답 */
export type TokenReissueResponse = ApiResponse<{
  accessToken: string;
}>;

/** 로그아웃 응답 */
export type LogoutResponse = ApiResponse<null>;

/** 회원 탈퇴 응답 */
export type DeleteUserResponse = ApiResponse<null>;

/* ─────────────────── 온보딩 (Onboarding) ─────────────────── */

/** 온보딩 상태 조회 요청 */
export interface GetOnboardingStatusRequest {
  maxSupportedVersion: number;
}

type ONBOARDING_PAGE = 'OnboardingNickname' | 'OnboardingPreferences';

/** 온보딩 상태 조회 응답 */
export type GetOnboardingStatusResponse = ApiResponse<{
  nextOnboardingStep: ONBOARDING_PAGE | null;
}>;

/* ─────────────────── 네일 (Nails) ─────────────────── */

/** 네일 디자인 카테고리 */
export type Category = 'ONE_COLOR' | 'FRENCH' | 'GRADIENT' | 'ART';

/** 네일 컬러 */
export type Color =
  | 'WHITE'
  | 'BLACK'
  | 'BEIGE'
  | 'PINK'
  | 'YELLOW'
  | 'GREEN'
  | 'BLUE'
  | 'SILVER';

/** 네일 형태 */
export type Shape = 'SQUARE' | 'ROUND' | 'ALMOND' | 'BALLERINA' | 'STILETTO';

/** 네일 목록 조회 요청 */
export interface GetNailsRequest extends PaginationRequest {
  color?: Color;
  shape?: Shape;
  category?: Category;
  random?: number;
}

/** 네일 목록 조회 응답 */
export type NailListResponse = ApiResponse<
  PaginatedResponse<{
    id: number;
    imageUrl: string;
    shape: Shape;
  }>
>;

/* ─────────────────── 네일 취향 (Nail Preferences) ─────────────────── */

/** 네일 취향 목록 조회 요청 */
export interface GetNailPreferencesRequest extends PaginationRequest {}

/** 네일 취향 목록 조회 응답 */
export type NailPreferencesResponse = ApiResponse<
  PaginatedResponse<{
    id: number;
    imageUrl: string;
  }>
>;

/** 네일 취향 저장 요청 */
export interface SaveNailPreferenceRequest {
  preferences: number[];
}

/** 네일 취향 저장 응답 */
export type SaveNailPreferenceResponse = ApiResponse<null>;

/* ─────────────────── 네일 세트 (Nail Sets) ─────────────────── */

/** 추천 네일 세트 조회 요청 */
export interface GetRecommendedNailSetsRequest {
  limit?: number;
}

/** 네일 세트 ID로 저장 요청 */
export interface SaveNailSetRequest {
  nailSetId: number;
}

/** 네일 세트 저장 응답 */
export type SaveNailSetResponse = ApiResponse<{
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
}>;

/** 네일 세트 목록 조회 응답 */
export type NailSetCollectionResponse = ApiResponse<
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
  }[]
>;

/** 네일 피드 조회 요청 */
export interface GetNailFeedRequest extends PaginationRequest {
  style: {
    id: number;
    name: string;
  };
}

/** 네일 피드 조회 응답 */
export type NailFeedResponse = ApiResponse<
  PaginatedResponse<{
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
  }>
>;

/** 특정 네일 세트 상세 조회 요청 */
export interface GetNailSetDetailRequest {
  nailSetId: number;
}

/** 특정 네일 세트 상세 조회 응답 */
export type NailSetDetailResponse = ApiResponse<{
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
}>;

/** 유사 네일 세트 목록 조회 요청 */
export interface GetSimilarNailSetsRequest extends PaginationRequest {
  nailSetId: number;
  style: {
    id: number;
    name: string;
  };
}

/** 유사 네일 세트 목록 조회 응답 */
export type SimilarNailSetsResponse = ApiResponse<
  PaginatedResponse<{
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
  }>
>;

/** 네일 세트 생성 요청 */
export interface CreateNailSetRequest {
  thumb: {
    id: number;
  };
  index: {
    id: number;
  };
  middle: {
    id: number;
  };
  ring: {
    id: number;
  };
  pinky: {
    id: number;
  };
}

/** 네일 세트 생성 응답 */
export type CreateNailSetResponse = ApiResponse<{
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
}>;

/** 내 네일 세트 목록 조회 요청 */
export interface GetUserNailSetsRequest extends PaginationRequest {}

/** 내 네일 세트 목록 조회 응답 */
export type UserNailSetsResponse = ApiResponse<
  PaginatedResponse<{
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
  }>
>;

/** 네일 세트 삭제 요청 */
export interface DeleteNailSetRequest {
  nailSetId: number;
}

/** 네일 세트 삭제 응답 */
export type DeleteNailSetResponse = ApiResponse<null>;

/* ─────────────────── 배너 (Banners) ─────────────────── */

/** 배너 목록 조회 응답 */
export type BannerResponse = ApiResponse<
  {
    id: number;
    imageUrl: string;
    link: string;
  }[]
>;

/* ─────────────────── 모델 (Models) ─────────────────── */

/** 모델 정보 */
export interface ModelInfo {
  releaseDate: string;
  url: string;
}

/** 최신 모델 정보 응답 */
export type ModelInfoResponse = ApiResponse<{
  models: {
    android: {
      segmentation: ModelInfo;
      detection: ModelInfo;
    };
    ios: {
      segmentation: ModelInfo;
      detection: ModelInfo;
    };
  };
}>;

// API 관련 타입 정의
export type RequestOptions = {
  endpoint: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  query?: Record<string, string | number>;
  body?: Record<string, unknown>;
  timeout: number;
};

export type RequestInterceptor = (
  options: RequestOptions,
) => Promise<RequestOptions> | RequestOptions;

// 기존 Response 타입을 확장
export interface ExtendedResponse extends Response {
  requestInfo?: {
    url: string;
    method: string;
    headers: Headers | Record<string, string>;
    body?: BodyInit_ | null;
    endpoint?: string;
  };
}

// 기존 ResponseInterceptor 타입도 업데이트
export type ResponseInterceptor = (
  response: ExtendedResponse,
) => Promise<ExtendedResponse>;

/**
 * API 에러 클래스
 */
export class APIError extends Error {
  constructor(
    message: string,
    public code: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'APIError';
  }
}
