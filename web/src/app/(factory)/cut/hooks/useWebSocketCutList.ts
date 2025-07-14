'use client';
import { useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
// Inferindo o tipo de Socket a partir do retorno de io
type SocketType = ReturnType<typeof io>;
import { CutListDto } from '@/dtos';
import { WS_EVENTS, WS_ROUTES } from '@/routes';

interface UseWebSocketCutListProps {
  onCutListUpdate: (updatedCutList: CutListDto) => void;
  enabled?: boolean;
}

export const useWebSocketCutList = ({
  onCutListUpdate,
  enabled = true,
}: UseWebSocketCutListProps) => {
  const socketRef = useRef<SocketType | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasConnected = useRef(false);
  const onCutListUpdateRef = useRef(onCutListUpdate);

  // Atualizar a referência sem causar re-render
  useEffect(() => {
    onCutListUpdateRef.current = onCutListUpdate;
  }, [onCutListUpdate]);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    try {
      socketRef.current = io(WS_ROUTES.cutList, {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });

      socketRef.current.on(WS_EVENTS.default.connect, () => {
        console.log('WebSocket conectado ao servidor');
        hasConnected.current = true;

        // Limpar timeout de reconexão se existir
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      socketRef.current.on(WS_EVENTS.default.disconnect, (reason: string) => {
        console.log('WebSocket desconectado:', reason);

        // Tentar reconectar após um delay se a desconexão não foi intencional
        if (reason !== 'io client disconnect' && enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (enabled && !socketRef.current?.connected) {
              connect();
            }
          }, 2000);
        }
      });

      socketRef.current.on(WS_EVENTS.default.connect_error, (error: Error) => {
        console.error('Erro de conexão WebSocket:', error);
      });

      socketRef.current.on(
        WS_EVENTS.cutList.updateWorkStatus,
        (updatedCutList: CutListDto) => {
          console.log(
            'Lista de cortes atualizada via WebSocket:',
            updatedCutList,
          );
          // Usar a referência atualizada
          onCutListUpdateRef.current(updatedCutList);
        },
      );

      socketRef.current.on(WS_EVENTS.default.error, (error: Error) => {
        console.error('Erro no WebSocket:', error);
      });
    } catch (error) {
      console.error('Erro ao criar conexão WebSocket:', error);
    }
  }, [enabled]); // Removida dependência onCutListUpdate

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

  const isConnected = useCallback(() => {
    return socketRef.current?.connected || false;
  }, []);

  const joinRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join', room);
    }
  }, []);

  const leaveRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave', room);
    }
  }, []);

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

  return {
    connect,
    disconnect,
    isConnected,
    joinRoom,
    leaveRoom,
  };
};
