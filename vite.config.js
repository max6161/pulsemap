import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',             // ✅ Добавляем это
  plugins: [react()],
})