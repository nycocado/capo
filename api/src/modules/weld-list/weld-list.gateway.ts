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

/** Difunde os eventos do estágio de solda no namespace `weld-list`. */
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

  /**
   * Concluir a montagem muda o gating da solda (novas ordens ficam disponíveis):
   * reemite como sinal de invalidação para os clientes desta etapa refazerem a
   * lista. O payload é irrelevante — o cliente apenas invalida a query.
   */
  emitUpstream(): void {
    this.server.emit("statusChanged", { upstream: true });
  }
}
