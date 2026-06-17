import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";

type WsMiddleware = (socket: Socket, next: (err?: Error) => void) => void;

/** Lê o valor de um cookie do header `Cookie` do handshake. */
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

/**
 * Middleware de handshake do socket.io que exige um JWT válido no cookie
 * `token` — o mesmo cookie httpOnly usado pelo REST. Sem token válido a
 * ligação é recusada.
 *
 * @param jwtService Serviço usado para verificar a assinatura do token
 * @returns Middleware a registar via `server.use(...)`
 */
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
