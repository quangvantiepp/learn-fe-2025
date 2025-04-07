import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test:{
    globals: true,
    environment: "jsdom",
    // config for test component and test msw mock api
    setupFiles: ['./src/setupTests.ts','./src/mocks/setup.ts']
  }
})
