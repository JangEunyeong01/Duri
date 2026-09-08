// 공통 응답 언랩 헬퍼.
// 성공 응답은 { success: true, code, data, message: null }, 실패는
// { success: false, code, message, errors } 봉투로 온다 (CLAUDE.md 참고).
// success: false면 서버 메시지(없으면 fallbackMessage)로 에러를 던지고,
// 성공이면 data를 벗겨서 돌려준다 (data가 없는 응답은 body 그대로).
export const unwrapResponse = (response, fallbackMessage) => {
  const body = response.data
  if (body?.success === false) {
    const error = new Error(body.message || fallbackMessage)
    error.code = body.code
    throw error
  }
  return body?.data ?? body
}
