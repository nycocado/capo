"use client";

import { useEffect, useRef } from "react";
import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { createStageSocket } from "./socket";
import { WS_EVENTS } from "@/routes";
import type { Identifiable } from "@/domain/logic/upsertById";

/** Transformação imutável aplicada à lista em cache a cada evento. */
export type CacheUpdate<T> = (current: T[]) => T[];

/** Mapeia um evento do gateway para uma atualização do cache da lista. */
export interface StageSocketEvent<T extends Identifiable> {
  /** Nome do evento emitido pelo gateway (ver `WS_EVENTS`). */
  name: string;
  /** Constrói a transformação do cache a partir do payload recebido. */
  toUpdate: (payload: unknown) => CacheUpdate<T>;
}

export interface UseStageSocketOptions<T extends Identifiable> {
  /** URL do namespace da etapa (ver `WS_ROUTES`). */
  route: string;
  /** Query key da lista mantida em cache. */
  queryKey: QueryKey;
  /** Eventos do gateway a sincronizar com o cache. */
  events: StageSocketEvent<T>[];
  /** Quando `false`, não abre a conexão. */
  enabled?: boolean;
}

// Logs de conexão ficam atrás da flag de dev para não poluir produção.
const isDev = process.env.NODE_ENV !== "production";

/**
 * Mantém a lista em cache do TanStack Query sincronizada com os eventos em
 * tempo real de uma etapa, substituindo o antigo `useWebSocket`: cada evento
 * vira um `setQueryData` na `queryKey`, sem estado próprio no React.
 *
 * Os `events` e a `queryKey` podem mudar de referência entre renders — são
 * lidos via ref, então a conexão só é refeita quando `route`/`enabled` mudam.
 *
 * @param options Namespace, query key e eventos da etapa.
 */
export function useStageSocket<T extends Identifiable>({
  route,
  queryKey,
  events,
  enabled = true,
}: UseStageSocketOptions<T>): void {
  const queryClient = useQueryClient();

  const eventsRef = useRef(events);
  const queryKeyRef = useRef(queryKey);

  // Mantém os refs atualizados sem reabrir a conexão a cada render.
  useEffect(() => {
    eventsRef.current = events;
    queryKeyRef.current = queryKey;
  });

  useEffect(() => {
    if (!enabled) return;

    const socket = createStageSocket(route);

    if (isDev) {
      socket.on(WS_EVENTS.default.connect_error, (error: Error) => {
        console.error(`WebSocket ${route} connection error:`, error);
      });
    }

    // Os nomes de evento são estáticos por etapa; cada handler relê os refs
    // para sempre usar o `toUpdate` e a `queryKey` atuais.
    for (const { name } of eventsRef.current) {
      socket.on(name, (payload: unknown) => {
        const event = eventsRef.current.find((e) => e.name === name);
        if (!event) return;
        queryClient.setQueryData<T[]>(queryKeyRef.current, (current = []) =>
          event.toUpdate(payload)(current),
        );
      });
    }

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [route, enabled, queryClient]);
}
