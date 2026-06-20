import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { wrap } from "@mikro-orm/core";
import { PipeLengthEntity } from "@modules/pipe-length/entities";
import { createWsAuthMiddleware } from "@common/ws";

/** Difunde os eventos do estágio de corte no namespace `cut-list`. */
@WebSocketGateway({
  namespace: "cut-list",
  cors: { origin: process.env.CORS_ORIGIN ?? false, credentials: true },
})
export class CutListGateway implements OnGatewayInit {
  @WebSocketServer() server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server): void {
    server.use(createWsAuthMiddleware(this.jwtService));
  }

  emitClaimChanged(id: number): void {
    this.server.emit("claimChanged", { id });
  }

  emitStatusChanged(pipeLength: PipeLengthEntity): void {
    this.server.emit("statusChanged", wrap(pipeLength).toObject());
  }
}
