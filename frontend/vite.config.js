import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cấu hình Vite cơ bản cho PetCare System frontend.
// Port 5173 khớp với CLIENT_URL mặc định trong backend/.env.example (CORS).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
