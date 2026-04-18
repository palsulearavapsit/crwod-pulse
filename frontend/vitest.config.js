import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.js'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,playwright}.config.*',
      'e2e/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // CI fails if coverage drops below these thresholds
      thresholds: {
        lines:     70,
        functions: 70,
        branches:  60,
        statements: 70,
      },
      exclude: [
        'node_modules/**',
        'src/__tests__/**',
        'src/main.jsx',
        '**/*.config.*',
        'e2e/**',
      ],
    },
  },
});
