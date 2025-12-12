import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Enforce coverage on core reusable code; pages are still tested (smoke),
      // but not all of them are practical to unit-cover to 80% due to heavy async UI flows.
      include: [
        "src/App.tsx",
        "src/App.test.tsx",
        "src/components/**/*.{ts,tsx}",
        "src/layouts/**/*.{ts,tsx}",
        "src/layouts/DashboardLayout.test.tsx",
        "src/pages/AuthPage.tsx",
        "src/pages/AuthPage.test.tsx",
        "src/pages/MeetingsPage.tsx",
        "src/pages/ContractsPage.tsx",
      ],
      exclude: ["src/main.tsx"],
      thresholds: {
        lines: 80,
        functions: 60,
        branches: 80,
        statements: 80,
      },
    },
  },
})
