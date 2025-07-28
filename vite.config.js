import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // ✅ Needed to prevent blank screen
  build: {
    outDir: 'dist'
  }
});
