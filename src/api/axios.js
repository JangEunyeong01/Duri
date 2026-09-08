import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 모든 API 요청에 Access Token 자동 첨부
api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
)

let isRefreshing = false
let refreshQueue = []

const addRefreshQueue = (callback) => {
  refreshQueue.push(callback)
}

const runRefreshQueue = (newAccessToken) => {
  refreshQueue.forEach((callback) => callback(newAccessToken))
  refreshQueue = []
}

// 401 발생 시 Access Token 재발급 후 원래 요청 재시도
api.interceptors.response.use(
    (response) => response,

    async (error) => {
      const originalRequest = error.config
      const status = error.response?.status

      if (!originalRequest) {
        return Promise.reject(error)
      }

      const requestUrl = originalRequest.url || ''

      const isAuthRequest =
          requestUrl.includes('/api/auth/login') ||
          requestUrl.includes('/api/auth/token') ||
          requestUrl.includes('/api/auth/logout') ||
          requestUrl.includes('/api/auth/signup') ||
          requestUrl.includes('/api/terms')

      if (status !== 401 || originalRequest._retry || isAuthRequest) {
        return Promise.reject(error)
      }

      // 토큰을 갖고 있지도 않은데 401이 왔다면 "만료"가 아니라 애초에 비로그인이다.
      // 재발급을 시도할 근거가 없고(리프레시도 없다), "로그인이 만료되었습니다"는 사실과
      // 다른 안내가 되며, 무엇보다 비로그인 UI를 갖춘 화면들(홈·카드목록·포인트·결제·설정)이
      // 로그인 화면으로 튕겨나간다 — 로그인/회원가입의 "나중에 하기"가 먹히지 않던 원인.
      // 그냥 401을 돌려주면 각 화면이 "로그인 후 이용할 수 있어요" 상태로 렌더링된다.
      // (access token 이 만료된 경우에는 만료된 문자열이 그대로 남아 있으므로
      //  아래 재발급 흐름은 지금처럼 정상 동작한다.)
      if (!localStorage.getItem('token')) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshQueue((newAccessToken) => {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            resolve(api(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        const response = await api.post('/api/auth/token')

        const newAccessToken = response.data?.data?.accessToken

        if (!newAccessToken) {
          throw new Error('Access Token 재발급 응답이 비어 있습니다.')
        }

        const authStore = useAuthStore()
        authStore.setAccessToken(newAccessToken)

        runRefreshQueue(newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return api(originalRequest)
      } catch (refreshError) {
        const authStore = useAuthStore()
        authStore.logout()

        // alert()는 페이지 이동 전에 사용자가 메시지를 읽도록 강제로 막아줬다.
        // 토스트는 non-blocking이라 곧장 이동하면 뜨자마자 화면이 바뀌어 못 본다 —
        // 리다이렉트를 살짝 늦춰 토스트를 읽을 시간을 준다.
        const { showToast } = useToast()
        showToast('error', '로그인이 만료되었습니다. 다시 로그인해주세요.')
        setTimeout(() => {
          window.location.href = '/auth/login'
        }, 1500)

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
)

export default api
