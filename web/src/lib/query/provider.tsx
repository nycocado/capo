"use client";

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MotionConfig } from "framer-motion";
import React, { useState } from "react";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
