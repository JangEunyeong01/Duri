import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 단위 테스트(Vitest) 설정.
  // 테마 로직이 window.matchMedia 와 document 를 쓰기 때문에
  // 브라우저 환경을 흉내내는 jsdom 위에서 실행한다.
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.js'],
  },
});
