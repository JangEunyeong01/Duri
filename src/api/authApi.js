import api from './axios'
import { unwrapResponse } from './response'

const data = (response) => unwrapResponse(response, '요청 처리에 실패했습니다.')

export const getTerms = () =>
  api.get('/api/terms').then(data)

// 회원가입 요청
// POST /api/auth/signup
// 전달 데이터: name, email, password
// passwordConfirm은 프론트 검증용이라 전달하지 않음
export const signup = (userData) =>
  api.post('/api/auth/signup', userData).then(data)

// 로그인 요청
// POST /api/auth/login
export const login = (loginData) =>
  api.post('/api/auth/login', loginData).then(data)

// 회원가입 이메일 인증 코드 요청
// POST /api/auth/signup/email-verifications
// 전달 데이터: email
export const sendSignupEmailVerification = (email) =>
  api.post('/api/auth/signup/email-verifications', { email }).then(data)

// 회원가입 이메일 인증 코드 검증
// POST /api/auth/signup/email-verifications/verify
// 전달 데이터: email, verificationCode
export const verifySignupEmailVerification = (email, verificationCode) =>
  api
    .post('/api/auth/signup/email-verifications/verify', { email, verificationCode })
    .then(data)

// Access Token 재발급 요청
export const reissueAccessToken = () =>
  api.post('/api/auth/token').then(data)

// 로그아웃 요청
export const logout = () =>
  api.post('/api/auth/logout').then(data)

export const requestPasswordResetCode = (email) =>
  api.post('/api/auth/password/reset-link', { email }).then(data)

export const verifyPasswordResetCode = (email, verificationCode) =>
  api.post('/api/auth/password/verify-code', { email, verificationCode }).then(data)

export const resetPassword = (passwordResetToken, newPassword) =>
  api.post('/api/auth/password/resets', { passwordResetToken, newPassword }).then(data)
