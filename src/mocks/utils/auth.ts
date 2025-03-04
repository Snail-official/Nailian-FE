// 액세스 토큰 유효 시간 (밀리초 단위)
const ACCESS_TOKEN_EXPIRY = 1 * 60 * 1000; // 1분
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
