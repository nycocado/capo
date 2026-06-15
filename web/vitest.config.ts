/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // Reaproveita os aliases de tsconfig.json (@/, @components, ...) nativamente.
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // Restringe a coleta aos testes de unidade/hook; os E2E ficam com o Playwright.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
