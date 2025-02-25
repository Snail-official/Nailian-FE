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
  data: T[];
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
export type Category = 'ONE COLOR' | 'FRENCH' | 'GRADIENT' | 'ART';

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
  color?: string;
  shape?: string;
  category?: string;
}

/** 네일 목록 조회 응답 */
export type NailListResponse = ApiResponse<
  PaginatedResponse<{
    id: number;
    imageUrl: string;
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
  selectedPreferences: number[];
}

/** 네일 취향 저장 응답 */
export type SaveNailPreferenceResponse = ApiResponse<null>;

/* ─────────────────── 네일 세트 (Nail Sets) ─────────────────── */

/** 네일 스타일 타입 */
export type NailStyle =
  | 'WEDDING'
  | 'TREND'
  | 'SIMPLE'
  | 'LOVELY'
  | 'PASTEL'
  | 'NUDE'
  | 'DARK'
  | 'NEON'
  | 'GLITTER'
  | 'MATTE'
  | 'CHROME'
  | 'MARBLE'
  | 'OMBRE'
  | 'ANIMAL PRINT'
  | 'FLORAL'
  | 'GEOMETRIC'
  | 'ELEGANT'
  | 'CUTE'
  | 'LUXURY'
  | 'MINIMAL'
  | 'RETRO'
  | 'KOREAN'
  | 'JAPANESE'
  | 'FRENCH TIP'
  | 'SPRING'
  | 'SUMMER'
  | 'AUTUMN'
  | 'WINTER'
  | 'CHRISTMAS'
  | 'HALLOWEEN';

/** 네일 세트 목록 조회 응답 */
export type NailSetCollectionResponse = ApiResponse<
  {
    style: NailStyle;
    nailSets: {
      id: number;
      thumb: string;
      index: string;
      middle: string;
      ring: string;
      pinky: string;
    }[];
  }[]
>;

/** 네일 피드 조회 요청 */
export interface GetNailFeedRequest extends PaginationRequest {
  style: NailStyle;
}

/** 네일 피드 조회 응답 */
export type NailFeedResponse = ApiResponse<
  PaginatedResponse<{
    id: number;
    thumb: string;
    index: string;
    middle: string;
    ring: string;
    pinky: string;
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
  style: NailStyle;
}

/** 유사 네일 세트 목록 조회 응답 */
export type SimilarNailSetsResponse = ApiResponse<
  PaginatedResponse<{
    id: number;
    thumb: string;
    index: string;
    middle: string;
    ring: string;
    pinky: string;
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

/* ─────────────────── 배너 (Banners) ─────────────────── */

/** 배너 목록 조회 응답 */
export type BannerResponse = ApiResponse<
  {
    id: number;
    imageUrl: string;
    link: string;
  }[]
>;
