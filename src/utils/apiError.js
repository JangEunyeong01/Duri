// axios는 4xx/5xx에서 reject하므로 error.response.data에 ApiResponse가 들어 있다.
// 네트워크 단절 등 response 자체가 없는 에러는 error.message를 쓴다.
export const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback
