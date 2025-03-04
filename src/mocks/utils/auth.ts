import { HttpResponse } from 'msw';
import users from '../data/users';
import { createErrorResponse } from './response';
import { IUser } from '../data/types'; // 사용자 인터페이스 가져오기

// 액세스 토큰 유효 시간 (밀리초 단위)
const ACCESS_TOKEN_EXPIRY = 1 * 60 * 1000; // 1분

/**
 * 요청 헤더에서 액세스 토큰을 추출하는 함수
 */
export const extractToken = (request: Request): string | null => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

/**
 * 토큰 생성 함수 - 토큰과 만료 시간을 함께 반환
 */
export const generateToken = (prefix: string) => {
  const expiresAt = Date.now() + ACCESS_TOKEN_EXPIRY;
  return {
    token: `${prefix}-${Date.now()}`,
    expiresAt,
  };
};

/**
 * 액세스 토큰 검증 미들웨어
 * 유효한 토큰이면 사용자 정보를 반환, 아니면 401 응답
 */
export const validateToken = async (
  request: Request,
): Promise<HttpResponse | IUser> => {
  const token = extractToken(request);

  // 토큰이 없는 경우
  if (!token) {
    return createErrorResponse('인증이 필요합니다.', 401);
  }

  // 토큰 검증 (모의 데이터에서 일치하는 사용자 찾기)
  const user = users.find(u => u.accessToken === token);

  // 유효하지 않은 토큰
  if (!user) {
    return createErrorResponse('유효하지 않은 토큰입니다.', 401);
  }

  // 토큰 만료 확인
  if (user.tokenExpiresAt && user.tokenExpiresAt < Date.now()) {
    return createErrorResponse('만료된 토큰입니다.', 401);
  }

  // 유효한 토큰이면 사용자 정보 반환
  return user;
};
