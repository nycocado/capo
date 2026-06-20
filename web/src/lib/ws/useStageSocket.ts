"use client";

import { useEffect, useRef } from "react";
import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { createStageSocket } from "./socket";
import { WS_EVENTS } from "@/routes";

export interface UseStageSocketOptions {
  route: string;
  queryKey: QueryKey;
  eventNames: string[];
  enabled?: boolean;
  onEvent?: () => void;
}

const isDev = process.env.NODE_ENV !== "production";

export function useStageSocket({
  route,
  queryKey,
  eventNames,
  enabled = true,
  onEvent,
}: UseStageSocketOptions): void {
  const queryClient = useQueryClient();

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
