import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SUPABASE_HOST = 'https://*.supabase.co';

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",   // unsafe-inline needed for Vite HMR in dev
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        `connect-src 'self' https://api.github.com ${SUPABASE_HOST}`,
        "img-src 'self' data:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; '),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
})
