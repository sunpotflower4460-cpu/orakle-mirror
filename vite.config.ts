import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    rollupOptions: {
      // 本番ビルド時に src/dev/ 以下を除外
      external: command === 'build' ? [/\/src\/dev\//] : [],
    },
  },
}));
