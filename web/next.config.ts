import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Gera o bundle standalone (.next/standalone + server.js) para a imagem de produção.
  output: "standalone",
  sassOptions: {
    includePaths: [path.join(__dirname, "node_modules")],
  },
};

export default nextConfig;
