/// <reference types="vitest/config" />
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import { apiDevServer } from "./vite/apiDevServer";

export default defineConfig(({ mode }) => {
  // Serverless functions under /api read secrets from `process.env`, so mirror
  // every variable from .env files into the Node process during development.
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    plugins: [react(), tailwindcss(), apiDevServer()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@shared": fileURLToPath(new URL("./shared", import.meta.url)),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      // Allow the hosted preview domain (*.e2b.app) to reach the dev server.
      allowedHosts: true,
      cors: true,
    },
    preview: {
      host: "0.0.0.0",
      port: 4173,
      allowedHosts: true,
      cors: true,
    },
    build: {
      target: "es2022",
      cssTarget: "chrome111",
      sourcemap: false,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
          },
        },
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.{test,spec}.{ts,tsx}", "shared/**/*.test.ts", "api/**/*.test.ts"],
      css: false,
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        include: ["src/lib/**", "src/hooks/**", "src/data/**", "src/components/**", "shared/**", "api/**"],
      },
    },
  };
});
