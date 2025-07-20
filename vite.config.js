import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // <-- very important for Vercel static hosting
  build: {
    outDir: 'dist',
  },
});
