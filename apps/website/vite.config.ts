import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    strictPort: true,
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // manualChunks must be disabled for SSR: React/Three are externalized in SSR mode
        // and Rollup rejects manual chunks for externalized modules.
        manualChunks: isSsrBuild
          ? undefined
          : (id: string) => {
              if (!id.includes('node_modules')) {
                return undefined;
              }
              if (id.includes('react-router')) {
                return 'vendor-router';
              }
              if (/node_modules\/(react|react-dom|scheduler)\//.test(id.replace(/\\/g, '/'))) {
                return 'vendor-react';
              }
              if (id.includes('date-fns') || id.includes('dayjs') || id.includes('luxon')) {
                return 'vendor-date';
              }
              if (id.includes('zod') || id.includes('axios') || id.includes('qs')) {
                return 'vendor-data';
              }
              return 'vendor-misc';
            },
      },
    },
  },
  ssr: {
    // Ensure these packages are bundled into the SSR build rather than externalized
    noExternal: ['react-helmet-async'],
  },
}));
