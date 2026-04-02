import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'node:path';

const buildCspContent = (apiUrl: string): string => {
  const apiOrigin = new URL(apiUrl).origin;
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https://res.cloudinary.com data:",
    "font-src 'self'",
    `connect-src 'self' ${apiOrigin}`,
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
};

const cspMetaTag = (): Plugin => ({
  name: 'csp-meta-tag',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      const apiUrl = process.env.VITE_API_URL ?? 'http://localhost:3000';
      const csp = buildCspContent(apiUrl);
      return html.replace(
        '</head>',
        `    <meta http-equiv="Content-Security-Policy" content="${csp}" />\n  </head>`,
      );
    },
  },
  apply: 'build',
});

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
    cspMetaTag(),
    process.env.ANALYZE === 'true' &&
      visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    strictPort: true,
  },
});
