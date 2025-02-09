import { HttpResponse } from 'msw';

/* ─────────────────── 응답 유틸 함수 (Response Utility Functions) ─────────────────── */

/**
 * 성공 응답을 생성하는 함수
 *
 * @template T 응답 데이터 타입
 * @param {T} data 응답 데이터
 * @param {string} [message="요청 성공"] 응답 메시지 (기본값: "요청 성공")
 * @param {number} [code=200] HTTP 상태 코드 (기본값: 200)
 * @returns {HttpResponse} JSON 형식의 성공 응답 객체
 */
export const createSuccessResponse = <T>(
  data: T,
  message: string = '요청 성공',
  code: number = 200,
) =>
  HttpResponse.json({
    code,
    message,
    data,
  });

/**
 * 실패 응답을 생성하는 함수
 *
 * @param {string} message 오류 메시지
 * @param {number} code HTTP 상태 코드
 * @returns {HttpResponse} JSON 형식의 오류 응답 객체
 */
export const createErrorResponse = (message: string, code: number) =>
  HttpResponse.json(
    {
      code,
      message,
    },
    { status: code }, // HTTP 응답 상태 코드 설정
  );
