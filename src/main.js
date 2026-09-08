import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Pinia 상태 관리
import { createPinia } from 'pinia'

import '@/assets/styles/tokens.css';
import { applyTheme, getStoredTheme } from '@/composables/useTheme';

// 테마 초기화 (App 생성 전) — 'system' 저장값도 실제 라이트/다크로 환산해서 적용한다.
// 여기서 환산하지 않고 'system' 을 그대로 넣으면 tokens.css 의 [data-theme="dark"] 에
// 걸리지 않아, OS 가 다크인 사용자에게 첫 화면이 라이트로 그려졌다가 바뀐다.
applyTheme(getStoredTheme());

const app = createApp(App)


// 전역 상태 관리 등록
app.use(createPinia())


// 라우터 등록
app.use(router)


app.mount('#app')