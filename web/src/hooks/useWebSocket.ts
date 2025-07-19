"use client";

import { useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import { WS_EVENTS } from "@/routes";

type SocketType = ReturnType<typeof io>;

// Generic interface for event handlers
interface EventHandler<T = any> {
  eventName: string;
  handler: (data: T) => void;
}

// Generic interface for WebSocket props
interface UseWebSocketProps {
  wsRoute: string;
  eventHandlers: EventHandler[];
  enabled?: boolean;
  connectionName: string;
}

// Generic WebSocket hook supporting multiple events
export const useWebSocket = ({
  wsRoute,
  eventHandlers,
  enabled = true,
  connectionName,
}: UseWebSocketProps) => {
  const socketRef = useRef<SocketType | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasConnected = useRef(false);
  const eventHandlersRef = useRef(eventHandlers);

  // Update event handlers reference without causing re-render
  useEffect(() => {
    eventHandlersRef.current = eventHandlers;
  }, [eventHandlers]);

  // Connect to socket
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    try {
      socketRef.current = io(wsRoute, {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });

      socketRef.current.on(WS_EVENTS.default.connect, () => {
        console.log(`WebSocket ${connectionName} conectado ao servidor`);
        hasConnected.current = true;

        // Clear reconnection timeout if exists
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      socketRef.current.on(WS_EVENTS.default.disconnect, (reason: string) => {
        console.log(`WebSocket ${connectionName} desconectado:`, reason);
        hasConnected.current = false;
      });

      // Register all event handlers
      eventHandlersRef.current.forEach(({ eventName, handler }) => {
        socketRef.current?.on(eventName, (data: any) => {
          console.log(`${connectionName} evento ${eventName} recebido:`, data);
          handler(data);
        });
      });

      socketRef.current.on(WS_EVENTS.default.connect_error, (error: Error) => {
        console.error(`Erro de conexão WebSocket ${connectionName}:`, error);
      });
    } catch (error) {
      console.error(`Erro ao conectar WebSocket ${connectionName}:`, error);
    }
  }, [wsRoute, connectionName]);

  // Disconnect from socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      hasConnected.current = false;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Re-register event handlers when they change
  useEffect(() => {
    if (socketRef.current?.connected) {
      // Remove old listeners
      socketRef.current.removeAllListeners();

      // Re-add connection listeners
      socketRef.current.on(WS_EVENTS.default.connect, () => {
        console.log(`WebSocket ${connectionName} reconectado`);
        hasConnected.current = true;
      });

      socketRef.current.on(WS_EVENTS.default.disconnect, (reason: string) => {
        console.log(`WebSocket ${connectionName} desconectado:`, reason);
        hasConnected.current = false;
      });

      // Register current event handlers
      eventHandlers.forEach(({ eventName, handler }) => {
        socketRef.current?.on(eventName, (data: any) => {
          console.log(`${connectionName} evento ${eventName} recebido:`, data);
          handler(data);
        });
      });
    }
  }, [eventHandlers, connectionName]);

  // Effect to manage connection
  useEffect(() => {
    if (!enabled) {
      disconnect();
      return;
    }

    connect();

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected: hasConnected.current,
    connect,
    disconnect,
  };
};
