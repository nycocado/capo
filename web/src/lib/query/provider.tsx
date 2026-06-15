"use client";

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { useState } from "react";

/**
 * Cria um QueryClient com os defaults do projeto.
 *
 * @returns Uma nova instância de QueryClient.
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Evita refetch imediato logo após a hidratação do prefetch RSC.
        staleTime: 60 * 1000,
      },
    },
  });
}

// No servidor cada request precisa de um client isolado; no browser
// reutilizamos um singleton para preservar o cache entre re-renders.
let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

/**
 * Provê o cache do TanStack Query à árvore e monta as Devtools em dev.
 *
 * @param children Subárvore que terá acesso às queries/mutations.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState garante que o client do browser não seja recriado a cada render.
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
