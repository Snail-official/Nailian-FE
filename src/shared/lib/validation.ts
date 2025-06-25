/**
 * 유효성 검사 유틸
 */

// 한글, 영문, 숫자만 허용하는 유효성 검사 함수
export const hasSpecialCharacters = (text: string): boolean =>
  !/^[가-힣a-zA-Z0-9\s]+$/.test(text);

// 이메일 또는 전화번호 형식 유효성 검사 함수
export const isValidUserInfo = (value: string): boolean => {
  // 빈 값 체크
  if (!value.trim()) {
    return false;
  }
  // 이메일 및 전화번호 정규식
  const regex =
    /(^[^@]+@[^@.]+\.[^@.\n]+$)|(^0[15-9][0-9]{1,2}-[0-9]{3,4}-[0-9]{3,5}$)/;
  return regex.test(value);
};
