// vite.config.ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Si sirves el FRONT por túnel, define esto antes de `npm run dev`:
// PowerShell:  $env:TUNNEL_HOST="tu-front.trycloudflare.com"
// Bash:        export TUNNEL_HOST=tu-front.trycloudflare.com
const TUNNEL_HOST = process.env.TUNNEL_HOST

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,          // escucha en 0.0.0.0
    port: 5173,
    strictPort: true,
    // Permite hosts *.trycloudflare.com (evita "Blocked request. This host is not allowed.")
    allowedHosts: ['.trycloudflare.com'],
    // HMR sobre WSS cuando el FRONT está detrás de túnel HTTPS
    hmr: TUNNEL_HOST
      ? {
          host: TUNNEL_HOST, // subdominio del túnel del FRONT
          protocol: 'wss',
          clientPort: 443,
        }
      : undefined,

    // (OPCIONAL) Proxy para usar mismo origen en dev
    // Si prefieres llamar /api al backend (ya sea local o túnel):
    // proxy: {
    //   '/api': {
    //     target: 'https://TU-BACKEND.trycloudflare.com', // o http://localhost:3333
    //     changeOrigin: true,
    //     secure: false,
    //     rewrite: (p) => p.replace(/^\/api/, ''),
    //   },
    // },
  },
})
