import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // Fallback to empty string to avoid undefined errors in browser
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});