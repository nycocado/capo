"use client";
import { useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
// Inferindo o tipo de Socket a partir do retorno de io
type SocketType = ReturnType<typeof io>;
import { AssemblyListDto } from "@/dtos";
import { WS_EVENTS, WS_ROUTES } from "@/routes";

interface UseWebSocketAssemblyListProps {
  onAssemblyListUpdate: (updatedAssemblyList: AssemblyListDto) => void;
  enabled?: boolean;
}

export const useWebSocketAssemblyList = ({
  onAssemblyListUpdate,
  enabled = true,
}: UseWebSocketAssemblyListProps) => {
  const socketRef = useRef<SocketType | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasConnected = useRef(false);
  const onAssemblyListUpdateRef = useRef(onAssemblyListUpdate);

  // Atualizar a referência sem causar re-render
  useEffect(() => {
    onAssemblyListUpdateRef.current = onAssemblyListUpdate;
  }, [onAssemblyListUpdate]);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    try {
      socketRef.current = io(WS_ROUTES.assemblyList, {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });

      socketRef.current.on(WS_EVENTS.default.connect, () => {
        console.log("WebSocket Assembly conectado ao servidor");
        hasConnected.current = true;

        // Limpar timeout de reconexão se existir
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      socketRef.current.on(WS_EVENTS.default.disconnect, (reason: string) => {
        console.log("WebSocket Assembly desconectado:", reason);

        // Tentar reconectar após um delay se a desconexão não foi intencional
        if (reason !== "io client disconnect" && enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (enabled && !socketRef.current?.connected) {
              connect();
            }
          }, 2000);
        }
      });

      socketRef.current.on(WS_EVENTS.default.connect_error, (error: Error) => {
        console.error("Erro de conexão WebSocket Assembly:", error);
      });

      socketRef.current.on(
        WS_EVENTS.assemblyList.updateWorkStatus,
        (updatedAssemblyList: AssemblyListDto) => {
          console.log(
            "Lista de montagem atualizada via WebSocket:",
            updatedAssemblyList,
          );
          // Usar a referência atualizada
          onAssemblyListUpdateRef.current(updatedAssemblyList);
        },
      );

      socketRef.current.on(WS_EVENTS.default.error, (error: Error) => {
        console.error("Erro no WebSocket Assembly:", error);
      });
    } catch (error) {
      console.error("Erro ao criar conexão WebSocket Assembly:", error);
    }
  }, [enabled]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    hasConnected.current = false;
  }, []);

  // Conectar quando habilitado
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    isConnected: socketRef.current?.connected || false,
  };
};
