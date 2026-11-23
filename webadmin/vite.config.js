import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/webadmin-app/" : "/",
  plugins: [react()],
  server: { port: 5174 },
  build: {
    outDir: "../public/webadmin-app",
    emptyOutDir: true,
  },
}));
