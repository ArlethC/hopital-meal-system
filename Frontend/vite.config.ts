import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true, 
      },
    },
    host: true,
    port: 5174,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'react-feather'],
          timepicker: ['react-time-picker']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@miapp/shared': resolve(__dirname, '../shared'),
    }
  }
})
