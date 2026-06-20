import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";

type WsMiddleware = (socket: Socket, next: (err?: Error) => void) => void;

function readCookie(
  header: string | undefined,
  name: string,
): string | undefined {
  if (!header) {
    return undefined;
  }
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return undefined;
}

export function createWsAuthMiddleware(jwtService: JwtService): WsMiddleware {
  return (socket, next) => {
    try {
      const token = readCookie(socket.handshake.headers.cookie, "token");
      if (!token) {
        throw new Error("Missing token");
      }
      const payload = jwtService.verify<{ sub: number; internalId: string }>(
        token,
      );
      socket.data.user = payload;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  };
}
