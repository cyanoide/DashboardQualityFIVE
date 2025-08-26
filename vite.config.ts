// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ⚠️ Mets exactement le nom de TON repo entre deux slashs :
  base: '/DashboardQualityFIVE/',   // ← indispensable pour GitHub Pages (project pages)
})
