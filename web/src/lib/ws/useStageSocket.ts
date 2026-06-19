"use client";

import { useEffect, useRef } from "react";
import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { createStageSocket } from "./socket";
import { WS_EVENTS } from "@/routes";

export interface UseStageSocketOptions {
  /** URL do namespace da etapa (ver `WS_ROUTES`). */
  route: string;
  /** Query key da lista mantida em cache. */
  queryKey: QueryKey;
  /** Nomes de evento do gateway que disparam revalidação da lista. */
  eventNames: string[];
  /** Quando `false`, não abre a conexão. */
  enabled?: boolean;
  /**
   * Callback extra executado depois de cada evento, além de invalidar a lista.
   * Usado para invalidar o cache de detalhe.
   */
  onEvent?: () => void;
}

// Logs de conexão ficam atrás da flag de dev para não poluir produção.
const isDev = process.env.NODE_ENV !== "production";

/**
 * Mantém a lista em cache do TanStack Query sincronizada com os eventos em
 * tempo real de uma etapa. Os eventos (`claimChanged`/`statusChanged`) são
 * meras notificações — cada um **invalida** a query, deixando o servidor
 * recomputar os campos derivados (progress/available/claimedBy) no refetch.
 * O callback `onEvent` é chamado adicionalmente (ex.: para invalidar o detalhe).
 *
 * A `queryKey` pode mudar de referência entre renders (é lida via ref), então a
 * conexão só é refeita quando `route`/`enabled` mudam.
 *
 * @param options Namespace, query key, nomes de evento e callback extra.
 */
export function useStageSocket({
  route,
  queryKey,
  eventNames,
  enabled = true,
  onEvent,
}: UseStageSocketOptions): void {
  const queryClient = useQueryClient();

  // Lidos via ref: a `queryKey` e os nomes de evento são estáticos por etapa,
  // então a conexão só é refeita quando `route`/`enabled` mudam.
  const queryKeyRef = useRef(queryKey);
  const eventNamesRef = useRef(eventNames);
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    queryKeyRef.current = queryKey;
    eventNamesRef.current = eventNames;
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    if (!enabled) return;

    const socket = createStageSocket(route);

    if (isDev) {
      socket.on(WS_EVENTS.default.connect_error, (error: Error) => {
        console.error(`WebSocket ${route} connection error:`, error);
      });
    }

    for (const name of eventNamesRef.current) {
      socket.on(name, () => {
        queryClient.invalidateQueries({ queryKey: queryKeyRef.current });
        onEventRef.current?.();
      });
    }

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [route, enabled, queryClient]);
}
