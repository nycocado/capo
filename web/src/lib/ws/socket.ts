import { io, type Socket } from "socket.io-client";

// Opções compartilhadas por todos os sockets de etapa (cut/assembly/weld).
const SOCKET_OPTIONS = {
  transports: ["websocket"],
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000,
};

/**
 * Cria um socket.io para o namespace de uma etapa.
 *
 * @param route URL do namespace (ver `WS_ROUTES`).
 * @returns Socket configurado e já conectando.
 */
export function createStageSocket(route: string): Socket {
  return io(route, SOCKET_OPTIONS);
}
