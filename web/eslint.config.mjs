import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    // Escopo nos arquivos TS, onde o eslint-config-next registra o plugin
    // @typescript-eslint (severidade != "off" exige o plugin em escopo).
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Aviso por enquanto (há ~36 `any` no código legado); vira erro na Fase 4,
      // quando a meta passa a ser zero `any`.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // react-hooks v7 trouxe regras de correção novas e estritas que sinalizam
    // os hooks legados (useWebSocket, workflows de cada etapa). Mantidas como
    // aviso até a refatoração dos hooks reescrever/remover esses arquivos.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/error-boundaries": "warn",
    },
  },
]);

export default eslintConfig;
