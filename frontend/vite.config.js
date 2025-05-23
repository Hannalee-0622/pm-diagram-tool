// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: "/static/",
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',    // Django 서버가 돌고 있는 주소
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, '/api')
        // 만약 Django 쪽 URLconf 에 `/api/generate-plan/` 으로 매핑했다면
        // rewrite 는 사실 필요 없을 수도 있습니다.
      }
    }
  }
})
