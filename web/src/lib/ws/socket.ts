import { io, type Socket } from "socket.io-client";

const SOCKET_OPTIONS = {
  transports: ["websocket"],
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000,
};

export function createStageSocket(route: string): Socket {
  return io(route, SOCKET_OPTIONS);
}
