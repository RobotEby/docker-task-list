// https://vitejs.dev/config/
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,

    port: 5173,

    watch: {
      usePolling: true,
    },

    hmr: {
      clientPort: 5173,
    },
  },
});
