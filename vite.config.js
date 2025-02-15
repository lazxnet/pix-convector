import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://pix-convector-api-security.onrender.com", // Elimina el puerto
        changeOrigin: true,
        secure: true, // Debe ser true para Render
        //rewrite: (path) => path.replace(/^\/api/, ''),
        ws: true
      }
    }
  }
});