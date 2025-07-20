import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // ✅ required to fix blank screen
  build: {
    outDir: 'dist'
  }
});
