import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { OnEvent } from "@nestjs/event-emitter";
import { wrap } from "@mikro-orm/core";
import { WeldEntity } from "@modules/weld/entities";
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

  @OnEvent("weld-list.claimChanged")
  handleClaimChanged(id: number): void {
    this.server.emit("claimChanged", { id });
  }

  @OnEvent("weld.statusChanged")
  handleStatusChanged(weld: WeldEntity): void {
    this.server.emit("statusChanged", wrap(weld).toObject());
  }

  /**
   * Concluir a montagem muda o gating da solda (novas ordens ficam disponíveis):
   * reemite como sinal de invalidação para os clientes desta etapa refazerem a
   * lista. O payload é irrelevante — o cliente apenas invalida a query.
   */
  @OnEvent("joint.statusChanged")
  handleUpstreamStatusChanged(): void {
    this.server.emit("statusChanged", { upstream: true });
  }
}
