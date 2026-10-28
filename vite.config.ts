import { defineConfig, type Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

function stampServiceWorkerPlugin(): Plugin {
  return {
    name: 'stamp-service-worker',
    apply: 'build',
    closeBundle() {
      const distSwPath = path.resolve(__dirname, 'dist', 'sw.js');
      if (fs.existsSync(distSwPath)) {
        const buildId = Date.now().toString(36);
        let content = fs.readFileSync(distSwPath, 'utf-8');
        content = content.replace(/__SW_BUILD_ID__/g, buildId);
        fs.writeFileSync(distSwPath, content, 'utf-8');
        console.log(`[PWA] Stamped dist/sw.js with BUILD_ID: ${buildId}`);
      }
    },
  };
}

export default defineConfig({
  plugins: [stampServiceWorkerPlugin()],
  base: './',
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8791',
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('chart.js')) {
              return 'vendor-charts';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
          }
        },
      },
    },
  },
});
