import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { wrap } from "@mikro-orm/core";
import { WeldEntity } from "@modules/weld/entities/weld.entity";
import { createWsAuthMiddleware } from "@common/ws";

@WebSocketGateway({
  namespace: "weld-list",
  cors: { origin: process.env.CORS_ORIGIN ?? false, credentials: true },
})
export class WeldListGateway implements OnGatewayInit {
  @WebSocketServer() server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server): void {
    server.use(createWsAuthMiddleware(this.jwtService));
  }

  emitClaimChanged(id: number): void {
    this.server.emit("claimChanged", { id });
  }

  emitStatusChanged(weld: WeldEntity): void {
    this.server.emit("statusChanged", wrap(weld).toObject());
  }

  emitUpstream(): void {
    this.server.emit("statusChanged", { upstream: true });
  }
}
